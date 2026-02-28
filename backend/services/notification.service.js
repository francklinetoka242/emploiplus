const NotificationModel = require('../models/notification.model');

// retrieve all notifications for current user
async function getNotifications(user, query = {}) {
  try {
    if (!user || !user.id) {
      throw new Error('Authenticated user is required');
    }

    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    // fetch notifications for current user
    const notifications = await NotificationModel.getUserNotifications(user.id, limit, offset);
    return notifications;
  } catch (err) {
    console.error('getNotifications service error:', err);
    throw err;
  }
}

// retrieve unread notifications count for current user
async function getUnreadCount(user) {
  try {
    if (!user || !user.id) {
      throw new Error('Authenticated user is required');
    }

    const count = await NotificationModel.getUnreadNotificationsCount(user.id);
    return { unread_count: count };
  } catch (err) {
    console.error('getUnreadCount service error:', err);
    throw err;
  }
}

// mark a notification as read
async function markAsRead(notificationId, user) {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    if (!user || !user.id) {
      throw new Error('Authenticated user is required');
    }

    // verify notification exists and belongs to user
    const notification = await NotificationModel.getNotificationById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    if (notification.user_id !== user.id) {
      throw new Error('Access denied: notification does not belong to you');
    }

    // mark as read
    const updated = await NotificationModel.markNotificationAsRead(notificationId);
    return { success: true, notification: updated };
  } catch (err) {
    console.error('markAsRead service error:', err);
    throw err;
  }
}

// mark all notifications as read for current user
async function markAllAsRead(user) {
  try {
    if (!user || !user.id) {
      throw new Error('Authenticated user is required');
    }

    const count = await NotificationModel.markAllNotificationsAsRead(user.id);
    return { success: true, updated_count: count };
  } catch (err) {
    console.error('markAllAsRead service error:', err);
    throw err;
  }
}

// create a notification (internal use)
async function createNotification(userId, title, message, type = 'info') {
  try {
    if (!userId || !title || !message) {
      throw new Error('User ID, title, and message are required');
    }

    const notification = await NotificationModel.createNotification(userId, title, message, type);
    return notification;
  } catch (err) {
    console.error('createNotification service error:', err);
    throw err;
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
};
