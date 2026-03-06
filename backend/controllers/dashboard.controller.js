import dashboardService from '../services/dashboard.service.js';
import dashboardModel from '../models/dashboard.model.js';

async function getStats(req, res) {
  try {
    const stats = await dashboardService.getStats();
    res.json({ data: stats });
  } catch (err) {
    console.error('getStats error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// Get overall system status
async function getHealth(req, res) {
  try {
    const status = await dashboardModel.getSystemStatus();
    res.json(status);
  } catch (err) {
    console.error('getHealth error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// Get database health
async function getHealthDB(req, res) {
  try {
    const health = await dashboardModel.getDatabaseHealth();
    res.json(health);
  } catch (err) {
    console.error('getHealthDB error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// Get API health
async function getHealthAPI(req, res) {
  try {
    const health = await dashboardModel.getAPIHealth();
    res.json(health);
  } catch (err) {
    console.error('getHealthAPI error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// Get system metrics
async function getHealthSystem(req, res) {
  try {
    const metrics = await dashboardModel.getSystemMetrics();
    res.json(metrics);
  } catch (err) {
    console.error('getHealthSystem error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

export { getStats, getHealth, getHealthDB, getHealthAPI, getHealthSystem };
