/**
 * Production-Grade Backend Entry Point - Emploi Plus
 * Optimized for VPS Deployment (Ubuntu)
 */

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

import { pool, connectedPromise, shutdown } from './config/database.js';
import { initializeCors } from './middleware/cors.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
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
  message: { 
    status: 429, 
    message: `Trop de requêtes. Veuillez réessayer après ${process.env.RATE_LIMIT_WINDOW || '15'} minutes.` 
  },
});
app.use('/api/', apiLimiter);

// ──────────────────────────────────────────────
// ROUTE MOUNTING
// ──────────────────────────────────────────────

// Importation dynamique ou directe des routes modulaires
import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/admin-auth.js';
import apiRoutes from './routes/index.js';

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api', apiRoutes);

// Endpoint Health Check pour PM2 ou UptimeRobot
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
    // On attend que PostgreSQL soit prêt
    await connectedPromise;

    const PORT = parseInt(process.env.PORT || '5000', 10);
    const HOST = '0.0.0.0'; // Écoute externe sur le VPS

    httpServer.listen(PORT, HOST, () => {
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