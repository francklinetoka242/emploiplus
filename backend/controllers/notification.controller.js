const notificationService = require('../services/notification.service');

async function getNotifications(req, res) {
  try {
    const list = await notificationService.getNotifications(req.user, req.query);
    res.json({ data: list });
  } catch (err) {
    console.error('getNotifications error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function markAsRead(req, res) {
  try {
    await notificationService.markAsRead(req.params.id, req.user);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('markAsRead error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = { getNotifications, markAsRead };
