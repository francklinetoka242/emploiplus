/**
 * ============================================================================
 * Webhook Routes - Job Postings & Matching
 * ============================================================================
 *
 * Endpoints:
 * - POST /api/webhooks/jobs/notify  - Nouvelle offre d'emploi
 * - POST /api/webhooks/matching/update - Mise à jour profil/CV (recalc matching)
 *
 * Sécurité: Signature HMAC SHA256 vérifiée
 * Processing: Queue asynchrone via BullMQ
 */

import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { verifyWebhookSecret } from '../middleware/auth.js';
import { notificationQueue } from '../services/notificationQueue.js';

// ============================================================================
// SETUP
// ============================================================================

const router = Router();

// Initialize Supabase client with explicit env var validation
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.warn('[webhooks] Warning: SUPABASE_URL is not configured');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[webhooks] Warning: SUPABASE_SERVICE_ROLE_KEY is not configured');
}

const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || ''
);

// ============================================================================
// TYPES
// ============================================================================

interface JobPostingWebhook {
  id: string;
  title: string;
  description: string;
  company_id: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  job_type: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  required_skills: string[];
  experience_level: 'Junior' | 'Intermédiaire' | 'Senior';
  created_at: string;
}

interface MatchingCandidate {
  id: string;
  email: string;
  push_token?: string;
  skills: string[];
  experience_level: 'Junior' | 'Intermédiaire' | 'Senior';
  target_salary_min?: number;
}

// ============================================================================
// POST /api/webhooks/jobs/notify - Nouvelle offre d'emploi
// ============================================================================

/**
 * Webhook Supabase:
 * Event: INSERT on public.jobs
 * 
 * Processus:
 * 1. Valider la signature HMAC
 * 2. Extraire les données de l'offre
 * 3. Matcher les candidats pertinents
 * 4. Ajouter à la queue de notifications
 */
router.post('/webhooks/jobs/notify', verifyWebhookSecret, async (req: Request, res: Response) => {
  try {
    const job: JobPostingWebhook = req.body.record || req.body;
    
    console.log(`[Webhook Jobs] New job posting: ${job.id} (${job.title})`);

    // ======================================================================
    // Step 1: Valider les données
    // ======================================================================
    if (!job.id || !job.title || !job.company_id) {
      res.status(400).json({ error: 'Missing required job fields' });
      return;
    }

    // ======================================================================
    // Step 2: Récupérer les candidats pertinents
    // ======================================================================
    console.log(`[Webhook Jobs] Searching for candidates matching: ${job.required_skills.join(', ')}`);

    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, email, push_token, skills, experience_level, target_salary_min')
      .contains('skills', job.required_skills) // Au moins une compétence commune
      .lte('experience_level', job.experience_level) // Candidats aptes au niveau
      .lte('target_salary_min', job.salary_max || 100000) // Pas de désaccord salarial
      .eq('is_active', true)
      .eq('notifications_enabled', true)
      .limit(5000); // Limiter les candidats pour éviter la saturation

    if (candidatesError) {
      console.error('[Webhook Jobs] Error fetching candidates:', candidatesError);
      res.status(500).json({ error: 'Failed to fetch candidates' });
      return;
    }

    const matchingCandidates = candidates || [];
    console.log(`[Webhook Jobs] Found ${matchingCandidates.length} matching candidates`);

    // ======================================================================
    // Step 3: Ajouter à la queue de notifications
    // ======================================================================
    const notificationTitle = `Nouvelle offre d'emploi: ${job.title}`;
    const notificationBody = `${job.company_id} recherche ${job.experience_level}`;

    try {
      await notificationQueue.add(
        'batch-job-notification',
        {
          jobId: job.id,
          jobTitle: job.title,
          companyId: job.company_id,
          location: job.location,
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          jobType: job.job_type,
          requiredSkills: job.required_skills,
          experienceLevel: job.experience_level,
          candidateIds: matchingCandidates.map(c => c.id),
          notificationTitle,
          notificationBody,
          // Metadata pour tracking
          createdAt: new Date().toISOString(),
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        }
      );

      console.log(`[Webhook Jobs] Job notification added to queue`);

      // ======================================================================
      // Step 4: Mettre à jour le statut de la notification
      // ======================================================================
      await supabase
        .from('jobs')
        .update({
          notification_status: 'queued',
          notification_sent_at: new Date().toISOString(),
          matching_candidates_count: matchingCandidates.length,
        })
        .eq('id', job.id);

    } catch (queueError) {
      console.error('[Webhook Jobs] Error queueing notification:', queueError);
      res.status(500).json({ error: 'Failed to queue notification' });
      return;
    }

    // ======================================================================
    // Step 5: Répondre avec succès
    // ======================================================================
    res.status(200).json({
      success: true,
      jobId: job.id,
      candidatesMatched: matchingCandidates.length,
      message: `Job notification queued for ${matchingCandidates.length} candidates`,
    });

  } catch (error) {
    console.error('[Webhook Jobs] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// POST /api/webhooks/matching/update - Mise à jour du profil candidat
// ============================================================================

/**
 * Webhook Supabase:
 * Event: UPDATE on public.candidates (skills, experience_level)
 * 
 * Processus:
 * 1. Valider la signature
 * 2. Récupérer les offres actives pertinentes
 * 3. Mettre à jour le matching score
 * 4. Notifier si nouvel intérêt potentiel
 */
router.post('/webhooks/matching/update', verifyWebhookSecret, async (req: Request, res: Response) => {
  try {
    const candidateRecord = req.body.record || req.body;
    const oldRecord = req.body.old_record;

    const candidateId = candidateRecord.id;
    const skillsChanged = oldRecord?.skills !== candidateRecord.skills;
    const experienceChanged = oldRecord?.experience_level !== candidateRecord.experience_level;

    console.log(`[Webhook Matching] Updating profile for candidate: ${candidateId}`);

    if (!skillsChanged && !experienceChanged) {
      console.log('[Webhook Matching] No relevant changes, skipping update');
      res.status(200).json({ message: 'No changes to process' });
      return;
    }

    // ======================================================================
    // Step 1: Trouver les offres d'emploi actives
    // ======================================================================
    const { data: activeJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, required_skills, experience_level, salary_min, salary_max')
      .eq('status', 'active')
      .limit(500);

    if (jobsError) {
      console.error('[Webhook Matching] Error fetching jobs:', jobsError);
      res.status(500).json({ error: 'Failed to fetch jobs' });
      return;
    }

    // ======================================================================
    // Step 2: Calculer les nouveaux matchings
    // ======================================================================
    const newMatches = (activeJobs || []).filter(job => {
      const commonSkills = job.required_skills.filter((skill: string) =>
        candidateRecord.skills.includes(skill)
      );
      
      return (
        commonSkills.length > 0 && // Au moins une compétence commune
        candidateRecord.experience_level >= job.experience_level // Niveau suffisant
      );
    });

    console.log(`[Webhook Matching] Found ${newMatches.length} newly matching jobs`);

    // ======================================================================
    // Step 3: Notifier pour les nouveaux matchings
    // ======================================================================
    if (newMatches.length > 0) {
      try {
        // Récupérer les informations du candidat
        const { data: candidate } = await supabase
          .from('candidates')
          .select('email, push_token')
          .eq('id', candidateId)
          .single();

        if (candidate && candidate.push_token) {
          await notificationQueue.add(
            'candidate-matching-update',
            {
              candidateId,
              candidateEmail: candidate.email,
              jobIds: newMatches.map(j => j.id),
              jobCount: newMatches.length,
              notificationTitle: `${newMatches.length} nouvelles opportunités correspondent à votre profil`,
              notificationBody: 'Vérifiez les offres d\'emploi qui vous conviennent',
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
            }
          );

          console.log(`[Webhook Matching] Notification queued for candidate: ${candidateId}`);
        }

      } catch (notificationError) {
        console.error('[Webhook Matching] Error queuing notification:', notificationError);
        // Ne pas échouer si la notification échoue
      }
    }

    // ======================================================================
    // Step 4: Mettre à jour le matching score dans la DB
    // ======================================================================
    try {
      // Créer des entrées dans candidate_job_matches
      for (const job of newMatches) {
        const commonSkills = job.required_skills.filter((skill: string) =>
          candidateRecord.skills.includes(skill)
        );

        const matchScore = Math.min(
          (commonSkills.length / job.required_skills.length) * 100,
          100
        );

        await supabase
          .from('candidate_job_matches')
          .upsert(
            {
              candidate_id: candidateId,
              job_id: job.id,
              match_score: matchScore,
              common_skills: commonSkills,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'candidate_id,job_id' }
          );
      }

      console.log(`[Webhook Matching] Updated ${newMatches.length} match records`);

    } catch (updateError) {
      console.error('[Webhook Matching] Error updating matches:', updateError);
      // Continuer même si l'update échoue
    }

    // ======================================================================
    // Step 5: Répondre
    // ======================================================================
    res.status(200).json({
      success: true,
      candidateId,
      newMatchesCount: newMatches.length,
      message: `Profile updated. Found ${newMatches.length} new job matches`,
    });

  } catch (error) {
    console.error('[Webhook Matching] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// POST /api/webhooks/test - Test endpoint
// ============================================================================

/**
 * Endpoint de test pour vérifier la signature webhook
 */
router.post('/webhooks/test', verifyWebhookSecret, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Webhook signature verified successfully',
    timestamp: new Date().toISOString(),
  });
});

export default router;
