import express from 'express';
const router = express.Router();
import {
  getNotifications,
  markAsRead,
  getUnreadCount,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller.js';
import { requireUser } from '../middleware/auth.middleware.js';

// GET /api/notifications - retrieve all notifications for current user (protected)
// requires valid user token
// query params: ?limit=20&offset=0
router.get('/', requireUser, getNotifications);

// GET /api/notifications/unread-count - retrieve the count of unread notifications
router.get('/unread-count', requireUser, getUnreadCount);

// POST /api/notifications/:id/read - mark a notification as read (protected)
// notificationId from URL parameter
router.post('/:id/read', requireUser, markAsRead);

// POST /api/notifications/read-all - mark all notifications as read for current user
router.post('/read-all', requireUser, markAllAsRead);

// DELETE /api/notifications/:id - remove a notification (protected)
router.delete('/:id', requireUser, deleteNotification);

export default router;
