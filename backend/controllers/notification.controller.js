import notificationService from '../services/notification.service.js';

async function getNotifications(req, res) {
  try {
    const list = await notificationService.getNotifications(req.user, req.query);
    res.json({ data: list });
  } catch (err) {
    console.error('getNotifications error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function getUnreadCount(req, res) {
  try {
    const count = await notificationService.getUnreadCount(req.user);
    res.json({ data: count });
  } catch (err) {
    console.error('getUnreadCount error', err);
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

async function markAllAsRead(req, res) {
  try {
    const result = await notificationService.markAllAsRead(req.user);
    res.json({ data: result });
  } catch (err) {
    console.error('markAllAsRead error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function deleteNotification(req, res) {
  try {
    await notificationService.deleteNotification(req.params.id, req.user);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('deleteNotification error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

export { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
