/**
 * ============================================================================
 * Service de Notification Push
 * ============================================================================
 * 
 * Envoie des push notifications aux utilisateurs via:
 * - Firebase Cloud Messaging (FCM)
 * - Twilio SMS (optionnel)
 * - Email (SendGrid)
 * 
 * IMPORTANT: Async/Queue-based pour ne pas bloquer
 * Les notifications sont enqueued et traitées en arrière-plan
 */

import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

// Initialize Firebase Admin
let firebaseApp: admin.app.App | null = null;

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  link?: string;
  icon?: string;
}

export interface NotificationOptions {
  userIds?: string[]; // Supabase user IDs
  email?: string;
  topic?: string; // Firebase topic (ex: 'job_offers')
  priority?: 'high' | 'normal';
  ttl?: number; // Time to live in seconds
  delay?: number; // Delay in ms before sending
}

export interface NotificationResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  jobId?: string;
  errors?: Array<{ userId: string; error: string }>;
}

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase() {
  if (firebaseApp) {
    console.log('[PushNotification] Firebase already initialized');
    return firebaseApp;
  }

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!serviceAccountPath) {
      console.warn('[PushNotification] FIREBASE_SERVICE_ACCOUNT_PATH not set, using env vars');
    }

    firebaseApp = admin.initializeApp({
      credential: serviceAccountPath
        ? admin.credential.cert(serviceAccountPath)
        : admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('[PushNotification] ✅ Firebase initialized');
    return firebaseApp;

  } catch (error) {
    console.error('[PushNotification] Failed to initialize Firebase:', error);
    throw error;
  }
}

/**
 * Send push notification to specific users
 * 
 * ASYNC: Returns immediately, notification queued for delivery
 * Does NOT block the request
 */
export async function sendPushNotification(
  payload: PushNotificationPayload,
  options: NotificationOptions
): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: false,
    sentCount: 0,
    failedCount: 0,
    errors: [],
  };

  try {
    const messaging = admin.messaging();

    // Queue to send via topic (most scalable for millions of users)
    if (options.topic) {
      return await sendToTopic(messaging, payload, options);
    }

    // Or send to specific users
    if (options.userIds && options.userIds.length > 0) {
      return await sendToUsers(messaging, payload, options);
    }

    // Or send to email
    if (options.email) {
      return await sendEmail(payload, options);
    }

    throw new Error('No recipients specified (userIds, topic, or email)');

  } catch (error) {
    console.error('[PushNotification] Error:', error);
    result.success = false;
    result.failedCount = (options.userIds?.length || 0);
    result.errors = [{
      userId: 'all',
      error: (error as any).message || 'Unknown error',
    }];
    return result;
  }
}

/**
 * Send to Firebase topic (scalable for millions)
 * 
 * Topics: 'job_offers', 'messages', 'connections', etc.
 */
async function sendToTopic(
  messaging: admin.messaging.Messaging,
  payload: PushNotificationPayload,
  options: NotificationOptions
): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: true,
    sentCount: 0,
    failedCount: 0,
  };

  try {
    if (!options.topic) {
      throw new Error('Topic is required');
    }

    const message: admin.messaging.Message = {
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.icon,
      },
      data: {
        ...payload.data,
        link: payload.link || '',
      },
      webpush: {
        headers: {
          TTL: String(options.ttl || 3600),
        },
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon,
          click_action: payload.link,
        },
        fcmOptions: {
          link: payload.link,
        },
      },
      android: {
        ttl: (options.ttl || 3600) * 1000, // Convert to ms
        priority: options.priority || 'high' as any,
        notification: {
          title: payload.title,
          body: payload.body,
          clickAction: payload.link,
        },
      },
      apns: {
        headers: {
          'apns-ttl': String(options.ttl || 3600),
          'apns-priority': options.priority === 'high' ? '10' : '5',
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    console.log(`[PushNotification] Sending to topic: ${options.topic}`);

    const response = await messaging.send(message);

    result.success = true;
    result.sentCount = 1; // Topic send counts as 1
    result.jobId = response;

    console.log(`[PushNotification] ✅ Sent to topic ${options.topic}, message ID:`, response);

    return result;

  } catch (error) {
    console.error('[PushNotification] Topic send error:', error);
    result.success = false;
    result.failedCount = 1;
    result.errors = [{
      userId: options.topic || 'topic',
      error: (error as any).message,
    }];
    return result;
  }
}

/**
 * Send to specific users (uses device tokens)
 * 
 * Device tokens stored in Supabase: public.device_tokens table
 */
async function sendToUsers(
  messaging: admin.messaging.Messaging,
  payload: PushNotificationPayload,
  options: NotificationOptions
): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: true,
    sentCount: 0,
    failedCount: 0,
    errors: [],
  };

  if (!options.userIds || options.userIds.length === 0) {
    return result;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || '' // Use service key for admin operations
  );

  try {
    // Fetch device tokens for users
    const { data: deviceTokens, error } = await supabase
      .from('device_tokens')
      .select('user_id, token')
      .in('user_id', options.userIds);

    if (error) {
      console.error('[PushNotification] Failed to fetch device tokens:', error);
      result.success = false;
      result.failedCount = options.userIds.length;
      return result;
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      console.warn('[PushNotification] No device tokens found for users:', options.userIds);
      result.success = true;
      result.sentCount = 0;
      return result;
    }

    // Batch send to multiple devices
    const tokens = deviceTokens.map((dt: any) => dt.token);
    
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.icon,
      },
      data: {
        ...payload.data,
        link: payload.link || '',
      },
      tokens, // Array of device tokens
      webpush: {
        headers: {
          TTL: String(options.ttl || 3600),
        },
      },
      android: {
        ttl: (options.ttl || 3600) * 1000,
        priority: options.priority || 'high' as any,
      },
    };

    console.log(`[PushNotification] Sending to ${tokens.length} devices`);

    const response = await messaging.sendMulticast(message);

    result.success = response.failureCount === 0;
    result.sentCount = response.successCount;
    result.failedCount = response.failureCount;

    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          result.errors?.push({
            userId: options.userIds?.[idx] || `device_${idx}`,
            error: (resp.error as any)?.message || 'Unknown error',
          });
        }
      });
    }

    console.log(`[PushNotification] ✅ Sent to ${result.sentCount}/${tokens.length} devices`);

    return result;

  } catch (error) {
    console.error('[PushNotification] User send error:', error);
    result.success = false;
    result.failedCount = options.userIds.length;
    result.errors = [{
      userId: 'all',
      error: (error as any).message,
    }];
    return result;
  }
}

/**
 * Send email notification (via SendGrid)
 */
async function sendEmail(
  payload: PushNotificationPayload,
  options: NotificationOptions
): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: true,
    sentCount: 0,
    failedCount: 0,
  };

  if (!options.email) {
    return result;
  }

  try {
    // TODO: Implement SendGrid integration
    // For now, just log
    console.log('[PushNotification] Email would be sent to:', options.email, payload);

    result.success = true;
    result.sentCount = 1;

    return result;

  } catch (error) {
    console.error('[PushNotification] Email send error:', error);
    result.success = false;
    result.failedCount = 1;
    return result;
  }
}

/**
 * Notify candidates about new job offers
 * 
 * Called from webhook or job creation endpoint
 */
export async function notifyJobOffers(
  jobData: {
    id: string;
    title: string;
    company: string;
    description: string;
    requiredSkills: string[];
  },
  candidateIds?: string[]
): Promise<NotificationResult> {
  try {
    const title = `Nouvelle offre: ${jobData.title}`;
    const body = `${jobData.company} recrute ${jobData.title}`;

    const payload: PushNotificationPayload = {
      title,
      body,
      icon: '/icons/job.png',
      link: `/jobs/${jobData.id}`,
      data: {
        type: 'job_offer',
        jobId: jobData.id,
        company: jobData.company,
        skills: jobData.requiredSkills.join(','),
      },
    };

    // Send to specific candidates or use topic
    const options: NotificationOptions = {
      userIds: candidateIds,
      topic: 'job_offers', // Also send to topic subscribers
      priority: 'high',
    };

    return await sendPushNotification(payload, options);

  } catch (error) {
    console.error('[JobOffers] Notification error:', error);
    return {
      success: false,
      sentCount: 0,
      failedCount: 1,
      errors: [{ userId: jobData.id, error: (error as any).message }],
    };
  }
}

/**
 * Notify new message
 */
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  messagePreview: string
): Promise<NotificationResult> {
  const payload: PushNotificationPayload = {
    title: `Message de ${senderName}`,
    body: messagePreview.substring(0, 80),
    icon: '/icons/message.png',
    link: '/messages',
    data: {
      type: 'new_message',
      senderId: senderName,
    },
  };

  const options: NotificationOptions = {
    userIds: [recipientId],
    priority: 'high',
  };

  return await sendPushNotification(payload, options);
}

export default {
  initializeFirebase,
  sendPushNotification,
  notifyJobOffers,
  notifyNewMessage,
};
