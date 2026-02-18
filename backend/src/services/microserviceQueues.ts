/**
 * ============================================================================
 * Microservice Queues - BullMQ Job Processing
 * ============================================================================
 *
 * Trois queues spécialisées:
 * - jobAnalysisQueue    - Analyze job postings
 * - postModerationQueue - Moderate posts
 * - activityScoringQueue- Score user engagement
 *
 * Chaque queue a un worker qui traite les jobs en arrière-plan
 */

import { Queue, Worker } from 'bullmq';
import { redisConfig } from '../config/redis.js';

// ============================================================================
// REDIS CONNECTION
// ============================================================================

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.warn('[microserviceQueues] Warning: SUPABASE_URL is not configured');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[microserviceQueues] Warning: SUPABASE_SERVICE_ROLE_KEY is not configured');
}

const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || ''
);

// ============================================================================
// QUEUE DEFINITIONS
// ============================================================================

/**
 * Queue 1: Job Analysis
 * Analyser les nouvelles offres d'emploi
 */
export const jobAnalysisQueue = new Queue('job-analysis', {
  connection: redisConfig as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

/**
 * Queue 2: Post Moderation
 * Modérer les posts du newsfeed
 */
export const postModerationQueue = new Queue('post-moderation', {
  connection: redisConfig as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

/**
 * Queue 3: Activity Scoring
 * Calculer les scores d'engagement
 */
export const activityScoringQueue = new Queue('activity-scoring', {
  connection: redisConfig as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

/**
 * Queue 4: Job Match Notifications
 * Envoyer les notifications aux candidats
 */
export const jobNotificationQueue = new Queue('job-notifications', {
  connection: redisConfig as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// ============================================================================
// WORKER 1: Job Analysis
// ============================================================================

export const jobAnalysisWorker = new Worker(
  'job-analysis',
  async (job) => {
    const { jobId, title, description, requiredSkills, experienceLevel } = job.data;

    console.log(`[Worker] Analyzing job ${jobId}: ${title}`);

    try {
      // Étape 1: Extraire les compétences
      const extractedSkills = requiredSkills || [];
      console.log(`[Worker] Extracted skills: ${extractedSkills.join(', ')}`);

      // Étape 2: Trouver les candidats avec matching
      const { data: candidates, error: queryError } = await supabase
        .from('candidates')
        .select('id, email, skills, experience_level')
        .contains('skills', extractedSkills)
        .lte('experience_level', experienceLevel)
        .limit(100);

      if (queryError) throw queryError;

      console.log(`[Worker] Found ${candidates?.length || 0} candidates`);

      // Étape 3: Créer les entrées de matching
      if (candidates && candidates.length > 0) {
        const matches = candidates.map(candidate => {
          // Calculer le score
          const commonSkills = candidate.skills.filter((s: string) =>
            extractedSkills.includes(s)
          );
          const matchScore = (commonSkills.length / extractedSkills.length) * 100;

          return {
            job_id: jobId,
            candidate_id: candidate.id,
            match_score: Math.round(matchScore),
            created_at: new Date().toISOString(),
          };
        });

        const { error: insertError } = await supabase
          .from('job_matches')
          .insert(matches);

        if (insertError) throw insertError;

        console.log(`[Worker] Created ${matches.length} match records`);
      }

      // Étape 4: Mettre à jour le job
      await supabase
        .from('jobs')
        .update({
          analysis_completed: true,
          analysis_completed_at: new Date().toISOString(),
          candidates_matched: candidates?.length || 0,
        })
        .eq('id', jobId);

      return {
        success: true,
        jobId,
        candidatesMatched: candidates?.length || 0,
      };

    } catch (error) {
      console.error(`[Worker] Error analyzing job ${jobId}:`, error);
      throw error; // Re-throw pour retry
    }
  },
  {
    connection: redisConfig as any,
    concurrency: 5, // Traiter 5 jobs en parallèle
  }
);

// ============================================================================
// WORKER 2: Post Moderation
// ============================================================================

export const postModerationWorker = new Worker(
  'post-moderation',
  async (job) => {
    const { postId, content, images, links } = job.data;

    console.log(`[Worker] Moderating post ${postId}`);

    try {
      let isFlagged = false;
      let flagReason = '';

      // Étape 1: Vérifier spam
      const spamPatterns = [
        /click\s+here/i,
        /buy\s+now/i,
        /free\s+money/i,
        /casino/i,
        /bitcoin/i,
      ];

      for (const pattern of spamPatterns) {
        if (pattern.test(content)) {
          isFlagged = true;
          flagReason = 'Suspected spam';
          break;
        }
      }

      // Étape 2: Vérifier liens (en production: utiliser Google Safe Browsing API)
      if (links && links.length > 0) {
        console.log(`[Worker] Checking ${links.length} links...`);
        // TODO: Appeler API de vérification
      }

      // Étape 3: Analyser les images (en production: utiliser Google Vision ou AWS Rekognition)
      if (images && images.length > 0) {
        console.log(`[Worker] Checking ${images.length} images...`);
        // TODO: Appeler API de vision
      }

      // Étape 4: Mettre à jour le post
      await supabase
        .from('posts')
        .update({
          is_flagged: isFlagged,
          flag_reason: isFlagged ? flagReason : null,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      return {
        success: true,
        postId,
        isFlagged,
        flagReason,
      };

    } catch (error) {
      console.error(`[Worker] Error moderating post ${postId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConfig as any,
    concurrency: 10, // Plus rapide que job analysis
  }
);

// ============================================================================
// WORKER 3B: Job Match Notifications
// ============================================================================

export const jobNotificationWorker = new Worker(
  'job-notifications',
  async (job) => {
    const { jobId, candidateId, matchScore, jobTitle, company } = job.data;

    console.log(`[Worker] Sending match notification: candidate ${candidateId} for job "${jobTitle}"`);

    try {
      // Récupérer les détails du candidat
      const { data: candidate, error: candError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', candidateId)
        .single();

      if (candError || !candidate) {
        console.error(`[Worker] Candidate ${candidateId} not found`);
        throw new Error(`Candidate ${candidateId} not found`);
      }

      // En production: envoyer email/push notification
      console.log(`[Worker] Would send notification to ${candidate.email}: "Match found! ${jobTitle} at ${company} (${matchScore}%)"`);

      // Optionnel: Enregistrer dans une table de notifications
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: candidateId,
          type: 'job_match',
          title: `New Job Match: ${jobTitle}`,
          message: `You match ${matchScore}% for this role at ${company}`,
          data: { jobId, matchScore },
          is_read: false,
        });

      if (notifError) console.error(`[Worker] Error saving notification:`, notifError);

      return {
        success: true,
        candidateId,
        jobId,
        email: candidate.email,
      };

    } catch (error) {
      console.error(`[Worker] Error sending notification:`, error);
      throw error;
    }
  },
  {
    connection: redisConfig as any,
    concurrency: 15, // Notifications = très rapides
  }
);

// ============================================================================
// WORKER 4: Activity Scoring
// ============================================================================

export const activityScoringWorker = new Worker(
  'activity-scoring',
  async (job) => {
    const { userId, action, targetId, targetType } = job.data;

    console.log(`[Worker] Scoring ${action} by user ${userId}`);

    try {
      // Étape 1: Déterminer les points
      const pointsMap: { [key: string]: number } = {
        view: 1,
        like: 5,
        comment: 10,
        share: 15,
        apply: 20,
      };

      const points = pointsMap[action] || 0;

      // Étape 2: Appliquer multiplicateurs (bonus pour heures creuses)
      const hour = new Date().getHours();
      const multiplier = (hour >= 20 || hour <= 8) ? 1.5 : 1.0;
      const finalPoints = Math.round(points * multiplier);

      // Étape 3: Enregistrer l'activité
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action,
          target_type: targetType,
          target_id: targetId,
          points_earned: finalPoints,
          created_at: new Date().toISOString(),
        });

      if (logError) throw logError;

      // Étape 4: Mettre à jour le score utilisateur
      const { data: currentUser } = await supabase
        .from('users')
        .select('engagement_score')
        .eq('id', userId)
        .single();

      const newScore = (currentUser?.engagement_score || 0) + finalPoints;

      await supabase
        .from('users')
        .update({
          engagement_score: newScore,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', userId);

      console.log(`[Worker] User ${userId} earned ${finalPoints} points`);

      return {
        success: true,
        userId,
        pointsEarned: finalPoints,
        newScore,
      };

    } catch (error) {
      console.error(`[Worker] Error scoring activity for ${userId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConfig as any,
    concurrency: 20, // Très rapide, haute concurrence
  }
);

// ============================================================================
// ERROR HANDLING
// ============================================================================

jobAnalysisWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job analysis failed: ${job?.id} - ${err.message}`);
});

postModerationWorker.on('failed', (job, err) => {
  console.error(`[Worker] Post moderation failed: ${job?.id} - ${err.message}`);
});

activityScoringWorker.on('failed', (job, err) => {
  console.error(`[Worker] Activity scoring failed: ${job?.id} - ${err.message}`);
});

jobAnalysisWorker.on('completed', (job) => {
  console.log(`[Worker] Job analysis completed: ${job.id}`);
});

postModerationWorker.on('completed', (job) => {
  console.log(`[Worker] Post moderation completed: ${job.id}`);
});

activityScoringWorker.on('completed', (job) => {
  console.log(`[Worker] Activity scoring completed: ${job.id}`);
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function checkQueueHealth() {
  try {
    const jobAnalysisHealth = await jobAnalysisQueue.getJobCounts();
    const postModerationHealth = await postModerationQueue.getJobCounts();
    const activityScoringHealth = await activityScoringQueue.getJobCounts();
    const jobNotificationHealth = await jobNotificationQueue.getJobCounts();

    return {
      status: 'ok',
      queues: {
        'job-analysis': jobAnalysisHealth,
        'post-moderation': postModerationHealth,
        'activity-scoring': activityScoringHealth,
        'job-notifications': jobNotificationHealth,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Queue health check failed:', error);
    return {
      status: 'error',
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// INITIALIZE ALL WORKERS
// ============================================================================

export async function initializeQueues() {
  try {
    console.log('[Queues] Initializing BullMQ workers...');
    
    // Workers already initialized above, just verify connections
    await jobAnalysisQueue.waitUntilReady();
    await postModerationQueue.waitUntilReady();
    await activityScoringQueue.waitUntilReady();
    await jobNotificationQueue.waitUntilReady();
    
    console.log('[Queues] All 4 workers ready ✓');
    console.log('[Queues]  - job-analysis (5 concurrent)');
    console.log('[Queues]  - post-moderation (10 concurrent)');
    console.log('[Queues]  - activity-scoring (20 concurrent)');
    console.log('[Queues]  - job-notifications (15 concurrent)');
    return true;
  } catch (error) {
    console.error('[Queues] Initialization failed:', error);
    throw error;
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', async () => {
  console.log('[Worker] Shutting down gracefully...');
  await jobAnalysisWorker.close();
  await postModerationWorker.close();
  await activityScoringWorker.close();
  await jobNotificationWorker.close();
  process.exit(0);
});

export default {
  jobAnalysisQueue,
  postModerationQueue,
  activityScoringQueue,
  jobNotificationQueue,
  checkQueueHealth,
  initializeQueues,
};
