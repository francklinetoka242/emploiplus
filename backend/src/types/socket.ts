/**
 * ============================================================================
 * Socket.io Type Definitions
 * ============================================================================
 * 
 * Types for Socket.io events, messages, and data structures
 * Ensures type safety across frontend and backend
 */

/**
 * Message Types
 */
export type MessageType = 'text' | 'image' | 'file' | 'video';

/**
 * Socket.io Client → Server Events
 */
export interface ClientToServerEvents {
  /**
   * Join conversation room
   */
  join_conversation: (data: {
    conversationId: string;
  }) => void;

  /**
   * Leave conversation room
   */
  leave_conversation: (data: {
    conversationId: string;
  }) => void;

  /**
   * Send private message (archived in Supabase)
   */
  private_message: (data: {
    conversationId: string;
    recipientId: string;
    content: string;
    type?: MessageType;
  }) => void;

  /**
   * Typing indicator
   * - isTyping: true when user starts typing, false when stops/sends
   */
  typing: (data: {
    conversationId: string;
    isTyping: boolean;
  }) => void;

  /**
   * Get list of online users
   */
  get_online_users: (callback?: (users: string[]) => void) => void;

  /**
   * Mark message as read (optional improvement)
   */
  mark_as_read?: (data: {
    messageIds: string[];
  }) => void;
}

/**
 * Socket.io Server → Client Events
 */
export interface ServerToClientEvents {
  /**
   * Receive private message (delivered in real-time)
   */
  private_message: (data: {
    id: string;
    conversationId: string;
    senderId: string;
    recipientId: string;
    content: string;
    type: MessageType;
    timestamp: string;
  }) => void;

  /**
   * Typing indicator from other users
   */
  user_typing: (data: {
    userId: string;
    conversationId: string;
    isTyping: boolean;
    timestamp: string;
  }) => void;

  /**
   * Confirmation that message was delivered
   */
  message_delivered: (data: {
    conversationId: string;
    messageId: string;
    timestamp: string;
  }) => void;

  /**
   * Confirmation that message was read (optional)
   */
  message_read?: (data: {
    messageId: string;
    timestamp: string;
  }) => void;

  /**
   * User came online
   */
  user_online: (data: {
    userId: string;
    status: 'online';
    timestamp: string;
  }) => void;

  /**
   * User went offline
   */
  user_offline: (data: {
    userId: string;
    status: 'offline';
    timestamp: string;
  }) => void;

  /**
   * User joined conversation room
   */
  user_joined: (data: {
    userId: string;
    conversationId: string;
    timestamp: string;
  }) => void;

  /**
   * User left conversation room
   */
  user_left: (data: {
    userId: string;
    conversationId: string;
    timestamp: string;
  }) => void;

  /**
   * List of currently online users
   */
  online_users: (users: string[]) => void;

  /**
   * Error occurred (e.g., invalid token, missing fields)
   */
  error: (data: {
    message: string;
    code?: string;
  }) => void;
}

/**
 * Socket.io Intermediate Data (SocketData)
 * Attached to Socket instance via socket.data
 */
export interface SocketData {
  userId: string;
  email: string;
  authenticated: boolean;
}

/**
 * Job Webhook Payload
 * Sent by Supabase when a new job is created
 */
export interface JobWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  record: {
    id: string;
    title: string;
    company_name: string;
    description: string;
    required_skills: string[];
    experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
    location: string;
    salary_min?: number;
    salary_max?: number;
    contract_type?: string;
  };
}

/**
 * Matching Candidate Result
 */
export interface MatchedCandidate {
  id: string;
  email: string;
  skills: string[];
  experience_level: string;
  location: string;
  score: number; // 0-100
  scoreBreakdown: {
    skillsScore: number; // 0-100
    experienceScore: number; // 0-100
    locationScore: number; // 0-100
  };
}

/**
 * Push Notification Payload
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, string>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Message Document (from Supabase)
 */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: MessageType;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Conversation Document (from Supabase)
 */
export interface Conversation {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message_at: string;
  created_at: string;
}

/**
 * Webhook Log (for analytics)
 */
export interface WebhookLog {
  id: string;
  event_type: 'job_offer' | 'message' | 'notification';
  payload: Record<string, any>;
  matched_count: number;
  created_at: string;
}

/**
 * Device Token (for push notifications)
 */
export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  device_type: 'ios' | 'android' | 'web';
  created_at: string;
}

/**
 * Firebase Cloud Messaging Response
 */
export interface FCMResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors: Array<{
    token: string;
    error: string;
  }>;
}

/**
 * Authentication Claims (from JWT)
 */
export interface AuthClaims {
  sub: string; // User ID
  email: string;
  aud: string; // Audience (usually 'authenticated')
  iat: number; // Issued at
  exp: number; // Expiration
  role?: string;
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    socketio: 'connected' | 'disconnected';
    firebase: 'configured' | 'not_configured';
  };
  message?: string;
}

/**
 * Socket.io Error Response
 */
export interface SocketErrorResponse {
  message: string;
  code: string;
  details?: Record<string, any>;
}

/**
 * Frontend Socket.io Client Type
 * Use with socket.io-client
 */
export type ClientSocket = import('socket.io-client').Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

/**
 * Backend Socket.io Server Type
 * Use with socket.io
 */
export type ServerSocket = import('socket.io').Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

/**
 * Real-time Message Event
 * Emitted from server when message is delivered
 */
export type MessageEvent = ServerToClientEvents['private_message'];

/**
 * Typing Event
 * Emitted when user is typing
 */
export type TypingEvent = ServerToClientEvents['user_typing'];
