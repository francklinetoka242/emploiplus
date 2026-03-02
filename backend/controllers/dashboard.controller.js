import dashboardService from '../services/dashboard.service.js';

async function getStats(req, res) {
  try {
    const stats = await dashboardService.getStats();
    res.json({ data: stats });
  } catch (err) {
    console.error('getStats error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

export { getStats };
