import express from 'express';
const router = express.Router();
import { getStats } from '../controllers/dashboard.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

// GET /api/dashboard/stats - retrieve dashboard statistics (protected)
// requires admin token (admin-only access required)
// returns system health, user counts, revenue, etc.
router.get('/stats', requireAdmin, getStats);

export default router;
