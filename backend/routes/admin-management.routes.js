import express from 'express';
const router = express.Router();
import {
  listAdmins,
  blockAdmin,
  unblockAdmin,
  deleteAdmin,
  updateAdminRole,
  resendInvite,
  verifyStatus,
  exportStats,
  exportJSON,
  exportPDF,
  exportExcel
} from '../controllers/admin.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// all routes should be protected by requireAdmin + at least super_admin role
const protect = [requireAdmin, requireRoles('super_admin')];

// listing with filters
router.get('/', ...protect, listAdmins);

router.post('/:id/block', ...protect, blockAdmin);
router.post('/:id/unblock', ...protect, unblockAdmin);
router.delete('/:id', ...protect, deleteAdmin);
router.put('/:id/role', ...protect, updateAdminRole);
router.post('/:id/resend-invite', ...protect, resendInvite);
router.get('/:id/verify-status', ...protect, verifyStatus);

// exports
router.get('/export/stats', ...protect, exportStats);
router.get('/export/json', ...protect, exportJSON);
router.post('/export/pdf', ...protect, exportPDF);
router.post('/export/excel', ...protect, exportExcel);

export default router;
