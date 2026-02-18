/**
 * ============================================================================
 * Socket.io Configuration - Messagerie Temps Réel
 * ============================================================================
 * 
 * Gère les événements WebSocket pour:
 * - Typing indicator (l'utilisateur écrit...)
 * - Direct messages (messages privés en temps réel)
 * - Persistence dans Supabase
 * 
 * Architecture scalable:
 * - Adapter Redis pour multi-serveurs
 * - Namespaces pour isoler les conversations
 * - Rooms pour les conversations privées
 * - JWT authentication sur connexion
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createClient as createRedisClient } from 'redis';
import { verifySocketToken } from '../middleware/auth.js';
import { redisConfig } from '../config/redis.js';

// ============================================================================
// MODULE AUGMENTATION: Ajouter la propriété user à l'interface Socket
// ============================================================================
// Résout l'erreur TS2551: Property 'user' does not exist on type 'Socket'
declare module 'socket.io' {
  interface Socket {
    user?: User;
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Supabase client pour persistence des messages
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.warn('[socketio] Warning: SUPABASE_URL is not configured');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[socketio] Warning: SUPABASE_SERVICE_ROLE_KEY is not configured');
}

const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || ''
);

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: string;
  email: string;
  role: 'candidate' | 'company' | 'admin';
}

interface TypingEvent {
  conversationId: string;
  user: User;
  isTyping: boolean;
  timestamp: number;
}

interface DirectMessage {
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  attachments?: string[];
  timestamp: number;
}

// ============================================================================
// SETUP SOCKET.IO
// ============================================================================

/**
 * Initialiser Socket.io avec configuration optimisée
 */
export function setupSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://emploiplus.vercel.app',
        'https://emploi-connect-frontend.vercel.app',
      ],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    
    // Redis adapter pour scale multi-serveurs
    adapter: redisConfig.url || process.env.REDIS_HOST ? require('@socket.io/redis-adapter') : undefined,
  });

  // Si Redis configuré, l'utiliser comme adapter
  if (redisConfig.url || process.env.REDIS_HOST) {
    const { createAdapter } = require('@socket.io/redis-adapter');
    
    const pubClient = createRedisClient(redisConfig as any);
    const subClient = pubClient.duplicate();

    io.adapter(createAdapter(pubClient, subClient));
    console.log('[Socket.io] Redis adapter enabled');
  }

  // ========================================================================
  // MIDDLEWARE: Authentication
  // ========================================================================
  io.use((socket, next) => {
    verifySocketToken(socket, next);
  });

  // ========================================================================
  // NAMESPACE: Messages (conversations privées)
  // ========================================================================
  const messagesNamespace = io.of('/messages');

  messagesNamespace.on('connection', (socket: Socket) => {
    const user: User = socket.user;
    console.log(`[Socket.messages] User connected: ${user.id} (${user.email})`);

    // ======================================================================
    // EVENT: Join conversation room
    // ======================================================================
    socket.on('join_conversation', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        const room = `conversation:${conversationId}`;

        // Vérifier que l'utilisateur est participant de la conversation
        const { data: conversation, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('participants', `{${user.id}}`) // Check si user dans participants array
          .single();

        if (error || !conversation) {
          socket.emit('error', { message: 'Unauthorized to join conversation' });
          return;
        }

        socket.join(room);
        console.log(`[Socket.messages] User ${user.id} joined room: ${room}`);

        // Notifier les autres utilisateurs
        messagesNamespace.to(room).emit('user_joined', {
          userId: user.id,
          email: user.email,
          timestamp: Date.now(),
        });

      } catch (error) {
        console.error('[Socket.messages] Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // ======================================================================
    // EVENT: Typing indicator
    // ======================================================================
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      try {
        const { conversationId, isTyping } = data;
        const room = `conversation:${conversationId}`;

        // Broadcast l'event typing à tous les autres users de la room
        socket.to(room).emit('user_typing', {
          userId: user.id,
          email: user.email,
          isTyping,
          timestamp: Date.now(),
        });

        console.log(`[Socket.messages] ${user.id} typing: ${isTyping} in ${conversationId}`);

      } catch (error) {
        console.error('[Socket.messages] Error handling typing:', error);
      }
    });

    // ======================================================================
    // EVENT: Send direct message
    // ======================================================================
    socket.on('send_message', async (data: DirectMessage) => {
      try {
        const { conversationId, recipientId, content, attachments } = data;

        // Validations
        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        if (content.length > 5000) {
          socket.emit('error', { message: 'Message too long (max 5000 chars)' });
          return;
        }

        // Sauvegarder le message dans Supabase
        const { data: savedMessage, error } = await supabase
          .from('messages')
          .insert([
            {
              conversation_id: conversationId,
              sender_id: user.id,
              recipient_id: recipientId,
              content,
              attachments: attachments || [],
              created_at: new Date().toISOString(),
              is_read: false,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('[Socket.messages] Error saving message:', error);
          socket.emit('error', { message: 'Failed to send message' });
          return;
        }

        // Broadcast le message à tous les users de la conversation
        const room = `conversation:${conversationId}`;
        messagesNamespace.to(room).emit('new_message', {
          id: savedMessage.id,
          conversationId,
          senderId: user.id,
          senderEmail: user.email,
          recipientId,
          content,
          attachments: attachments || [],
          timestamp: savedMessage.created_at,
        });

        // Confirmation d'envoi au sender
        socket.emit('message_sent', {
          id: savedMessage.id,
          timestamp: savedMessage.created_at,
        });

        console.log(`[Socket.messages] Message sent from ${user.id} to ${recipientId}`);

        // Mettre à jour le last_message de la conversation
        await supabase
          .from('conversations')
          .update({
            last_message: content,
            last_message_at: new Date().toISOString(),
          })
          .eq('id', conversationId);

      } catch (error) {
        console.error('[Socket.messages] Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ======================================================================
    // EVENT: Mark message as read
    // ======================================================================
    socket.on('mark_as_read', async (data: { messageIds: string[] }) => {
      try {
        const { messageIds } = data;

        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', messageIds)
          .eq('recipient_id', user.id);

        console.log(`[Socket.messages] Marked ${messageIds.length} messages as read`);

      } catch (error) {
        console.error('[Socket.messages] Error marking as read:', error);
      }
    });

    // ======================================================================
    // EVENT: Delete message
    // ======================================================================
    socket.on('delete_message', async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        // Vérifier que c'est le sender qui supprime
        const { data: message, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('id', messageId)
          .single();

        if (fetchError || !message || message.sender_id !== user.id) {
          socket.emit('error', { message: 'Unauthorized to delete this message' });
          return;
        }

        // Soft delete (marquer comme supprimé)
        await supabase
          .from('messages')
          .update({ is_deleted: true, content: '[Message supprimé]' })
          .eq('id', messageId);

        // Broadcast la suppression
        const room = `conversation:${message.conversation_id}`;
        messagesNamespace.to(room).emit('message_deleted', {
          messageId,
          timestamp: Date.now(),
        });

        console.log(`[Socket.messages] Message ${messageId} deleted by ${user.id}`);

      } catch (error) {
        console.error('[Socket.messages] Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // ======================================================================
    // EVENT: Leave conversation
    // ======================================================================
    socket.on('leave_conversation', (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        const room = `conversation:${conversationId}`;

        socket.leave(room);
        messagesNamespace.to(room).emit('user_left', {
          userId: user.id,
          timestamp: Date.now(),
        });

        console.log(`[Socket.messages] User ${user.id} left room: ${room}`);

      } catch (error) {
        console.error('[Socket.messages] Error leaving conversation:', error);
      }
    });

    // ======================================================================
    // EVENT: Disconnect
    // ======================================================================
    socket.on('disconnect', () => {
      console.log(`[Socket.messages] User disconnected: ${user.id}`);
    });

    socket.on('error', (error: any) => {
      console.error('[Socket.messages] Socket error:', error);
    });
  });

  // ========================================================================
  // NAMESPACE: Notifications (broadcast)
  // ========================================================================
  const notificationsNamespace = io.of('/notifications');

  notificationsNamespace.on('connection', (socket: Socket) => {
    const user: User = socket.user;
    console.log(`[Socket.notifications] User connected: ${user.id}`);

    // Rejoindre room par rôle (pour broadcasts)
    socket.join(`role:${user.role}`);
    socket.join(`user:${user.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.notifications] User disconnected: ${user.id}`);
    });
  });

  // ========================================================================
  // NAMESPACE: Presence (qui est connecté en temps réel)
  // ========================================================================
  const presenceNamespace = io.of('/presence');

  presenceNamespace.on('connection', (socket: Socket) => {
    const user: User = socket.user;
    console.log(`[Socket.presence] User online: ${user.id}`);

    // Broadcast user online
    presenceNamespace.emit('user_online', {
      userId: user.id,
      email: user.email,
      timestamp: Date.now(),
    });

    socket.on('disconnect', () => {
      presenceNamespace.emit('user_offline', {
        userId: user.id,
        timestamp: Date.now(),
      });
    });
  });

  return io;
}

// ============================================================================
// PUBLIC FUNCTIONS: Émettre depuis le serveur
// ============================================================================

/**
 * Envoyer une notification à un utilisateur spécifique
 */
export function sendNotificationToUser(io: SocketIOServer, userId: string, data: any) {
  io.of('/notifications').to(`user:${userId}`).emit('notification', data);
  console.log(`[Socket.io] Notification sent to user: ${userId}`);
}

/**
 * Envoyer une notification à tous les utilisateurs d'un rôle
 */
export function broadcastToRole(io: SocketIOServer, role: string, data: any) {
  io.of('/notifications').to(`role:${role}`).emit('notification', data);
  console.log(`[Socket.io] Broadcast sent to role: ${role}`);
}

/**
 * Envoyer une notification à plusieurs utilisateurs
 */
export function sendNotificationToUsers(io: SocketIOServer, userIds: string[], data: any) {
  userIds.forEach(userId => {
    io.of('/notifications').to(`user:${userId}`).emit('notification', data);
  });
  console.log(`[Socket.io] Notification sent to ${userIds.length} users`);
}

export default { setupSocketIO, sendNotificationToUser, broadcastToRole, sendNotificationToUsers };
