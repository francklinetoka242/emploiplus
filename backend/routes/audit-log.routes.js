import express from 'express';
const router = express.Router();
import {
  getAuditLogs,
  getAuditModules,
  createAuditLog,
} from '../controllers/audit-log.controller.js';

// Get all audit logs (super admin only)
// Note: requireAdmin and requireRoles are already applied at app level
router.get('/', getAuditLogs);

// Get distinct modules for filtering
router.get('/modules', getAuditModules);

// Create audit log (internal use - called by middleware)
router.post('/', createAuditLog);

export default router;
