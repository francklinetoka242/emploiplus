/**
 * Backend Server - Main Entry Point (Version VPS Production)
 * * Ce fichier est configuré pour emploiplus-group.com
 */

import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pool, isConnected, connectedPromise } from './config/database.js';
import { API_PORT, CORS_ORIGIN } from './config/constants.js';
import { registerRoutes } from './routes/index.js';

// Chargement des variables d'environnement (.env)
dotenv.config();

const app: Express = express();

// ──────────────────────────────────────────────────
// MIDDLEWARES DE SÉCURITÉ
// ──────────────────────────────────────────────────

// Helmet pour sécuriser les headers HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuration CORS Dynamique (VPS + Local)
// On donne la priorité au FRONTEND_URL du .env (ton domaine réel)
const allowedOrigin = process.env.FRONTEND_URL || CORS_ORIGIN;

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

registerRoutes(app);

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

const PORT = process.env.PORT || API_PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('==============================================');
  console.log(`🚀 SERVEUR EMPLOIPLUS LANCÉ`);
  console.log(`📡 URL API : https://emploiplus-group.com/api`);
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