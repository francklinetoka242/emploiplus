import express from 'express';
const router = express.Router();
import { getHistory } from '../controllers/login-history.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// only admins with appropriate role should view login history
router.get('/', requireAdmin, requireRoles('super_admin'), getHistory);

export default router;
