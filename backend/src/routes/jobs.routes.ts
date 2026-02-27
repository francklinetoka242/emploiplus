import { Router } from 'express';
import * as jobsController from '@controllers/jobs.controller.js';
import { asyncHandler } from '@middlewares/asyncHandler.js';

const router = Router();

/**
 * Routes pour les offres d'emploi
 * Préfixe: /api/jobs
 */

// GET /api/jobs
router.get('/', asyncHandler(jobsController.getJobs));

// GET /api/jobs/stats (doit être AVANT /:id sinon conflit)
router.get('/stats', asyncHandler(jobsController.getJobStats));

// GET /api/jobs/search/:query
router.get('/search/:query', asyncHandler(jobsController.searchJobs));

// GET /api/jobs/:id
router.get('/:id', asyncHandler(jobsController.getJobById));

export default router;
