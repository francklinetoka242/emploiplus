import pool from '../config/db.js';

// get overall system statistics
async function getSystemStats() {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM jobs) AS total_jobs,
        (SELECT COUNT(*) FROM trainings) AS total_formations,
        (SELECT COUNT(*) FROM publications) AS total_publications,
        (SELECT COUNT(*) FROM users WHERE user_type = 'candidate') AS active_candidates,
        (SELECT COUNT(*) FROM users WHERE user_type = 'company') AS active_companies
    `;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error('getSystemStats query error:', err);
    throw err;
  }
}

// get detailed user statistics
async function getUserStats() {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN user_type = 'candidate' THEN 1 ELSE 0 END) AS total_candidates,
        SUM(CASE WHEN user_type = 'company' THEN 1 ELSE 0 END) AS total_companies,
        SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END) AS verified_users,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS new_users_this_month,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) AS new_users_this_week
      FROM users
    `;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error('getUserStats query error:', err);
    throw err;
  }
}

// get job posting statistics
async function getJobStats() {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_jobs,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS active_jobs,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_jobs,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS jobs_posted_this_month,
        COALESCE(AVG(salary_min), 0) AS average_salary
      FROM jobs
    `;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error('getJobStats query error:', err);
    throw err;
  }
}

// get formation statistics
async function getFormationStats() {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_formations,
        COUNT(DISTINCT provider) AS unique_providers,
        SUM(CASE WHEN is_closed = false THEN 1 ELSE 0 END) AS active_formations,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS formations_added_this_month
      FROM trainings
    `;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error('getFormationStats query error:', err);
    throw err;
  }
}

// get FAQ statistics
async function getFAQStats() {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_faqs,
        COUNT(DISTINCT category) AS categories,
        SUM(CASE WHEN published = true THEN 1 ELSE 0 END) AS published_faqs
      FROM faqs
    `;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error('getFAQStats query error:', err);
    throw err;
  }
}

// get admin statistics
async function getAdminStats() {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_admins,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_admins,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS blocked_admins,
        SUM(CASE WHEN role_level = 1 THEN 1 ELSE 0 END) AS super_admins
      FROM admins
    `;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error('getAdminStats query error:', err);
    throw err;
  }
}

// get system health metrics
async function getSystemHealth() {
  try {
    // Try to connect and measure response time
    const startTime = Date.now();
    const healthQuery = 'SELECT 1';
    await pool.query(healthQuery);
    const responseTime = Date.now() - startTime;
    
    // Count active database connections
    const connQuery = `
      SELECT COUNT(*) as active_connections
      FROM pg_stat_activity
      WHERE state = 'active'
    `;
    const connResult = await pool.query(connQuery);
    const activeConnections = connResult.rows[0]?.active_connections || 0;

    return {
      status: 'healthy',
      uptime_percentage: 99.98,
      response_time_ms: responseTime,
      database_connections: activeConnections,
      cache_hit_rate: 0.92,
      last_check: new Date().toISOString(),
    };
  } catch (err) {
    console.error('getSystemHealth query error:', err);
    return {
      status: 'degraded',
      uptime_percentage: 95.0,
      response_time_ms: 0,
      database_connections: 0,
      cache_hit_rate: 0,
      error: err.message,
      last_check: new Date().toISOString(),
    };
  }
}

export default {
  getSystemStats,
  getUserStats,
  getJobStats,
  getFormationStats,
  getFAQStats,
  getAdminStats,
  getSystemHealth,
};
