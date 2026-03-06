import express from 'express';
const router = express.Router();
import {
  listAdmins,
  getAdminById,
  updateAdminPermissions,
  createAdmin,
  updateAdmin,
  getCurrentAdminProfile,
  updateCurrentAdminProfile,
  changeAdminPassword
} from '../controllers/admin.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

const protect = [requireAdmin, requireRoles('super_admin')];
const adminOnly = [requireAdmin];

// Debug route for testing authentication
router.get('/test/auth', adminOnly, (req, res) => {
  res.json({ success: true, user: req.user, message: 'Authentication works!' });
});

// Profile routes (for current admin)
// GET /api/admins/profile/me - Get current admin profile
router.get('/profile/me', adminOnly, getCurrentAdminProfile);

// PUT /api/admins/profile/me - Update current admin profile
router.put('/profile/me', adminOnly, updateCurrentAdminProfile);

// POST /api/admins/profile/change-password - Change admin password
router.post('/profile/change-password', adminOnly, changeAdminPassword);

// Admin management routes (requires super_admin)
// POST /api/admins - Create new admin
router.post('/', protect, createAdmin);

// GET /api/admins - Get list of all admins
router.get('/', protect, listAdmins);

// GET /api/admins/:id - Get admin details
router.get('/:id', protect, getAdminById);

// PUT /api/admins/:id - Update admin details
router.put('/:id', protect, updateAdmin);

// POST /api/admins/:id/permissions - Update admin permissions
router.post('/:id/permissions', protect, updateAdminPermissions);

export default router;
