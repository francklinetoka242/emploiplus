/**
 * Main API Routes - Central routing hub
 * 
 * Mounts all domain-specific routes:
 * - /publications - newsfeed and publications
 * - /auth - authentication (mounted in server.ts)
 * - Additional routes to be added as needed
 */

import express, { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';
import publicationsRoutes from './publications.js';

const router: Router = express.Router();

/**
 * Mount sub-routers
 */
router.use('/publications', publicationsRoutes);

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