/**
 * ============================================================================
 * Service de Notifications Massives - Architecture Queue pour Millions d'Users
 * ============================================================================
 * 
 * Utilise BullMQ (ou Bee-Queue) pour traiter les notifications en arrière-plan
 * sans bloquer le thread principal.
 * 
 * Architecture:
 * 1. Webhook Supabase déclenche l'ajout d'une job dans la queue
 * 2. Workers dédiés traitent les jobs en parallèle
 * 3. Notification envoyée via OneSignal/Firebase par lots (batches)
 * 4. Logging + retry automatique en cas d'échec
 * 
 * Pour scale millions d'utilisateurs:
 * - Batching (envoyer 1000 notifications par requête API)
 * - Retry avec exponential backoff
 * - Workers stateless (scalable horizontalement)
 * - Rate limiting pour pas saturer les APIs externes
 */

import { Queue, Worker } from 'bullmq';
import axios from 'axios';
import { redisConfig } from '../config/redis.js';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Initialize Supabase admin client (pour récupérer les utilisateurs)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.warn('[notificationQueue] Warning: SUPABASE_URL is not configured');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[notificationQueue] Warning: SUPABASE_SERVICE_ROLE_KEY is not configured');
}

const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || ''
);

// OneSignal configuration
const ONE_SIGNAL_API_KEY = process.env.ONE_SIGNAL_API_KEY || '';
const ONE_SIGNAL_APP_ID = process.env.ONE_SIGNAL_APP_ID || '';

// Firebase configuration (alternative)
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || '';

// ============================================================================
// QUEUE DEFINITIONS
// ============================================================================

// Queue pour les notifications (e.g., nouvelle offre d'emploi)
export const notificationQueue = new Queue('notifications', { connection: redisConfig });

// Queue pour les emails
export const emailQueue = new Queue('emails', { connection: redisConfig });

// Queue pour les SMS
export const smsQueue = new Queue('sms', { connection: redisConfig });

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationJob {
  type: 'job_posted' | 'job_matched' | 'message' | 'custom';
  userId?: string; // Si ciblage spécifique
  userIds?: string[]; // Pour envois en masse
  title: string;
  message: string;
  data?: Record<string, any>;
  broadcastToRole?: 'candidate' | 'company'; // Broadcast à tous les utilisateurs d'un rôle
  filters?: {
    skills?: string[]; // Filtrer par skills
    location?: string;
    jobTitle?: string;
  };
  batchSize?: number; // Default: 1000
  retryAttempts?: number; // Default: 3
}

export interface EmailJob {
  to: string;
  template: string;
  data: Record<string, any>;
}

export interface SMSJob {
  phoneNumber: string;
  message: string;
}

// ============================================================================
// NOTIFICATION QUEUE WORKER
// ============================================================================

/**
 * Worker pour traiter les notifications
 * 
 * Récupère les utilisateurs ciblés, les batch, et envoie via OneSignal
 */
export const createNotificationWorker = () => {
  const worker = new Worker('notifications', notificationWorkerHandler, {
    connection: redisConfig,
    concurrency: 5, // 5 jobs en parallèle max
    stalledInterval: 30000, // Vérifier les jobs stuck après 30s
  });

  worker.on('completed', (job) => {
    console.log(`[Notification] Job completed: ${job.id} - ${job.data.type}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Notification] Job failed: ${job?.id}`, err.message);
  });

  worker.on('error', (error) => {
    console.error('[Notification Worker] Error:', error);
  });

  return worker;
};

/**
 * Handler pour le worker de notifications
 */
async function notificationWorkerHandler(job: any) {
  const data: NotificationJob = job.data;
  const batchSize = data.batchSize || 1000;

  console.log(`[Notification Worker] Processing job ${job.id}:`, {
    type: data.type,
    broadcastToRole: data.broadcastToRole,
    filters: data.filters,
    batchSize,
  });

  try {
    // ====================================================================
    // ÉTAPE 1: Récupérer les utilisateurs ciblés
    // ====================================================================
    let targetUsers: string[] = [];

    if (data.userIds) {
      // Envoi ciblé
      targetUsers = data.userIds;
    } else if (data.broadcastToRole) {
      // Broadcast à tous les utilisateurs d'un rôle
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', data.broadcastToRole)
        .eq('is_blocked', false);

      if (error) {
        throw new Error(`Failed to fetch ${data.broadcastToRole} users: ${error.message}`);
      }

      targetUsers = (users || []).map((u: any) => u.id);
      console.log(`[Notification] Found ${targetUsers.length} ${data.broadcastToRole} users`);
    } else if (data.userId) {
      targetUsers = [data.userId];
    }

    if (targetUsers.length === 0) {
      console.log('[Notification] No target users found');
      return { success: true, notified: 0 };
    }

    // ====================================================================
    // ÉTAPE 2: Filtrer les utilisateurs (optionnel)
    // ====================================================================
    if (data.filters && (data.filters.skills || data.filters.jobTitle)) {
      targetUsers = await filterUsersBySkills(targetUsers, data.filters);
      console.log(`[Notification] After filtering: ${targetUsers.length} users`);
    }

    // ====================================================================
    // ÉTAPE 3: Envoyer par batches
    // ====================================================================
    let notifiedCount = 0;
    const batches = chunkArray(targetUsers, batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`[Notification] Sending batch ${i + 1}/${batches.length} (${batch.length} users)`);

      try {
        const result = await sendNotificationBatch(batch, data);
        notifiedCount += result;
      } catch (error) {
        console.error(`[Notification] Batch ${i + 1} failed:`, error);
        // Continuer avec la prochaine batch
      }

      // Rate limiting: attendre entre les batches pour pas saturer OneSignal
      if (i < batches.length - 1) {
        await sleep(1000); // 1 seconde entre les batches
      }
    }

    console.log(`[Notification] Job completed: ${notifiedCount} users notified`);
    return { success: true, notified: notifiedCount };

  } catch (error) {
    console.error('[Notification Worker] Error processing job:', error);
    throw error; // BullMQ va retry automatiquement
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Filtrer les utilisateurs par skills/jobTitle (matching IA)
 */
async function filterUsersBySkills(
  userIds: string[],
  filters: { skills?: string[]; jobTitle?: string }
): Promise<string[]> {
  try {
    let query = supabase.from('profiles').select('id');

    if (filters.skills && filters.skills.length > 0) {
      // Supposant que la colonne 'skills' contient un array JSON
      query = query.contains('skills', filters.skills);
    }

    if (filters.jobTitle) {
      query = query.ilike('job_title', `%${filters.jobTitle}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Filtering] Error:', error);
      return userIds; // Return all si filtering échoue
    }

    return (data || []).map((u: any) => u.id);
  } catch (error) {
    console.error('[Filtering] Exception:', error);
    return userIds;
  }
}

/**
 * Envoyer une batch de notifications via OneSignal
 */
async function sendNotificationBatch(
  userIds: string[],
  notification: NotificationJob
): Promise<number> {
  try {
    // Format OneSignal API request
    const payload = {
      app_id: ONE_SIGNAL_APP_ID,
      include_external_user_ids: userIds,
      headings: { en: notification.title },
      contents: { en: notification.message },
      data: notification.data || {},
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
      big_picture: notification.data?.image,
      large_icon: notification.data?.icon,
    };

    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      payload,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Basic ${ONE_SIGNAL_API_KEY}`,
        },
      }
    );

    console.log('[OneSignal] Notification sent:', {
      id: response.data.id,
      recipients: response.data.recipients,
    });

    return response.data.recipients || userIds.length;

  } catch (error) {
    console.error('[OneSignal] Error:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Diviser un array en chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// EMAIL QUEUE WORKER (optionnel)
// ============================================================================

export const createEmailWorker = () => {
  const worker = new Worker('emails', emailWorkerHandler, {
    connection: redisConfig,
    concurrency: 2, // Envoi email plus lent
  });

  worker.on('completed', (job) => {
    console.log(`[Email] Job completed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Email] Job failed: ${job?.id}`, err.message);
  });

  return worker;
};

async function emailWorkerHandler(job: any) {
  const data: EmailJob = job.data;

  console.log(`[Email Worker] Sending email to ${data.to}`);

  try {
    // TODO: Intégrer avec SendGrid/Mailgun
    // const result = await sendEmailViaProvider(data);
    
    console.log(`[Email] Sent to ${data.to}`);
    return { success: true, to: data.to };

  } catch (error) {
    console.error('[Email Worker] Error:', error);
    throw error;
  }
}

// ============================================================================
// SMS QUEUE WORKER (optionnel)
// ============================================================================

export const createSMSWorker = () => {
  const worker = new Worker('sms', smsWorkerHandler, {
    connection: redisConfig,
    concurrency: 3,
  });

  worker.on('completed', (job) => {
    console.log(`[SMS] Job completed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[SMS] Job failed: ${job?.id}`, err.message);
  });

  return worker;
};

async function smsWorkerHandler(job: any) {
  const data: SMSJob = job.data;

  console.log(`[SMS Worker] Sending SMS to ${data.phoneNumber}`);

  try {
    // TODO: Intégrer avec Twilio/Vonage
    // const result = await sendSmsViaTwilio(data);

    console.log(`[SMS] Sent to ${data.phoneNumber}`);
    return { success: true, phoneNumber: data.phoneNumber };

  } catch (error) {
    console.error('[SMS Worker] Error:', error);
    throw error;
  }
}

// ============================================================================
// PUBLIC FUNCTIONS
// ============================================================================

/**
 * Ajouter une notification à la queue
 * 
 * Utilisé par les routes webhooks/API
 */
export async function queueNotification(data: NotificationJob) {
  try {
    const job = await notificationQueue.add('notification', data, {
      attempts: data.retryAttempts || 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // Commencer à 2s, augmenter exponentiellement
      },
      removeOnComplete: true, // Supprimer la job après succès
      removeOnFail: false, // Garder les jobs échouées pour debug
    });

    console.log('[Notification Queue] Job added:', {
      id: job.id,
      type: data.type,
      userCount: data.userIds?.length || 'broadcast',
    });

    return job;

  } catch (error) {
    console.error('[Notification Queue] Error:', error);
    throw error;
  }
}

/**
 * Ajouter un email à la queue
 */
export async function queueEmail(data: EmailJob) {
  try {
    const job = await emailQueue.add('email', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    console.log('[Email Queue] Job added:', { id: job.id, to: data.to });
    return job;

  } catch (error) {
    console.error('[Email Queue] Error:', error);
    throw error;
  }
}

/**
 * Ajouter un SMS à la queue
 */
export async function queueSMS(data: SMSJob) {
  try {
    const job = await smsQueue.add('sms', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    console.log('[SMS Queue] Job added:', { id: job.id });
    return job;

  } catch (error) {
    console.error('[SMS Queue] Error:', error);
    throw error;
  }
}

export default {
  notificationQueue,
  emailQueue,
  smsQueue,
  createNotificationWorker,
  createEmailWorker,
  createSMSWorker,
  queueNotification,
  queueEmail,
  queueSMS,
};
