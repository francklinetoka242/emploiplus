/**
 * CORS Configuration Middleware
 * Dynamic origin allowlist from environment
 */

import cors from 'cors';

export function initializeCors() {
  const rawOrigins = process.env.CORS_ORIGINS || 
    'https://emploiplus-group.com,http://localhost:5173,http://localhost:5174,http://192.168.0.14:5173,http://192.168.0.14:5174';
  
  const allowedOrigins = rawOrigins.split(',').map((s) => s.trim());

  return cors({
    origin: (origin, callback) => {
      // Allow requests without origin (curl, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check against allowlist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Default reject with clear error
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-webhook-secret'],
    maxAge: 86400, // 24 hours
  });
}
