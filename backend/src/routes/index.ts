/**
 * Main API Routes - Placeholder for modular route separation
 * 
 * MIGRATION GUIDE:
 * Extract routes from server.old.ts and organize by domain:
 * - routes/jobs.ts (jobs, job-applications)
 * - routes/users.ts (users, profiles)
 * - routes/formations.ts (formations)
 * - routes/messaging.ts (conversations, messages)
 * - routes/feed.ts (newsfeed, posts)
 * - routes/admin.ts (admin-specific endpoints)
 * - routes/search.ts (search endpoints)
 * 
 * Then import and mount them in this file:
 * import jobRoutes from './jobs.js';
 * router.use('/jobs', jobRoutes);
 */

import express, { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';

const router: Router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'emploi-connect-api',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Database health check
 */
router.get('/health/db', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'PostgreSQL',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'PostgreSQL',
      message: error instanceof Error ? error.message : 'Database unavailable',
    });
  }
});

export default router;