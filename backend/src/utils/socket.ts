/**
 * ============================================================================
 * Socket.io Configuration: Real-time Messaging
 * ============================================================================
 * 
 * WebSocket server pour:
 * 1. Typing indicators (user is typing...)
 * 2. Real-time private messages
 * 3. Presence status (online/offline)
 * 4. Message archival dans Supabase
 * 
 * Usage in server.ts:
 * ```typescript
 * import { initializeSocketIO } from './utils/socket.js';
 * 
 * const httpServer = http.createServer(app);
 * const io = initializeSocketIO(httpServer);
 * ```
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { notifyNewMessage } from '../services/pushNotificationService.js';

// Map to track active connections: userId -> socketId
const activeUsers = new Map<string, Set<string>>();

// Map to track typing status: conversationId -> Set of typing userIds
const typingUsers = new Map<string, Set<string>>();

/**
 * Initialize Socket.io server
 */
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware: Verify JWT on connection
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify Supabase JWT
      const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET || '', {
        algorithms: ['HS256'],
        audience: 'authenticated',
      }) as any;

      // Attach user info to socket
      socket.data.userId = decoded.sub; // Supabase user ID
      socket.data.email = decoded.email;
      socket.data.authenticated = true;

      console.log('[Socket.io] ✅ User authenticated:', {
        userId: socket.data.userId,
        email: socket.data.email,
        socketId: socket.id,
      });

      next();

    } catch (error) {
      console.error('[Socket.io] Authentication error:', error);
      next(new Error('Invalid token'));
    }
  });

  // =========================================================================
  // CONNECTION HANDLERS
  // =========================================================================

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    const socketId = socket.id;

    console.log('[Socket.io] User connected:', { userId, socketId });

    // Track active user
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId)!.add(socketId);

    // Notify other users that this user is online
    io.emit('user_online', {
      userId,
      status: 'online',
      timestamp: new Date().toISOString(),
    });

    // =========================================================================
    // TYPING EVENT
    // =========================================================================
    
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      try {
        const { conversationId, isTyping } = data;

        if (!conversationId) {
          console.warn('[Socket.io Typing] Missing conversationId');
          return;
        }

        // Track typing status
        if (!typingUsers.has(conversationId)) {
          typingUsers.set(conversationId, new Set());
        }

        if (isTyping) {
          typingUsers.get(conversationId)!.add(userId);
        } else {
          typingUsers.get(conversationId)!.delete(userId);
        }

        // Broadcast typing status to conversation room
        io.to(conversationId).emit('user_typing', {
          userId,
          conversationId,
          isTyping,
          timestamp: new Date().toISOString(),
        });

        console.log('[Socket.io Typing]', {
          userId,
          conversationId,
          isTyping,
          typingCount: typingUsers.get(conversationId)?.size || 0,
        });

      } catch (error) {
        console.error('[Socket.io Typing] Error:', error);
      }
    });

    // =========================================================================
    // PRIVATE MESSAGE EVENT
    // =========================================================================
    
    socket.on(
      'private_message',
      async (data: {
        conversationId: string;
        recipientId: string;
        content: string;
        type?: 'text' | 'image' | 'file';
      }) => {
        try {
          const { conversationId, recipientId, content, type = 'text' } = data;

          if (!conversationId || !recipientId || !content) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
          }

          console.log('[Socket.io Message] New message', {
            from: userId,
            to: recipientId,
            conversationId,
            type,
          });

          // ===================================================================
          // Step 1: Archive message in Supabase
          // ===================================================================

          const supabase = createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_KEY || ''
          );

          const { data: savedMessage, error: dbError } = await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              sender_id: userId,
              recipient_id: recipientId,
              content: content,
              message_type: type,
              is_read: false,
              created_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (dbError) {
            console.error('[Socket.io Message] DB error:', dbError);
            socket.emit('error', { message: 'Failed to save message' });
            return;
          }

          // ===================================================================
          // Step 2: Broadcast message to recipient(s)
          // ===================================================================

          const messagePayload = {
            id: savedMessage?.id,
            conversationId,
            senderId: userId,
            recipientId,
            content,
            type,
            timestamp: new Date().toISOString(),
          };

          // Send to recipient's sockets
          const recipientSockets = activeUsers.get(recipientId);
          if (recipientSockets && recipientSockets.size > 0) {
            // User is online
            recipientSockets.forEach(socketId => {
              io.to(socketId).emit('private_message', messagePayload);
            });
            console.log('[Socket.io Message] ✅ Delivered to', recipientSockets.size, 'devices');
          } else {
            // User is offline - send push notification
            console.log('[Socket.io Message] User offline, sending push notification');
            notifyNewMessage(recipientId, 'Message received', content.substring(0, 50))
              .catch(err => console.error('[Socket.io Message] Push error:', err));
          }

          // ===================================================================
          // Step 3: Confirm delivery to sender
          // ===================================================================

          socket.emit('message_delivered', {
            conversationId,
            messageId: savedMessage?.id,
            timestamp: new Date().toISOString(),
          });

          // ===================================================================
          // Step 4: Clear typing indicator
          // ===================================================================

          if (typingUsers.has(conversationId)) {
            typingUsers.get(conversationId)!.delete(userId);
          }
          io.to(conversationId).emit('user_typing', {
            userId,
            conversationId,
            isTyping: false,
            timestamp: new Date().toISOString(),
          });

        } catch (error) {
          console.error('[Socket.io Message] Error:', error);
          socket.emit('error', {
            message: (error as any).message || 'Failed to send message',
          });
        }
      }
    );

    // =========================================================================
    // JOIN CONVERSATION ROOM
    // =========================================================================
    
    socket.on('join_conversation', (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;

        if (!conversationId) {
          console.warn('[Socket.io] Missing conversationId in join_conversation');
          return;
        }

        socket.join(conversationId);
        console.log('[Socket.io] User joined conversation', {
          userId,
          conversationId,
          socketId,
        });

        // Notify others in the room
        io.to(conversationId).emit('user_joined', {
          userId,
          conversationId,
          timestamp: new Date().toISOString(),
        });

      } catch (error) {
        console.error('[Socket.io Join] Error:', error);
      }
    });

    // =========================================================================
    // LEAVE CONVERSATION ROOM
    // =========================================================================
    
    socket.on('leave_conversation', (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;

        socket.leave(conversationId);
        console.log('[Socket.io] User left conversation', { userId, conversationId });

        // Clear typing status
        if (typingUsers.has(conversationId)) {
          typingUsers.get(conversationId)!.delete(userId);
        }

        // Notify others
        io.to(conversationId).emit('user_left', {
          userId,
          conversationId,
          timestamp: new Date().toISOString(),
        });

      } catch (error) {
        console.error('[Socket.io Leave] Error:', error);
      }
    });

    // =========================================================================
    // PRESENCE: Get online users
    // =========================================================================
    
    socket.on('get_online_users', (callback?: (users: string[]) => void) => {
      try {
        const onlineUserIds = Array.from(activeUsers.keys());
        if (callback) {
          callback(onlineUserIds);
        }
        socket.emit('online_users', onlineUserIds);
      } catch (error) {
        console.error('[Socket.io Online Users] Error:', error);
      }
    });

    // =========================================================================
    // DISCONNECTION
    // =========================================================================
    
    socket.on('disconnect', () => {
      try {
        // Remove from active users
        const userSockets = activeUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socketId);
          if (userSockets.size === 0) {
            activeUsers.delete(userId);
            // User is now offline
            io.emit('user_offline', {
              userId,
              status: 'offline',
              timestamp: new Date().toISOString(),
            });
          }
        }

        // Clear typing status for all conversations
        typingUsers.forEach(typingSet => {
          typingSet.delete(userId);
        });

        console.log('[Socket.io] User disconnected:', { userId, socketId });

      } catch (error) {
        console.error('[Socket.io Disconnect] Error:', error);
      }
    });
  });

  console.log('[Socket.io] ✅ Initialized on port', process.env.PORT || 5000);
  return io;
}

/**
 * Get number of active connections
 */
export function getActiveUserCount(): number {
  return activeUsers.size;
}

/**
 * Get active sockets for a specific user
 */
export function getUserSockets(userId: string): Set<string> | undefined {
  return activeUsers.get(userId);
}

/**
 * Check if user is online
 */
export function isUserOnline(userId: string): boolean {
  return activeUsers.has(userId) && (activeUsers.get(userId)?.size || 0) > 0;
}

/**
 * Get typing users in a conversation
 */
export function getTypingUsers(conversationId: string): string[] {
  return Array.from(typingUsers.get(conversationId) || new Set());
}

export default {
  initializeSocketIO,
  getActiveUserCount,
  getUserSockets,
  isUserOnline,
  getTypingUsers,
};
