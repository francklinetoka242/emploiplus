import SiteNotificationsModel from '../models/site-notifications.model.js';

async function getSiteNotifications(req, res) {
  try {
    const notifications = await SiteNotificationsModel.getAllSiteNotifications();
    res.json({ data: notifications });
  } catch (err) {
    console.error('getSiteNotifications error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function getSiteNotificationById(req, res) {
  try {
    const notification = await SiteNotificationsModel.getSiteNotificationById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ data: notification });
  } catch (err) {
    console.error('getSiteNotificationById error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function createSiteNotification(req, res) {
  try {
    const notification = await SiteNotificationsModel.createSiteNotification(req.body);
    res.status(201).json({ data: notification });
  } catch (err) {
    console.error('createSiteNotification error', err);
    const status = /required|already in use/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function updateSiteNotification(req, res) {
  try {
    const notification = await SiteNotificationsModel.updateSiteNotification(req.params.id, req.body);
    res.json({ data: notification });
  } catch (err) {
    console.error('updateSiteNotification error', err);
    const status = /not found/i.test(err.message) ? 404 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function deleteSiteNotification(req, res) {
  try {
    await SiteNotificationsModel.deleteSiteNotification(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('deleteSiteNotification error', err);
    const status = /not found/i.test(err.message) ? 404 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

export {
  getSiteNotifications,
  getSiteNotificationById,
  createSiteNotification,
  updateSiteNotification,
  deleteSiteNotification,
};
