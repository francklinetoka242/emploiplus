import dashboardModel from '../models/dashboard.model.js';

// aggregate all statistics for the dashboard
async function getStats() {
  try {
    // Fetch all stats in parallel
    const [systemStats, userStats, jobStats, formationStats, faqStats, adminStats, healthStatus] = 
      await Promise.all([
        dashboardModel.getSystemStats(),
        dashboardModel.getUserStats(),
        dashboardModel.getJobStats(),
        dashboardModel.getFormationStats(),
        dashboardModel.getFAQStats(),
        dashboardModel.getAdminStats(),
        dashboardModel.getSystemHealth(),
      ]);

    return {
      timestamp: new Date().toISOString(),
      system: systemStats,
      users: userStats,
      jobs: jobStats,
      formations: formationStats,
      faqs: faqStats,
      admins: adminStats,
      system_health: healthStatus,
    };
  } catch (err) {
    console.error('getStats service error:', err);
    throw err;
  }
}

// get detailed user statistics
async function getUserStats() {
  try {
    const stats = await dashboardModel.getUserStats();
    return stats;
  } catch (err) {
    console.error('getUserStats service error:', err);
    throw err;
  }
}

// get job posting statistics
async function getJobStats() {
  try {
    const stats = await dashboardModel.getJobStats();
    return stats;
  } catch (err) {
    console.error('getJobStats service error:', err);
    throw err;
  }
}

// get formation statistics
async function getFormationStats() {
  try {
    const stats = await dashboardModel.getFormationStats();
    return stats;
  } catch (err) {
    console.error('getFormationStats service error:', err);
    throw err;
  }
}

// get system health
async function getSystemHealth() {
  try {
    const health = await dashboardModel.getSystemHealth();
    return health;
  } catch (err) {
    console.error('getSystemHealth service error:', err);
    throw err;
  }
}

export default {
  getStats,
  getUserStats,
  getJobStats,
  getFormationStats,
  getSystemHealth,
};
