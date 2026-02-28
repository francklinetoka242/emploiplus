const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notification.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// GET /api/notifications - retrieve all notifications for current user (protected)
// requires valid JWT token
// query params: ?limit=20&offset=0
router.get('/', authenticateJWT, getNotifications);

// POST /api/notifications/:id/read - mark a notification as read (protected)
// requires valid JWT token
// notificationId from URL parameter
router.post('/:id/read', authenticateJWT, markAsRead);

module.exports = router;
