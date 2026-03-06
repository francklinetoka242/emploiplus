import pool from '../config/db.js';

/**
 * AuditLog Model
 * Manages audit logs for admin actions (read-only)
 */

// Create audit log entry
export async function createAuditLog({
  adminId,
  adminName,
  action,
  module,
  details,
  ipAddress,
}) {
  try {
    const query = `
      INSERT INTO audit_logs 
      (admin_id, admin_name, action, module, details, ip_address, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      adminId,
      adminName,
      action,
      module,
      details,
      ipAddress,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
}

// Get audit logs with filters
export async function getAuditLogs(filters = {}, limit = 100, offset = 0) {
  try {
    const params = [];
    let whereClause = 'WHERE 1=1';

    // Filter by date range
    if (filters.startDate) {
      whereClause += ` AND DATE(timestamp) >= $${params.length + 1}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ` AND DATE(timestamp) <= $${params.length + 1}`;
      params.push(filters.endDate);
    }

    // Filter by admin
    if (filters.adminId) {
      whereClause += ` AND admin_id = $${params.length + 1}`;
      params.push(filters.adminId);
    }

    // Filter by module
    if (filters.module) {
      whereClause += ` AND module = $${params.length + 1}`;
      params.push(filters.module);
    }

    // Filter by action
    if (filters.action) {
      whereClause += ` AND action = $${params.length + 1}`;
      params.push(filters.action);
    }

    const query = `
      SELECT 
        id,
        admin_id,
        admin_name,
        action,
        module,
        details,
        timestamp,
        ip_address
      FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

// Get total count of audit logs (for pagination)
export async function getAuditLogsCount(filters = {}) {
  try {
    const params = [];
    let whereClause = 'WHERE 1=1';

    // Apply same filters as getAuditLogs
    if (filters.startDate) {
      whereClause += ` AND DATE(timestamp) >= $${params.length + 1}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ` AND DATE(timestamp) <= $${params.length + 1}`;
      params.push(filters.endDate);
    }

    if (filters.adminId) {
      whereClause += ` AND admin_id = $${params.length + 1}`;
      params.push(filters.adminId);
    }

    if (filters.module) {
      whereClause += ` AND module = $${params.length + 1}`;
      params.push(filters.module);
    }

    if (filters.action) {
      whereClause += ` AND action = $${params.length + 1}`;
      params.push(filters.action);
    }

    const query = `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`;
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error counting audit logs:', error);
    throw error;
  }
}

// Get distinct modules (for filter dropdown)
export async function getAuditModules() {
  try {
    const query = `
      SELECT DISTINCT module 
      FROM audit_logs 
      ORDER BY module ASC
    `;

    const result = await pool.query(query);
    return result.rows.map((row) => row.module);
  } catch (error) {
    console.error('Error fetching audit modules:', error);
    throw error;
  }
}

// Get audit logs for specific admin
export async function getAdminAuditLogs(adminId, limit = 50, offset = 0) {
  try {
    const query = `
      SELECT 
        id,
        admin_id,
        admin_name,
        action,
        module,
        details,
        timestamp,
        ip_address
      FROM audit_logs
      WHERE admin_id = $1
      ORDER BY timestamp DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [adminId, limit, offset]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching admin audit logs:', error);
    throw error;
  }
}

// Get audit statistics
export async function getAuditStatistics(filters = {}) {
  try {
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (filters.startDate) {
      whereClause += ` AND DATE(timestamp) >= $${params.length + 1}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ` AND DATE(timestamp) <= $${params.length + 1}`;
      params.push(filters.endDate);
    }

    const query = `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT admin_id) as total_admins,
        COUNT(DISTINCT module) as total_modules,
        COUNT(DISTINCT action) as total_actions
      FROM audit_logs
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    throw error;
  }
}

export default {
  createAuditLog,
  getAuditLogs,
  getAuditLogsCount,
  getAuditModules,
  getAdminAuditLogs,
  getAuditStatistics,
};
