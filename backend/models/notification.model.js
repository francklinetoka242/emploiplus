const pool = require('../config/db');

// retrieve all notifications for a specific user
async function getUserNotifications(userId, limit = 20, offset = 0) {
  try {
    const query = `
      SELECT id, user_id, title, message, type, is_read, created_at, updated_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  } catch (err) {
    console.error('getUserNotifications query error:', err);
    throw err;
  }
}

// retrieve unread notifications count for a user
async function getUnreadNotificationsCount(userId) {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  } catch (err) {
    console.error('getUnreadNotificationsCount query error:', err);
    throw err;
  }
}

// retrieve a single notification by ID
async function getNotificationById(notificationId) {
  try {
    const query = `
      SELECT id, user_id, title, message, type, is_read, created_at, updated_at
      FROM notifications
      WHERE id = $1
    `;
    const result = await pool.query(query, [notificationId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getNotificationById query error:', err);
    throw err;
  }
}

// create a new notification
async function createNotification(userId, title, message, type = 'info') {
  try {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, is_read, created_at, updated_at)
      VALUES ($1, $2, $3, $4, false, NOW(), NOW())
      RETURNING id, user_id, title, message, type, is_read, created_at, updated_at
    `;
    const result = await pool.query(query, [userId, title, message, type]);
    return result.rows[0];
  } catch (err) {
    console.error('createNotification query error:', err);
    throw err;
  }
}

// mark a notification as read
async function markNotificationAsRead(notificationId) {
  try {
    const query = `
      UPDATE notifications
      SET is_read = true, updated_at = NOW()
      WHERE id = $1
      RETURNING id, user_id, title, message, type, is_read, created_at, updated_at
    `;
    const result = await pool.query(query, [notificationId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('markNotificationAsRead query error:', err);
    throw err;
  }
}

// mark all notifications as read for a user
async function markAllNotificationsAsRead(userId) {
  try {
    const query = `
      UPDATE notifications
      SET is_read = true, updated_at = NOW()
      WHERE user_id = $1 AND is_read = false
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  } catch (err) {
    console.error('markAllNotificationsAsRead query error:', err);
    throw err;
  }
}

// delete a notification by ID
async function deleteNotification(notificationId) {
  try {
    const query = 'DELETE FROM notifications WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [notificationId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteNotification query error:', err);
    throw err;
  }
}

// delete all notifications for a user
async function deleteUserNotifications(userId) {
  try {
    const query = 'DELETE FROM notifications WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  } catch (err) {
    console.error('deleteUserNotifications query error:', err);
    throw err;
  }
}

module.exports = {
  getUserNotifications,
  getUnreadNotificationsCount,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteUserNotifications,
};
