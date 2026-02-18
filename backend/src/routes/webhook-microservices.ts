/**
 * ============================================================================
 * Webhook Routes - Job Analysis, Post Moderation, Activity Scoring
 * ============================================================================
 *
 * Trois routes microservices spécialisées:
 * - POST /api/jobs/analyze       - Analyser offre + trouver candidats + ajouter tâche notification
 * - POST /api/posts/moderate     - Analyser texte + modérer + mettre à jour post
 * - POST /api/activity/score     - Recalculer rank_score du post
 *
 * Sécurité: Header x-webhook-secret vérifié sur chaque route
 * Performance: Répond 200 OK en < 1s, traite en background
 */

import { Router, Request, Response, NextFunction } from 'express';
import { detectSpam, validatePost, getModerationAction } from '../services/moderationService.js';

// ============================================================================
// SETUP
// ============================================================================

const router = Router();

// Initialize Supabase client with explicit env var validation
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.warn('[Webhook] Warning: SUPABASE_URL is not configured in environment variables');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Webhook] Warning: SUPABASE_SERVICE_ROLE_KEY is not configured in environment variables');
}

const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || ''
);

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  console.log('[Webhook] ✓ Supabase client initialized successfully');
}

// ============================================================================
// MIDDLEWARE: Webhook Secret Verification
// ============================================================================

const verifyWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  const headerSecret = req.headers['x-webhook-secret'] as string;

  if (!secret) {
    console.error('[Webhook] SUPABASE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!headerSecret || headerSecret !== secret) {
    console.warn('[Webhook] Invalid secret provided');
    return res.status(401).json({ error: 'Unauthorized: Invalid webhook secret' });
  }

  console.log('[Webhook] Secret verified ✓');
  next();
};

// ============================================================================
// POST /api/jobs/analyze
// ============================================================================
// Récupère l'offre, trouve candidats matchant, ajoute tâche notification BullMQ

router.post('/jobs/analyze', verifyWebhookSecret, (req: Request, res: Response) => {
  const startTime = Date.now();
  const { jobId, title, description, requiredSkills, experienceLevel, company_id } = req.body;

  // Validation rapide
  if (!jobId || !title) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: jobId, title',
      timestamp: new Date().toISOString(),
    });
  }

  const processingId = `job-${jobId}-${Date.now()}`;
  
  // Réponse immédiate (< 100ms)
  res.status(200).json({
    success: true,
    jobId,
    processingId,
    message: 'Job analysis started',
    timestamp: new Date().toISOString(),
  });

  console.log(`[API] /jobs/analyze - Job ${jobId}: "${title}" (processing: ${processingId})`);

  // Traitement en background via setImmediate
  setImmediate(async () => {
    try {
      console.log(`[Worker] Job ${jobId} - Finding matching candidates...`);

      const skills = Array.isArray(requiredSkills) ? requiredSkills : [];
      const expLevel = experienceLevel || 'intermediate';

      // Étape 1: Récupérer l'offre complète de Supabase
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        console.error(`[Worker] Job ${jobId} not found`);
        return;
      }

      console.log(`[Worker] Job ${jobId} retrieved: "${job.title}"`);

      // Étape 2: Chercher candidats qui matchent les compétences
      const { data: candidates, error: candError } = await supabase
        .from('users')
        .select('id, email, name, skills, experience_level')
        .eq('role', 'candidate')
        .limit(1000);

      if (candError) {
        console.error(`[Worker] Error fetching candidates:`, candError);
        return;
      }

      console.log(`[Worker] Found ${candidates?.length || 0} total candidates to process`);

      const matches: any[] = [];

      // Étape 3: Calculer le matching score pour chaque candidat
      if (candidates && candidates.length > 0) {
        for (const candidate of candidates) {
          const candidateSkills = Array.isArray(candidate.skills)
            ? candidate.skills.map((s: any) => (typeof s === 'string' ? s : s.name).toLowerCase())
            : [];

          const requiredSkillsLower = skills.map((s: string) => s.toLowerCase());

          // Compétences matchées
          const matchedSkills = candidateSkills.filter((s: string) =>
            requiredSkillsLower.includes(s)
          );

          if (matchedSkills.length > 0) {
            // Score: % de compétences requises possédées
            const matchScore = Math.round(
              (matchedSkills.length / Math.max(requiredSkillsLower.length, 1)) * 100
            );

            // Bonus si expérience correspond
            let finalScore = matchScore;
            if (candidate.experience_level?.toLowerCase() === expLevel.toLowerCase()) {
              finalScore += 10;
            }

            matches.push({
              job_id: jobId,
              candidate_id: candidate.id,
              match_score: Math.min(finalScore, 100),
              matched_skills: matchedSkills.join(', '),
              missing_skills: requiredSkillsLower
                .filter((s: string) => !candidateSkills.includes(s))
                .join(', '),
            });
          }
        }
      }

      console.log(`[Worker] Calculated ${matches.length} matches for job ${jobId}`);

      // Étape 4: Insérer les matchs dans job_matches
      if (matches.length > 0) {
        const { error: insertError } = await supabase
          .from('job_matches')
          .insert(matches);

        if (insertError) {
          console.error(`[Worker] Error inserting matches:`, insertError);
        } else {
          console.log(`[Worker] Inserted ${matches.length} job matches ✓`);
        }
      }

      // Étape 5: Ajouter une tâche BullMQ pour les notifications
      try {
        const { jobAnalysisQueue } = await import('../services/microserviceQueues.js');

        for (const match of matches.slice(0, 10)) {
          const jobAdded = await jobAnalysisQueue.add('notify-match', {
            jobId,
            candidateId: match.candidate_id,
            matchScore: match.match_score,
            jobTitle: job.title,
            company: job.company || 'Unknown Company',
          });

          console.log(`[Worker] Added notification job ${jobAdded.id} for candidate ${match.candidate_id}`);
        }
      } catch (queueError) {
        console.error(`[Worker] Error adding notification jobs:`, queueError);
      }

      // Étape 6: Mettre à jour le job avec le statut "analysé"
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          analysis_completed: true,
          candidates_matched: matches.length,
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (updateError) {
        console.error(`[Worker] Error updating job:`, updateError);
      } else {
        console.log(`[Worker] Updated job ${jobId} with ${matches.length} matches ✓`);
      }

      const elapsed = Date.now() - startTime;
      console.log(`[Worker] Job ${jobId} analysis complete (${elapsed}ms)`);

    } catch (error) {
      console.error(`[Worker] Unexpected error for job ${jobId}:`, error);
    }
  });
});

// ============================================================================
// POST /api/posts/moderate
// ============================================================================
// Analyse le texte, valide via filtre modération, met à jour le post

router.post('/posts/moderate', verifyWebhookSecret, (req: Request, res: Response) => {
  const startTime = Date.now();
  const { postId, content, author_id } = req.body;

  if (!postId || !content) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: postId, content',
      timestamp: new Date().toISOString(),
    });
  }

  const processingId = `post-${postId}-${Date.now()}`;

  // Réponse immédiate
  res.status(200).json({
    success: true,
    postId,
    processingId,
    message: 'Post moderation started',
    timestamp: new Date().toISOString(),
  });

  console.log(`[API] /posts/moderate - Post ${postId} (processing: ${processingId})`);

  // Traitement en background
  setImmediate(async () => {
    try {
      console.log(`[Worker] Post ${postId} - Running moderation checks...`);

      // Étape 1: Valider le post basiquement
      const { valid, errors } = validatePost(content, author_id);

      if (!valid) {
        console.log(`[Worker] Post ${postId} validation failed:`, errors);

        const { error: updateError } = await supabase
          .from('posts')
          .update({
            is_flagged: true,
            flag_reason: 'Invalid content: ' + errors.join('; '),
            moderated_at: new Date().toISOString(),
          })
          .eq('id', postId);

        if (updateError) console.error(`[Worker] Error flagging post:`, updateError);
        return;
      }

      // Étape 2: Détecter le spam
      const { isSpam, score: spamScore, reasons: spamReasons } = detectSpam(content);

      console.log(`[Worker] Post ${postId} spam detection: score=${spamScore}, spam=${isSpam}`);
      if (spamReasons.length > 0) {
        console.log(`[Worker] Spam reasons:`, spamReasons);
      }

      // Étape 3: Déterminer l'action de modération
      const { action, reason } = getModerationAction(spamScore, 0);

      console.log(`[Worker] Post ${postId} moderation action: ${action} (${reason})`);

      // Étape 4: Mettre à jour le post dans Supabase
      const updateData: any = {
        moderated_at: new Date().toISOString(),
        spam_score: spamScore,
      };

      if (action === 'approve') {
        updateData.is_flagged = false;
        updateData.moderation_status = 'approved';
      } else if (action === 'flag') {
        updateData.is_flagged = true;
        updateData.flag_reason = `Spam: ${reason} (score: ${spamScore})`;
        updateData.moderation_status = 'flagged';
      } else if (action === 'hide') {
        updateData.is_flagged = true;
        updateData.flag_reason = `Suspicious: ${reason} (score: ${spamScore})`;
        updateData.is_visible = false;
        updateData.moderation_status = 'hidden';
      } else if (action === 'remove') {
        updateData.is_flagged = true;
        updateData.flag_reason = reason;
        updateData.is_visible = false;
        updateData.moderation_status = 'removed';
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId);

      if (updateError) {
        console.error(`[Worker] Error updating post:`, updateError);
      } else {
        console.log(`[Worker] Updated post ${postId} status: ${updateData.moderation_status} ✓`);
      }

      const elapsed = Date.now() - startTime;
      console.log(`[Worker] Post ${postId} moderation complete (${elapsed}ms, action: ${action})`);

    } catch (error) {
      console.error(`[Worker] Unexpected error for post ${postId}:`, error);
    }
  });
});

// ============================================================================
// POST /api/activity/score
// ============================================================================
// Recalcule le rank_score du post basé sur le nombre de likes, met à jour

router.post('/activity/score', verifyWebhookSecret, (req: Request, res: Response) => {
  const startTime = Date.now();
  const { postId, action, userId } = req.body;

  if (!postId || !action) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: postId, action',
      timestamp: new Date().toISOString(),
    });
  }

  const processingId = `score-${postId}-${Date.now()}`;

  // Réponse immédiate
  res.status(200).json({
    success: true,
    postId,
    processingId,
    message: 'Activity scoring started',
    timestamp: new Date().toISOString(),
  });

  console.log(`[API] /activity/score - Post ${postId}, action: ${action} (processing: ${processingId})`);

  // Traitement en background
  setImmediate(async () => {
    try {
      console.log(`[Worker] Post ${postId} - Calculating rank score from engagement...`);

      // Étape 1: Récupérer le post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        console.error(`[Worker] Post ${postId} not found`);
        return;
      }

      // Étape 2: Compter les likes, comments, shares
      const { count: likesCount, error: likesError } = await supabase
        .from('post_likes')
        .select('id', { count: 'exact' })
        .eq('post_id', postId);

      const { count: commentsCount, error: commentsError } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('post_id', postId);

      const { count: sharesCount, error: sharesError } = await supabase
        .from('post_shares')
        .select('id', { count: 'exact' })
        .eq('post_id', postId);

      if (likesError || commentsError || sharesError) {
        console.error('[Worker] Error counting engagement');
        return;
      }

      const likes = likesCount || 0;
      const comments = commentsCount || 0;
      const shares = sharesCount || 0;

      console.log(
        `[Worker] Post ${postId} engagement: ${likes} likes, ${comments} comments, ${shares} shares`
      );

      // Étape 3: Calculer le rank_score
      const createdAt = new Date(post.created_at);
      const ageInHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

      // Bonus de récence
      let recencyBonus = 0;
      if (ageInHours < 1) {
        recencyBonus = 100;
      } else if (ageInHours < 24) {
        recencyBonus = 75;
      } else if (ageInHours < 7 * 24) {
        recencyBonus = 50;
      } else {
        recencyBonus = 25;
      }

      const engagementScore = likes * 5 + comments * 10 + shares * 15;
      const rankScore = Math.round((engagementScore + recencyBonus) / 2);

      console.log(
        `[Worker] Post ${postId} calculated rank_score: ${rankScore} (engagement: ${engagementScore}, recency: ${recencyBonus})`
      );

      // Étape 4: Mettre à jour le post
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          rank_score: rankScore,
          likes_count: likes,
          comments_count: comments,
          shares_count: shares,
          engagement_updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      if (updateError) {
        console.error(`[Worker] Error updating rank_score:`, updateError);
      } else {
        console.log(`[Worker] Updated post ${postId} rank_score: ${rankScore} ✓`);
      }

      // Étape 5: Enregistrer l'activité
      if (userId) {
        const pointsMap: Record<string, number> = {
          'like': 5,
          'comment': 10,
          'share': 15,
          'view': 1,
        };

        const points = pointsMap[action] || 1;

        const { error: logError } = await supabase
          .from('activity_logs')
          .insert({
            user_id: userId,
            action,
            target_type: 'post',
            target_id: postId,
            points_earned: points,
          });

        if (logError) {
          console.error(`[Worker] Error logging activity:`, logError);
        } else {
          console.log(`[Worker] Logged activity: ${action} by user ${userId} (${points}pts)`);
        }
      }

      const elapsed = Date.now() - startTime;
      console.log(`[Worker] Post ${postId} scoring complete (${elapsed}ms)`);

    } catch (error) {
      console.error(`[Worker] Unexpected error for post ${postId}:`, error);
    }
  });
});

// ============================================================================
// Health check
// ============================================================================

router.get('/health/webhooks', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    webhooks: ['jobs/analyze', 'posts/moderate', 'activity/score'],
    timestamp: new Date().toISOString(),
  });
});

export default router;
