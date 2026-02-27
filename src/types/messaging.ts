// src/types/messaging.ts
export interface UserBasic {
  id: number;
  full_name: string;
  email: string;
  profile_image_url?: string;
}

export interface MessageSubject {
  id: number;
  company_id: number;
  subject_name: string;
  subject_description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  is_important: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  participant1_id: number;
  participant2_id: number;
  participant1?: UserBasic;
  participant2?: UserBasic;
  subject_id?: number;
  subject?: MessageSubject;
  last_message_at?: string;
  created_at: string;
  lastMessage?: {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
  };
}

export interface MessageReport {
  id: number;
  message_id: number;
  reporter_id: number;
  reason: string;
  report_type: string;
  created_at: string;
}

export interface MessageAttachment {
  id: number;
  message_id: number;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
}
