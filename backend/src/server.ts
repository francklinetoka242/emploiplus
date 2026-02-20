/**
 * Production-Grade Backend Entry Point - Emploi Plus
 * Optimized for VPS Deployment (Ubuntu)
 */

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { createServer } from 'http';

import { pool, connectedPromise, shutdown } from './config/database.js';
import { initializeCors } from './middleware/cors.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// 💡 CORRECTIF : Indispensable derrière un reverse proxy (CyberPanel/LiteSpeed)
// Cela permet à express-rate-limit de récupérer l'IP réelle du client.
app.set('trust proxy', 1); 

const httpServer = createServer(app);

// ──────────────────────────────────────────────
// MIDDLEWARE SETUP (Sécurité & Performance)
// ──────────────────────────────────────────────

// Helmet avec configuration HSTS dynamique depuis le .env
app.use(helmet({
  hsts: {
    maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10),
    includeSubDomains: true,
    preload: true
  }
}));

// ✅ COMPRESSION GZIP - Réduit la taille des réponses de 70-80%
// Essentiel pour les zones à bas débit
app.use(compression({
  level: 6, // Compression level (0-9): 6 = bon équilibre CPU/compression
  threshold: 512, // Compresser seulement si réponse > 512 bytes
  filter: (req, res) => {
    // Ne pas compresser WebP (déjà compressé)
    if (req.headers['accept']?.includes('image/webp')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(requestLogger);
app.use(initializeCors());

// Body parsing avec limite stricte (Protection DoS)
const jsonLimit = process.env.MAX_JSON_SIZE || '1mb';
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ limit: jsonLimit, extended: true }));

// Rate limiting (Protection Brute-force & Spam)
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
  standardHeaders: true, 
  legacyHeaders: false,
  // 💡 Note: trust proxy (défini plus haut) évite l'erreur ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
  message: { 
    status: 429, 
    message: `Trop de requêtes. Veuillez réessayer après ${process.env.RATE_LIMIT_WINDOW || '15'} minutes.` 
  },
});
// Apply rate limiter to API entrypoints. Also protect the non-prefixed
// mounts (`/auth` and `/admin`) in case the frontend sends requests
// without the `/api` prefix (common after proxy rewrites).
app.use(['/api/', '/auth', '/admin'], apiLimiter);

// ──────────────────────────────────────────────
// ROUTE MOUNTING
// ──────────────────────────────────────────────

import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/admin-auth.js';
import adminRoutes from './routes/admin.js';
import securityMonitoringRoutes from './routes/security-monitoring.js';
import apiRoutes from './routes/index.js';

// Mount routes both with and without the `/api` prefix so the backend
// accepts calls that come from misconfigured frontends or proxies.
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin-auth', adminAuthRoutes);
app.use('/admin-auth', adminAuthRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/security', securityMonitoringRoutes);
app.use('/security', securityMonitoringRoutes);

app.use('/api', apiRoutes);

app.get('/_health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database: pool.totalCount > 0 ? 'connected' : 'connecting'
  });
});

app.use(errorHandler);

// ──────────────────────────────────────────────
// SERVER STARTUP
// ──────────────────────────────────────────────

async function startServer() {
  try {
    await connectedPromise;

    const PORT = parseInt(process.env.PORT || '5000', 10);
    const HOST = '0.0.0.0';

    httpServer.listen(Number(PORT), HOST, () => {
      console.log('\n┌─────────────────────────────────────┐');
      console.log('│    🚀 BACKEND EMPLOI PLUS PRÊT      │');
      console.log(`│    Port      : ${PORT.toString().padEnd(21)}│`);
      console.log(`│    JSON Limit: ${jsonLimit.padEnd(21)}│`);
      console.log(`│    HSTS      : Active (1 year)      │`);
      console.log(`│    Mode      : ${process.env.NODE_ENV?.padEnd(21)}│`);
      console.log('└─────────────────────────────────────┘\n');
    });
  } catch (error) {
    console.error('❌ Erreur critique au démarrage:', error);
    process.exit(1);
  }
}

// ──────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ──────────────────────────────────────────────

const stopSignals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
stopSignals.forEach(signal => {
  process.on(signal, async () => {
    console.log(`\n${signal} reçu. Fermeture des services...`);
    try {
      await shutdown();
      httpServer.close(() => {
        console.log('Serveur HTTP arrêté. Bye! 👋');
        process.exit(0);
      });
    } catch (err) {
      console.error('Erreur lors de la fermeture:', err);
      process.exit(1);
    }
  });
});

startServer();