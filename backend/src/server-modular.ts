/**
 * Backend Server - Main Entry Point (Version VPS Production)
 * * Ce fichier est configuré pour emploiplus-group.com
 */

import express, { Express } from 'express';
import dotenv from 'dotenv';
import { initializeCors } from './middleware/cors.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pool, isConnected, connectedPromise } from './config/database.js';
import { API_PORT, CORS_ORIGIN } from './config/constants.js';
import apiRouter from './routes/index.js';

// Chargement des variables d'environnement (.env)
dotenv.config();

const app: Express = express();

// Configuration pour proxy (CyberPanel/LiteSpeed)
app.set('trust proxy', 1);

// ──────────────────────────────────────────────────
// MIDDLEWARES DE SÉCURITÉ
// ──────────────────────────────────────────────────

// Helmet pour sécuriser les headers HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuration CORS via middleware (gère plusieurs origines et proxy headers)
app.use(initializeCors());

// Limiteur de requêtes pour éviter les attaques brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard.' },
});
app.use('/api/', limiter);

// Parsing des données
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Fichiers statiques (pour les CV et images uploadées)
app.use('/uploads', express.static('uploads'));

// ──────────────────────────────────────────────────
// ENREGISTREMENT DES ROUTES
// ──────────────────────────────────────────────────

// Mount API router under /api
app.use('/api', apiRouter);

// ──────────────────────────────────────────────────
// GESTION DES ERREURS
// ──────────────────────────────────────────────────

// Handler 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} introuvable`,
    path: req.path,
    method: req.method,
  });
});

// Handler d'erreurs global (500)
app.use((err: any, req: any, res: any, next: any) => {
  console.error(' [ERREUR SERVEUR] :', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    // On n'affiche les détails de l'erreur qu'en développement
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// ──────────────────────────────────────────────────
// INITIALISATION BASE DE DONNÉES
// ──────────────────────────────────────────────────

if (isConnected) {
  console.log('📦 Database : Connectée au démarrage');
}

connectedPromise
  .then(() => {
    console.log('✅ Schéma de base de données vérifié');
  })
  .catch((err) => {
    console.error('❌ Échec de la vérification du schéma :', err);
  });

// ──────────────────────────────────────────────────
// DÉMARRAGE DU SERVEUR
// ──────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? API_PORT ?? 5000);

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('==============================================');
  console.log(`🚀 SERVEUR EMPLOIPLUS LANCÉ`);
  // Compute an API display URL from environment variables and normalize it
  const rawApiBase = (process.env.API_BASE_URL || process.env.VITE_API_URL || 'https://emploiplus-group.com').toString();
  const apiDisplay = rawApiBase.replace(/\/+$/g, '').replace(/\/api$/g, '') + '/api';
  console.log(`📡 URL API : ${apiDisplay}`);
  console.log(`🏠 Frontend autorisé : ${allowedOrigin}`);
  console.log(`🛠️  Mode : ${process.env.NODE_ENV || 'production'}`);
  console.log('==============================================');
});

// Arrêt propre (Graceful Shutdown)
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, fermeture du serveur...');
  server.close(() => {
    pool.end().then(() => {
      console.log('Connexions DB fermées. Fin du processus.');
      process.exit(0);
    });
  });
});

export default app;