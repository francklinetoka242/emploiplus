import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { redisConfig } from '../config/redis.js';
import { createClient as createRedisClient } from 'redis';

// Tracking des utilisateurs en mémoire
const activeUsers = new Map<string, Set<string>>();

export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'https://emploiplus-group.com',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Adapter Redis pour PM2 (scaling)
  if (redisConfig.host || redisConfig.url) {
    const { createAdapter } = require('@socket.io/redis-adapter');
    const pubClient = createRedisClient(redisConfig as any);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
  }

  // Middleware d'authentification (PostgreSQL / JWT Local)
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Auth requise'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret') as any;
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;

    // Gestion de la présence
    if (!activeUsers.has(userId)) activeUsers.set(userId, new Set());
    activeUsers.get(userId)!.add(socket.id);
    io.emit('user_online', { userId, status: 'online' });

    // Rejoindre une conversation
    socket.on('join_conversation', ({ conversationId }) => socket.join(conversationId));

    // Message Privé avec PostgreSQL
    socket.on('private_message', async (data) => {
      const { conversationId, recipientId, content, type = 'text' } = data;
      try {
        const { rows } = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, recipient_id, content, message_type)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [conversationId, userId, recipientId, content, type]
        );

        const savedMessage = rows[0];
        
        // Broadcast à la room de conversation
        io.to(conversationId).emit('private_message', { ...savedMessage, timestamp: new Date() });
        
        // Confirmation à l'envoyeur
        socket.emit('message_delivered', { conversationId, messageId: savedMessage.id });

      } catch (err) {
        socket.emit('error', { message: 'Erreur sauvegarde message' });
      }
    });

    // Indicateur d'écriture
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('user_typing', { userId, isTyping });
    });

    socket.on('disconnect', () => {
      const userSockets = activeUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUsers.delete(userId);
          io.emit('user_offline', { userId });
        }
      }
    });
  });

  return io;
}

// Helpers exports
export const isUserOnline = (userId: string) => activeUsers.has(userId);
export default { initializeSocketIO, isUserOnline };