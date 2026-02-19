import cors from 'cors';

export function initializeCors() {
  const rawOrigins = process.env.CORS_ORIGINS || 
    'https://emploiplus-group.com,http://localhost:5173,http://localhost:5174';
  
  const allowedOrigins = rawOrigins.split(',').map((s) => s.trim());

  return cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Sécurité : Si l'origine contient une virgule (doublée par le proxy), on prend la première
      const cleanOrigin = origin.includes(',') ? origin.split(',')[0].trim() : origin;

      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      console.error(`🚨 CORS bloqué pour : ${cleanOrigin}`);
      callback(new Error(`CORS policy: origin ${cleanOrigin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-webhook-secret'],
    maxAge: 86400, 
  });
}