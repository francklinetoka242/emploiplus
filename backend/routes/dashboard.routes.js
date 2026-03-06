import express from 'express';
const router = express.Router();
import { getStats, getHealth, getHealthDB, getHealthAPI, getHealthSystem } from '../controllers/dashboard.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

// GET /api/dashboard/stats - retrieve dashboard statistics (protected)
// requires admin token (admin-only access required)
// returns system health, user counts, revenue, etc.
router.get('/stats', requireAdmin, getStats);

// Health check endpoints
router.get('/health', requireAdmin, getHealth);
router.get('/health/db', requireAdmin, getHealthDB);
router.get('/health/api', requireAdmin, getHealthAPI);
router.get('/health/system', requireAdmin, getHealthSystem);

export default router;
