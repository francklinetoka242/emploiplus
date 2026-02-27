/**
 * ============================================================================
 * Route Webhook: Offres d'Emploi
 * ============================================================================
 * 
 * Webhook Supabase → POST /api/jobs/notify
 * 
 * Triggered when:
 * - Nouvelle offre d'emploi créée dans jobs table
 * - Offre modifiée
 * 
 * Workflow:
 * 1. Reçoit les données de la nouvelle offre
 * 2. Identifie les candidats pertinents (matching)
 * 3. Prépare/envoie notifications push
 * 4. Archive dans logs/analytics
 */

import express, { Request, Response } from 'express';
import { notifyJobOffers } from '../services/pushNotificationService.js';
import { pool } from '../config/database.js';

const router = express.Router();

// Initialize Supabase client (service key for admin operations)
// Supabase removed: using Postgres pool instead

interface JobWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  record?: {
    id: string;
    title: string;
    company_id: string;
    company_name?: string;
    description: string;
    required_skills?: string[];
    salary_min?: number;
    salary_max?: number;
    location?: string;
    job_type?: string; // 'full_time', 'part_time', 'contract'
    experience_level?: string;
    created_at?: string;
  };
  old_record?: Record<string, any>;
}

/**
 * POST /api/jobs/notify
 * 
 * Webhook handler for new job offers
 * 
 * Expected payload from Supabase:
 * {
 *   type: 'INSERT',
 *   record: { id, title, company_name, description, required_skills, ... }
 * }
 * 
 * Note: This can also be called manually for testing
 */
router.post('/notify', async (req: Request, res: Response) => {
  try {
    const payload: JobWebhookPayload = req.body;

    console.log('[JobWebhook] Received webhook', {
      type: payload.type,
      jobId: payload.record?.id,
      title: payload.record?.title,
    });

    // Validate payload
    if (!payload.record) {
      return res.status(400).json({
        success: false,
        error: 'Missing record in webhook payload',
      });
    }

    const job = payload.record;

    // Only process INSERT events (new jobs)
    // UPDATE and DELETE can be handled separately if needed
    if (payload.type !== 'INSERT') {
      console.log('[JobWebhook] Skipping non-INSERT event:', payload.type);
      return res.status(200).json({
        success: true,
        message: `Event ${payload.type} processed (not sent for notifications)`,
      });
    }

    // =========================================================================
    // STEP 1: Find matching candidates
    // =========================================================================
    
    const matchingCandidates = await findMatchingCandidates(job);
    console.log(`[JobWebhook] Found ${matchingCandidates.length} matching candidates`);

    // =========================================================================
    // STEP 2: Send notifications asynchronously
    // =========================================================================
    
    // Don't await - fire and forget for performance
    sendNotificationsAsync(job, matchingCandidates)
      .catch(err => console.error('[JobWebhook] Async notification error:', err));

    // =========================================================================
    // STEP 3: Archive webhook in analytics
    // =========================================================================
    
    archiveWebhookEvent(payload, matchingCandidates.length)
      .catch(err => console.error('[JobWebhook] Archive error:', err));

    // =========================================================================
    // RESPOND IMMEDIATELY (don't wait for async operations)
    // =========================================================================
    
    return res.status(202).json({
      success: true,
      message: 'Job notification queued',
      data: {
        jobId: job.id,
        matchingCandidates: matchingCandidates.length,
        status: 'processing',
      },
    });

  } catch (error) {
    console.error('[JobWebhook] Error:', error);
    return res.status(500).json({
      success: false,
      error: (error as any).message || 'Webhook processing failed',
    });
  }
});

/**
 * Find candidates that match the job offer
 * 
 * Matching logic:
 * 1. Skills match (50% of score)
 * 2. Experience level match (30%)
 * 3. Location match (20%)
 * 
 * Only return candidates with >60% match
 */
async function findMatchingCandidates(
  job: JobWebhookPayload['record']
): Promise<string[]> {
  try {
    if (!job) return [];

    // Query candidates based on job requirements
    const { rows: candidates } = await pool.query(
      `SELECT id, skills, experience_level, location FROM profiles WHERE user_type = 'candidate' AND account_status = 'active'`,
      []
    );

    if (!candidates || candidates.length === 0) {
      return [];
    }
    // Filter candidates by matching criteria
    const matchedIds = candidates
      .filter((candidate: any) => {
        // Calculate match score
        let score = 0;

        // 1. Skills match (50%)
        if (job.required_skills && candidate.skills) {
          const skillsArray = Array.isArray(candidate.skills)
            ? candidate.skills
            : (typeof candidate.skills === 'string'
                ? candidate.skills.split(',').map((s: string) => s.trim())
                : []);

          const matchedSkills = job.required_skills.filter((s: string) =>
            skillsArray.some((cs: string) =>
              cs.toLowerCase().includes(s.toLowerCase())
            )
          );

          const skillsScore = (matchedSkills.length / job.required_skills.length) * 100;
          score += skillsScore * 0.5;
        } else if (job.required_skills) {
          score += 0; // No skills on candidate profile
        } else {
          score += 50; // No required skills on job
        }

        // 2. Experience level match (30%)
        if (job.experience_level && candidate.experience_level) {
          const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead'];
          const jobLevelIndex = experienceLevels.indexOf(job.experience_level.toLowerCase());
          const candidateLevelIndex = experienceLevels.indexOf(
            candidate.experience_level.toLowerCase()
          );

          // Allow candidates with equal or higher experience
          if (candidateLevelIndex >= jobLevelIndex) {
            score += 30;
          } else {
            score += Math.max(0, 30 - (jobLevelIndex - candidateLevelIndex) * 10);
          }
        } else {
          score += 30; // No experience match required
        }

        // 3. Location match (20%)
        if (job.location && candidate.location) {
          if (candidate.location.toLowerCase().includes(job.location.toLowerCase())) {
            score += 20;
          } else {
            score += 10; // Partial match or remote friendly
          }
        } else {
          score += 20; // No location requirement
        }

        // Only return if match score > 60%
        return score > 60;
      })
      .map((c: any) => c.id);

    return matchedIds;

  } catch (error) {
    console.error('[JobMatching] Error:', error);
    return [];
  }
}

/**
 * Send notifications asynchronously (fire and forget)
 * 
 * Returns immediately without waiting for completion
 */
async function sendNotificationsAsync(
  job: JobWebhookPayload['record'],
  candidateIds: string[]
): Promise<void> {
  try {
    if (!job || candidateIds.length === 0) {
      console.log('[JobNotifications] No candidates to notify');
      return;
    }

    // Send via notification service
    // This is async and won't block the main request
    const result = await notifyJobOffers(
      {
        id: job.id,
        title: job.title || 'Offre d\'emploi',
        company: job.company_name || 'Entreprise',
        description: job.description || '',
        requiredSkills: job.required_skills || [],
      },
      candidateIds
    );

    console.log('[JobNotifications] ✅ Notifications sent', {
      jobId: job.id,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
    });

  } catch (error) {
    console.error('[JobNotifications] Error:', error);
    // Don't re-throw - this is async operation
  }
}

/**
 * Archive webhook event for analytics
 */
async function archiveWebhookEvent(
  payload: JobWebhookPayload,
  matchedCandidatesCount: number
): Promise<void> {
  try {
    try {
      await pool.query(
        `INSERT INTO webhook_logs (event_type, payload, matched_candidates_count, created_at)
         VALUES ($1, $2, $3, $4)`,
        ['job_notify', JSON.stringify(payload), matchedCandidatesCount, new Date().toISOString()]
      );
      console.log('[WebhookArchive] ✅ Event archived');
    } catch (err) {
      console.error('[WebhookArchive] Error:', err);
    }

  } catch (error) {
    console.error('[WebhookArchive] Unexpected error:', error);
  }
}

/**
 * GET /api/jobs/notify/status
 * 
 * Check webhook service status
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'job_webhook',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/jobs/notify/test
 * 
 * Test webhook with sample data
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const testPayload: JobWebhookPayload = {
      type: 'INSERT',
      record: {
        id: 'test-job-' + Date.now(),
        title: 'Senior React Developer',
        company_id: 'test-company',
        company_name: 'TechCorp',
        description: 'We are looking for a senior React developer',
        required_skills: ['React', 'TypeScript', 'Node.js'],
        salary_min: 70000,
        salary_max: 100000,
        location: 'Paris',
        job_type: 'full_time',
        experience_level: 'senior',
        created_at: new Date().toISOString(),
      },
    };

    console.log('[JobWebhook Test] Simulating webhook...');

    // Simulate webhook processing
    const mockReq = Object.assign(req, { body: testPayload }) as Request;
    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => {
          console.log('[JobWebhook Test] Response:', data);
          return data;
        },
      }),
      json: (data: any) => data,
    } as any;

    // Execute webhook handler inline for test
    const payload: JobWebhookPayload = testPayload;

    if (!payload.record) {
      return res.status(400).json({
        success: false,
        error: 'Missing record in webhook payload',
      });
    }

    const job = payload.record;

    if (payload.type !== 'INSERT') {
      return res.status(200).json({
        success: true,
        message: `Event ${payload.type} processed (not sent for notifications)`,
      });
    }

    const matchingCandidates = await findMatchingCandidates(job);
    console.log(`[JobWebhook Test] Found ${matchingCandidates.length} matching candidates`);

    return res.json({
      success: true,
      message: 'Test webhook completed',
      payload: testPayload,
      matchedCandidates: matchingCandidates.length,
    });

  } catch (error) {
    console.error('[JobWebhook Test] Error:', error);
    return res.status(500).json({
      success: false,
      error: (error as any).message,
    });
  }
});

export default router;
