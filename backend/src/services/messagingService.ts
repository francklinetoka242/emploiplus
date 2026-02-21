// backend/src/services/messagingService.ts
/**
 * Messaging Service - Gère les conversations et messages en temps réel
 * Support pour sujets prédéfinis, pagination, et statuts de lecture
 */

import { pool } from '../config/database.js';

export interface Conversation {
  id: number;
  participant1_id: number;
  participant2_id: number;
  participant1?: UserBasic;
  participant2?: UserBasic;
  lastMessage?: Message;
  unreadCount?: number;
  created_at: string;
  last_message_at: string;
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
  sender?: UserBasic;
}

export interface UserBasic {
  id: number;
  full_name: string;
  profile_image_url?: string;
  user_type?: string;
  company_name?: string;
}

export interface MessageSubject {
  id: number;
  company_id: number;
  subject_name: string;
  subject_description?: string;
  display_order: number;
  is_active: boolean;
}

// Get or create a conversation between two users
export async function getOrCreateConversation(
  user1_id: number,
  user2_id: number,
  subject_id?: number
): Promise<Conversation> {
  // Ensure consistent ordering (lower ID first)
  const [participant1_id, participant2_id] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];

  try {
    // Try to find existing conversation
    const existing = await pool.query(
      `SELECT * FROM conversations 
       WHERE (participant1_id = $1 AND participant2_id = $2)
          OR (participant1_id = $2 AND participant2_id = $1)
       LIMIT 1`,
      [user1_id, user2_id]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Create new conversation
    const result = await pool.query(
      `INSERT INTO conversations (participant1_id, participant2_id, subject_id, created_at, last_message_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [participant1_id, participant2_id, subject_id || null]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    throw error;
  }
}

// Get conversations for a user
export async function getConversations(
  user_id: string,
  limit: number = 50
): Promise<Conversation[]> {
  try {
    const result = await pool.query(
      `SELECT c.*, 
        u1.id as participant1_id, u1.first_name as p1_first, u1.last_name as p1_last, u1.profile_image_url as p1_image, u1.user_type as p1_type,
        u2.id as participant2_id, u2.first_name as p2_first, u2.last_name as p2_last, u2.profile_image_url as p2_image, u2.user_type as p2_type
       FROM conversations c
       LEFT JOIN users u1 ON c.participant1_id = u1.id
       LEFT JOIN users u2 ON c.participant2_id = u2.id
       WHERE c.participant1_id = $1 OR c.participant2_id = $1
       ORDER BY c.last_message_at DESC
       LIMIT $2`,
      [user_id, limit]
    );

    // Format results
    return result.rows.map((row) => ({
      id: row.id,
      participant1_id: row.participant1_id,
      participant2_id: row.participant2_id,
      created_at: row.created_at,
      last_message_at: row.last_message_at,
      participant1: {
        id: row.participant1_id,
        first_name: row.p1_first,
        last_name: row.p1_last,
        full_name: `${(row.p1_first||'').trim()} ${(row.p1_last||'').trim()}`.trim(),
        profile_image_url: row.p1_image,
        user_type: row.p1_type,
      },
      participant2: {
        id: row.participant2_id,
        first_name: row.p2_first,
        last_name: row.p2_last,
        full_name: `${(row.p2_first||'').trim()} ${(row.p2_last||'').trim()}`.trim(),
        profile_image_url: row.p2_image,
        user_type: row.p2_type,
      },
    }));
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

// Get messages for a conversation with pagination
export async function getMessages(
  conversation_id: number,
  offset: number = 0,
  limit: number = 20
): Promise<Message[]> {
  try {
    const result = await pool.query(
      `SELECT m.*, u.first_name, u.last_name, u.profile_image_url
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1 AND m.is_deleted = false
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversation_id, limit, offset]
    );

    // Reverse to get chronological order
    return result.rows.reverse().map((row) => ({
      id: row.id,
      conversation_id: row.conversation_id,
      sender_id: row.sender_id,
      receiver_id: row.receiver_id,
      content: row.content,
      is_read: row.is_read,
      is_important: row.is_important,
      is_deleted: row.is_deleted,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sender: {
        id: row.sender_id,
        first_name: row.first_name,
        last_name: row.last_name,
        full_name: `${(row.first_name||'').trim()} ${(row.last_name||'').trim()}`.trim(),
        profile_image_url: row.profile_image_url,
      },
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

// Send a message
export async function sendMessage(
  conversation_id: number,
  sender_id: number,
  receiver_id: number,
  content: string
): Promise<Message> {
  try {
    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [conversation_id, sender_id, receiver_id, content]
    );

    // Update conversation's last_message_at
    await pool.query(
      `UPDATE conversations SET last_message_at = NOW() WHERE id = $1`,
      [conversation_id]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Mark a message as read
export async function markMessageAsRead(
  message_id: number
): Promise<boolean> {
  try {
    const result = await pool.query(
      `UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1`,
      [message_id]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

// Mark all messages in conversation as read
export async function markConversationAsRead(
  conversation_id: number,
  reader_id: number
): Promise<boolean> {
  try {
    const result = await pool.query(
      `UPDATE messages 
       SET is_read = true, updated_at = NOW() 
       WHERE conversation_id = $1 AND receiver_id = $2 AND is_read = false`,
      [conversation_id, reader_id]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
}

// Get unread message count
export async function getUnreadCount(user_id: number): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM messages 
       WHERE receiver_id = $1 AND is_read = false AND is_deleted = false`,
      [user_id]
    );

    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// Toggle message importance
export async function toggleMessageImportant(
  message_id: number,
  current_state: boolean
): Promise<boolean> {
  try {
    await pool.query(
      `UPDATE messages SET is_important = $1, updated_at = NOW() WHERE id = $2`,
      [!current_state, message_id]
    );

    return true;
  } catch (error) {
    console.error('Error toggling message importance:', error);
    throw error;
  }
}

// Soft delete a message
export async function deleteMessage(message_id: number): Promise<boolean> {
  try {
    const result = await pool.query(
      `UPDATE messages SET is_deleted = true, updated_at = NOW() WHERE id = $1`,
      [message_id]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

// Delete entire conversation
export async function deleteConversation(
  conversation_id: number,
  user_id: number
): Promise<boolean> {
  try {
    // Check ownership
    const conv = await pool.query(
      `SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)`,
      [conversation_id, user_id]
    );

    if (conv.rows.length === 0) {
      throw new Error('Conversation not found');
    }

    // Soft delete all messages
    await pool.query(
      `UPDATE messages SET is_deleted = true WHERE conversation_id = $1`,
      [conversation_id]
    );

    // Delete conversation
    await pool.query(`DELETE FROM conversations WHERE id = $1`, [conversation_id]);

    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

// Get message subjects for a company
export async function getMessageSubjects(company_id: number): Promise<MessageSubject[]> {
  try {
    const result = await pool.query(
      `SELECT * FROM message_subjects 
       WHERE company_id = $1 AND is_active = true
       ORDER BY display_order ASC`,
      [company_id]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting message subjects:', error);
    return [];
  }
}

// Create message subject (for admin/company)
export async function createMessageSubject(
  company_id: number,
  subject_name: string,
  subject_description?: string,
  display_order?: number
): Promise<MessageSubject> {
  try {
    const result = await pool.query(
      `INSERT INTO message_subjects (company_id, subject_name, subject_description, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [company_id, subject_name, subject_description || '', display_order || 0]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating message subject:', error);
    throw error;
  }
}

// Report a message
export async function reportMessage(
  message_id: number,
  reporter_id: number,
  reason: string,
  report_type: string = 'report'
): Promise<{ id: number; success: boolean }> {
  try {
    const result = await pool.query(
      `INSERT INTO message_reports (message_id, reporter_id, reason, report_type, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [message_id, reporter_id, reason, report_type]
    );

    return { id: result.rows[0].id, success: true };
  } catch (error) {
    console.error('Error reporting message:', error);
    throw error;
  }
}

// Check if users have existing conversation
export async function hasConversation(user1_id: number, user2_id: number): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM conversations 
       WHERE (participant1_id = $1 AND participant2_id = $2)
          OR (participant1_id = $2 AND participant2_id = $1)`,
      [user1_id, user2_id]
    );

    return parseInt(result.rows[0].count, 10) > 0;
  } catch (error) {
    console.error('Error checking conversation:', error);
    return false;
  }
}

// Get unread conversations count
export async function getUnreadConversationsCount(user_id: number): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT m.conversation_id) as count
       FROM messages m
       WHERE m.receiver_id = $1 AND m.is_read = false AND m.is_deleted = false`,
      [user_id]
    );

    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error getting unread conversations count:', error);
    return 0;
  }
}
