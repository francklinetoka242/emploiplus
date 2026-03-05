import pool from '../config/db.js';

// Simple audit service for logging admin actions
const auditService = {
  async log(auditData) {
    try {
      // Check if audit_logs table exists, if not, just skip
      // This allows the service to fail gracefully if table doesn't exist
      await pool.query(`
        INSERT INTO audit_logs (
          admin_id, admin_name, action, resource_type, resource_id,
          route, method, ip_address, user_agent, status_code, response_time_ms,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      `, [
        auditData.admin_id || null,
        auditData.admin_name || null,
        auditData.action || null,
        auditData.resource_type || null,
        auditData.resource_id || null,
        auditData.route || null,
        auditData.method || null,
        auditData.ip_address || null,
        auditData.user_agent || null,
        auditData.status_code || null,
        auditData.response_time_ms || 0
      ]);
    } catch (err) {
      // Silently fail - audit is not critical to application
      console.error('Audit log error (non-critical):', err.message);
    }
  },

  async getLogs(filters = {}) {
    try {
      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.admin_id) {
        query += ` AND admin_id = $${paramCount}`;
        values.push(filters.admin_id);
        paramCount++;
      }

      if (filters.action) {
        query += ` AND action = $${paramCount}`;
        values.push(filters.action);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC LIMIT 1000';

      const result = await pool.query(query, values);
      return result.rows;
    } catch (err) {
      console.error('Audit logs retrieval error:', err.message);
      return [];
    }
  }
};

export default auditService;
