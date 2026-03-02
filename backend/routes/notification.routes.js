import express from 'express';
const router = express.Router();
import { getNotifications, markAsRead } from '../controllers/notification.controller.js';
import { requireUser } from '../middleware/auth.middleware.js';

// GET /api/notifications - retrieve all notifications for current user (protected)
// requires valid user token
// query params: ?limit=20&offset=0
router.get('/', requireUser, getNotifications);

// POST /api/notifications/:id/read - mark a notification as read (protected)
// requires valid user token
// notificationId from URL parameter
router.post('/:id/read', requireUser, markAsRead);

export default router;
