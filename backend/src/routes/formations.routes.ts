import { Router } from 'express';
import * as formationsController from '@controllers/formations.controller.js';
import { asyncHandler } from '@middlewares/asyncHandler.js';

const router = Router();

/**
 * Routes pour les formations
 * Préfixe: /api/formations
 * 
 * IMPORTANT: Ce module est complètement isolé
 * Si une erreur survient ici, les autres routes (jobs, etc.) continueront à fonctionner
 */

// GET /api/formations
router.get('/', asyncHandler(formationsController.getFormations));

// GET /api/formations/stats (doit être AVANT /:id sinon conflit)
router.get('/stats', asyncHandler(formationsController.getFormationStats));

// GET /api/formations/search/:query
router.get('/search/:query', asyncHandler(formationsController.searchFormations));

// GET /api/formations/:id
router.get('/:id', asyncHandler(formationsController.getFormationById));

export default router;
