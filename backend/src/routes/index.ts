/**
 * Main API Routes - Minimal version (focus on core functionality)
 * 
 * Temporarily disabled:
 * - Publications/Newsfeed routes
 * - Jobs routes
 * - Advanced features
 * 
 * Enabled:
 * - Health checks
 * - Authentication (via server.ts)
 */

import express, { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';

const router: Router = express.Router();

/**
 * DISABLED: Publications routes
 * import publicationsRoutes from './publications.js';
 * router.use('/publications', publicationsRoutes);
 */

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