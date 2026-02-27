import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createClient as createRedisClient } from 'redis';
import { pool } from '../config/database.js';
import { verifySocketToken } from '../middleware/auth.js';
import { redisConfig } from '../config/redis.js';

declare module 'socket.io' {
  interface Socket { user?: User; }
}

interface User {
  id: string;
  email: string;
  role: 'candidate' | 'company' | 'admin';
}

/**
 * Configuration Socket.io (Version PostgreSQL Local - Sans Supabase)
 */
export function setupSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'https://emploiplus-group.com',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Adapter Redis pour le multi-processus
  if (redisConfig.host || redisConfig.url) {
    const { createAdapter } = require('@socket.io/redis-adapter');
    const pubClient = createRedisClient(redisConfig as any);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
  }

  io.use((socket, next) => verifySocketToken(socket, next));

  const messagesNamespace = io.of('/messages');

  messagesNamespace.on('connection', (socket: Socket) => {
    const user = socket.user!;

    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Envoi de message avec persistance PostgreSQL Locale
    socket.on('send_message', async (data) => {
      const { conversationId, content, recipientId } = data;

      try {
        const result = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, recipient_id, content, created_at)
           VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
          [conversationId, user.id, recipientId, content]
        );

        const savedMessage = result.rows[0];

        // Mettre à jour la date de dernière activité de la conversation
        await pool.query(
          `UPDATE conversations SET last_message = $1, last_message_at = NOW() WHERE id = $2`,
          [content, conversationId]
        );

        messagesNamespace.to(`conversation:${conversationId}`).emit('new_message', {
          ...savedMessage,
          senderEmail: user.email
        });
      } catch (err) {
        console.error('[Socket Error] Database save failed:', err);
        socket.emit('error', { message: 'Erreur lors de l\'enregistrement du message' });
      }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: user.id,
        isTyping
      });
    });

    socket.on('disconnect', () => console.log(`[Socket] Déconnecté: ${user.id}`));
  });

  return io;
}

export const notifyUser = (io: SocketIOServer, userId: string, data: any) => {
  io.of('/notifications').to(`user:${userId}`).emit('notification', data);
};

export default { setupSocketIO };