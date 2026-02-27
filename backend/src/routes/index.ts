import { Router, Router as ExpressRouter } from 'express';
import authRouter from './auth.routes.js';
import jobsRouter from './jobs.routes.js';
import formationsRouter from './formations.routes.js';

const router = ExpressRouter();

/**
 * Point d'entrée central pour toutes les routes API
 * Les modules sont enregistrés ici dans l'ordre souhaité
 * 
 * ARCHITECTURE:
 * ┌──────────────────────────────────────────────┐
 * │         Central Router (index.ts)             │
 * ├──────────────────────────────────────────────┤
 * │ /api/auth       → auth.routes.ts             │
 * │ /api/jobs       → jobs.routes.ts             │
 * │ /api/formations → formations.routes.ts       │
 * └──────────────────────────────────────────────┘
 * 
 * Chaque module est ISOLÉ:
 * - Si /api/auth échoue, /api/jobs et formations continuent
 * - Si /api/jobs échoue, /api/formations et auth continuent
 * - Si une DB manque, les autres modules continuent
 * - Les erreurs sont capturées par le middleware global
 */

// ============================================================
// Routes des Modules
// ============================================================

/**
 * Module Auth - Authentification
 * POST /api/auth/login
 * GET /api/auth/me (protégé)
 * POST /api/auth/logout (protégé)
 */
console.log('📦 Montage du module Auth sur /auth...');
router.use('/auth', authRouter);

/**
 * Module Jobs - Offres d'emploi
 * GET /api/jobs
 * GET /api/jobs/:id
 * GET /api/jobs/search/:query
 * GET /api/jobs/stats
 */
router.use('/jobs', jobsRouter);

/**
 * Module Formations - Formations et cours
 * GET /api/formations
 * GET /api/formations/:id
 * GET /api/formations/search/:query
 * GET /api/formations/stats
 */
router.use('/formations', formationsRouter);

// ============================================================
// Route racine API
// ============================================================

/**
 * GET /api
 * Informations sur l'API disponible
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Emploi Connect Congo v1.0',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (protégé)',
        logout: 'POST /api/auth/logout (protégé)',
        registerAdmin: 'POST /api/auth/register-admin (protégé, super_admin uniquement)',
      },
      jobs: {
        list: 'GET /api/jobs?limit=128&offset=0',
        getById: 'GET /api/jobs/:id',
        search: 'GET /api/jobs/search/:query',
        stats: 'GET /api/jobs/stats',
      },
      formations: {
        list: 'GET /api/formations?limit=100&offset=0',
        getById: 'GET /api/formations/:id',
        search: 'GET /api/formations/search/:query',
        stats: 'GET /api/formations/stats',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
