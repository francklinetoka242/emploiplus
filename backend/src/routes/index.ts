/**
 * Main API Routes
 * Placeholder for modular route separation
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
 * Then import and mount them in this file
 */

import express, { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';

const router: Router = express.Router();

/**
 * Placeholder: Health check
 * Remove this once you have real routes
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

/**
 * TODO: Import and mount route modules below
 * Example:
 * 
 * import jobRoutes from './jobs.js';
 * import userRoutes from './users.js';
 * import messagingRoutes from './messaging.js';
 * 
 * router.use('/jobs', jobRoutes);
 * router.use('/users', userRoutes);
 * router.use('/messages', messagingRoutes);
 */

export default router;
  // Mount auth routes
  app.use('/api/auth', authRoutes);
};

/**
 * Route modules will be created following this pattern:
 * 
 * // routes/auth.ts
 * import { Router } from 'express';
 * import { registerRoute } from '../controllers/authController.js';
 * 
 * const router = Router();
 * router.post('/register', registerRoute);
 * router.post('/login', loginRoute);
 * 
 * export default router;
 * 
 * // routes/users.ts
 * import { Router } from 'express';
 * import { userAuth } from '../middleware/auth.js';
 * import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
 * 
 * const router = Router();
 * router.get('/:id', getUserProfile);
 * router.put('/:id', userAuth, updateUserProfile);
 * 
 * export default router;
 */
