/**
 * ============================================================================
 * Extended Types - Socket.io, Webhooks, & Queuing
 * ============================================================================
 * 
 * Types supplémentaires pour:
 * - Socket.io events
 * - Webhook payloads
 * - BullMQ jobs
 * - Real-time messaging
 */

// ============================================================================
// SOCKET.IO MESSAGE TYPES
// ============================================================================

export interface SocketMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderEmail: string;
  recipientId: string;
  content: string;
  attachments?: string[];
  timestamp: string;
  isRead: boolean;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  email: string;
  isTyping: boolean;
  timestamp: number;
}

export interface UserPresence {
  userId: string;
  email: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  timestamp: number;
}

export interface ConversationEvent {
  conversationId: string;
  event: 'joined' | 'left' | 'message' | 'typing';
  userId: string;
  data?: any;
  timestamp: number;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookSignature {
  timestamp: string;
  signature: string; // HMAC SHA256
}

export interface JobWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: 'jobs';
  record: {
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
  };
  old_record?: any;
}

export interface CandidateWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: 'candidates';
  record: {
    id: string;
    email: string;
    full_name: string;
    skills: string[];
    experience_level: 'Junior' | 'Intermédiaire' | 'Senior';
    target_salary_min?: number;
    target_salary_max?: number;
    location?: string;
    push_token?: string;
    notifications_enabled: boolean;
    is_active: boolean;
    created_at: string;
  };
  old_record?: any;
}

export interface WebhookEvent {
  id: string;
  type: string;
  payload: JobWebhookPayload | CandidateWebhookPayload;
  processedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// ============================================================================
// BULLMQ JOB TYPES
// ============================================================================

export interface NotificationBatchJob {
  jobId: string;
  jobTitle: string;
  companyId: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: string;
  requiredSkills: string[];
  experienceLevel: string;
  candidateIds: string[];
  notificationTitle: string;
  notificationBody: string;
  createdAt: string;
}

export interface EmailNotificationJob {
  recipientEmail: string;
  recipientId: string;
  subject: string;
  template: 'job_match' | 'message' | 'weekly_digest';
  templateData: {
    jobTitle?: string;
    companyName?: string;
    matchScore?: number;
    [key: string]: any;
  };
}

export interface PushNotificationJob {
  userId: string;
  pushToken: string;
  title: string;
  body: string;
  data?: {
    jobId?: string;
    conversationId?: string;
    messageId?: string;
    [key: string]: any;
  };
  badge?: number;
  sound?: string;
}

export interface SMSNotificationJob {
  recipientPhoneNumber: string;
  message: string;
  senderId?: string;
}

// ============================================================================
// QUEUE STATUS & MONITORING
// ============================================================================

export interface QueueMetrics {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export interface WorkerStatus {
  name: string;
  isRunning: boolean;
  concurrency: number;
  processedCount: number;
  failedCount: number;
  lastError?: string;
}

export interface QueueHealth {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'failing';
  queues: QueueMetrics[];
  workers: WorkerStatus[];
  averageProcessingTime?: number;
  errorRate?: number;
}

// ============================================================================
// REAL-TIME COLLABORATION TYPES
// ============================================================================

export interface CursorPosition {
  userId: string;
  email: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface SelectionChange {
  userId: string;
  email: string;
  selectedText: string;
  color: string;
  timestamp: number;
}

export interface DocumentChange {
  documentId: string;
  userId: string;
  operation: 'insert' | 'delete' | 'update';
  content: string;
  position: number;
  timestamp: number;
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  jobMatches: boolean;
  newMessages: boolean;
  weeklyDigest: boolean;
  dailyDigest: boolean;
  companyUpdates: boolean;
  preferences: {
    quietHoursStart?: string; // HH:MM
    quietHoursEnd?: string;
    preferredLanguage: 'fr' | 'en';
    timezone: string;
  };
}

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

export interface AnalyticsEvent {
  eventId: string;
  userId: string;
  eventType:
    | 'job_view'
    | 'job_apply'
    | 'message_sent'
    | 'profile_view'
    | 'search'
    | 'click'
    | 'scroll'
    | 'page_load';
  data: {
    jobId?: string;
    conversationId?: string;
    searchQuery?: string;
    [key: string]: any;
  };
  timestamp: string;
  sessionId: string;
  userAgent: string;
  ipAddress?: string;
}

export interface SessionMetrics {
  sessionId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // seconds
  pageViews: number;
  events: AnalyticsEvent[];
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export interface ErrorContext {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  userId?: string;
}

export interface ErrorLog {
  id: string;
  error: ErrorContext;
  stackTrace: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  resolved: boolean;
  createdAt: string;
}

// ============================================================================
// CACHING TYPES
// ============================================================================

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: string;
  createdAt: string;
  ttl: number; // seconds
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number; // bytes
  itemCount: number;
}

// ============================================================================
// DATABASE INDEXES & OPTIMIZATION
// ============================================================================

export interface IndexInfo {
  name: string;
  table: string;
  columns: string[];
  type: string; // btree, hash, gin, gist
  unique: boolean;
  size: number; // bytes
}

export interface TableStats {
  name: string;
  rows: number;
  size: number; // bytes
  indexes: IndexInfo[];
  lastVacuum?: string;
  lastAnalyze?: string;
}

// ============================================================================
// TRANSACTION & BATCH PROCESSING
// ============================================================================

export interface BatchJob<T> {
  batchId: string;
  items: T[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedCount: number;
  failedCount: number;
  startedAt?: string;
  completedAt?: string;
  errors?: Array<{
    itemIndex: number;
    error: string;
  }>;
}

export interface Transaction {
  id: string;
  type: 'job_notification' | 'message' | 'payment' | 'profile_update';
  status: 'pending' | 'completed' | 'failed' | 'rolled_back';
  startedAt: string;
  completedAt?: string;
  rollbackReason?: string;
  affectedRecords: number;
}
