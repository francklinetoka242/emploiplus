import express from 'express';
const router = express.Router();
import {
  getSiteNotifications,
  getSiteNotificationById,
  createSiteNotification,
  updateSiteNotification,
  deleteSiteNotification
} from '../controllers/site-notifications.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// Public endpoint - get all site notifications
router.get('/', getSiteNotifications);

// Admin endpoints
const adminProtect = [requireAdmin, requireRoles('super_admin')];

router.get('/:id', adminProtect, getSiteNotificationById);
router.post('/', adminProtect, createSiteNotification);
router.put('/:id', adminProtect, updateSiteNotification);
router.delete('/:id', adminProtect, deleteSiteNotification);

export default router;
