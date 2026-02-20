/**
 * ============================================================================
 * Microservice Queues - BullMQ Job Processing
 * ============================================================================
 *
 * ⚠️ DEPRECATED: This file used Supabase which is now replaced by PostgreSQL
 *
 * TODO (Future): Re-implement these queues with PostgreSQL instead of Supabase:
 * - jobAnalysisQueue    - Analyze job postings
 * - postModerationQueue - Moderate posts
 * - activityScoringQueue- Score user engagement
 *
 * Current Status: All workers with Supabase calls are commented out
 * to unblock the build migration from Supabase → PostgreSQL.
 *
 * Implementation Plan:
 * 1. Keep BullMQ redis queues (no change needed)
 * 2. Replace all supabase.from(...).select/update/insert with pg pool queries
 * 3. Update worker logic to use PostgreSQL directly
 * 4. Re-enable all endpoints
 */

import { Queue, Worker } from 'bullmq';
import { redisConfig } from '../config/redis.js';
import { pool } from '../config/database.js';

// ============================================================================
// REDIS CONNECTION
// ============================================================================

// Using Redis for queue storage only (no Supabase client needed)

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

/**
 * DEPRECATED: This worker uses Supabase which is being replaced by PostgreSQL
 * TODO: Re-implement using pg pool instead of Supabase
 */

export const jobAnalysisWorker = new Worker(
  'job-analysis',
  async (job) => {
    console.log(`[Worker] Job analysis disabled - Pending PostgreSQL implementation`);
    console.log(`[Worker] TODO: Re-implement with pg pool instead of Supabase`);
    throw new Error('Job analysis worker disabled - awaiting PostgreSQL migration');
  },
  {
    connection: redisConfig as any,
    concurrency: 5,
  }
);

// ============================================================================
// WORKER 2: Post Moderation
// ============================================================================

/**
 * DEPRECATED: This worker uses Supabase which is being replaced by PostgreSQL
 * TODO: Re-implement using pg pool instead of Supabase
 */

export const postModerationWorker = new Worker(
  'post-moderation',
  async (job) => {
    console.log(`[Worker] Post moderation disabled - Pending PostgreSQL implementation`);
    throw new Error('Post moderation worker disabled - awaiting PostgreSQL migration');
  },
  {
    connection: redisConfig as any,
    concurrency: 10,
  }
);

// ============================================================================
// WORKER 3: Job Match Notifications
// ============================================================================

/**
 * DEPRECATED: This worker uses Supabase which is being replaced by PostgreSQL
 * TODO: Re-implement using pg pool instead of Supabase
 */

export const jobNotificationWorker = new Worker(
  'job-notifications',
  async (job) => {
    console.log(`[Worker] Job notifications disabled - Pending PostgreSQL implementation`);
    throw new Error('Job notification worker disabled - awaiting PostgreSQL migration');
  },
  {
    connection: redisConfig as any,
    concurrency: 15,
  }
);

// ============================================================================
// WORKER 4: Activity Scoring
// ============================================================================

/**
 * DEPRECATED: This worker uses Supabase which is being replaced by PostgreSQL
 * TODO: Re-implement using pg pool instead of Supabase
 */

export const activityScoringWorker = new Worker(
  'activity-scoring',
  async (job) => {
    console.log(`[Worker] Activity scoring disabled - Pending PostgreSQL implementation`);
    throw new Error('Activity scoring worker disabled - awaiting PostgreSQL migration');
  },
  {
    connection: redisConfig as any,
    concurrency: 20,
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
      status: 'partial',
      message: 'Queues are connected but workers are disabled pending PostgreSQL migration',
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
    console.log('[Queues] ⚠️  WARNING: Workers are disabled pending PostgreSQL migration');
    
    // Verify connections
    await jobAnalysisQueue.waitUntilReady();
    await postModerationQueue.waitUntilReady();
    await activityScoringQueue.waitUntilReady();
    await jobNotificationQueue.waitUntilReady();
    
    console.log('[Queues] All 4 queues ready (workers disabled) ✓');
    console.log('[Queues] TODO: Re-implement workers with PostgreSQL');
    console.log('[Queues]  - job-analysis (placeholder)');
    console.log('[Queues]  - post-moderation (placeholder)');
    console.log('[Queues]  - activity-scoring (placeholder)');
    console.log('[Queues]  - job-notifications (placeholder)');
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
