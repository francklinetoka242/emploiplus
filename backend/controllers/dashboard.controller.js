const dashboardService = require('../services/dashboard.service');

async function getStats(req, res) {
  try {
    const stats = await dashboardService.getStats();
    res.json({ data: stats });
  } catch (err) {
    console.error('getStats error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = { getStats };
