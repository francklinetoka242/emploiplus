import pool from '../config/db.js';

// helper that builds where clauses based on optional filters
function buildFilterClause(filters, params, present = new Set()) {
  let where = [];
  if (filters.status && present.has('status')) {
    where.push(`status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.role && present.has('role_level')) {
    where.push(`role_level = $${params.length + 1}`);
    params.push(filters.role);
  }
  if (filters.search) {
    where.push(`(LOWER(first_name) LIKE $${params.length + 1} OR LOWER(last_name) LIKE $${params.length + 1} OR LOWER(email) LIKE $${params.length + 1})`);
    params.push(`%${filters.search.toLowerCase()}%`);
  }
  if (filters.admin_id) {
    where.push(`id = $${params.length + 1}`);
    params.push(filters.admin_id);
  }
  if (filters.admin_level) {
    where.push(`role_level = $${params.length + 1}`);
    params.push(filters.admin_level);
  }
  if (filters.date_from) {
    where.push(`created_at >= $${params.length + 1}`);
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    where.push(`created_at <= $${params.length + 1}`);
    params.push(filters.date_to);
  }
  return where.length ? 'WHERE ' + where.join(' AND ') : '';
}

// fetch list of admins with optional filters and pagination
async function getAllAdmins(filters = {}, limit = 20, offset = 0) {
  try {
    const params = [];
    // Use base fields that always exist
    const selectClause = 'id, first_name, last_name, email, role, status, created_at, permissions';

    const filterClause = buildFilterClause(filters, params, new Set(['status', 'role_level', 'search', 'admin_id', 'admin_level', 'date_from', 'date_to']));
    const query = `
      SELECT ${selectClause}
      FROM admins
      ${filterClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    
    // Normalize permissions: ensure they're always an array, never null/undefined
    return result.rows.map(admin => ({
      ...admin,
      permissions: admin.permissions && Array.isArray(admin.permissions) ? admin.permissions : [],
    }));
  } catch (err) {
    console.error('getAllAdmins query error:', err);
    throw err;
  }
}

// get single admin
async function getAdminById(adminId) {
  try {
    // Start with basic fields that always exist
    const baseFields = ['id', 'first_name', 'last_name', 'email', 'role', 'status', 'created_at', 'permissions'];
    
    // Optionally add fields if they exist
    const optionalFields = ['role_level', 'updated_at', 'token_expires_at', 'phone', 'country', 'profile_photo', 'account_type'];
    
    // Try to get all fields but fall back to base fields if error
    const query = `
      SELECT id, first_name, last_name, email, role, role_level, status, created_at, updated_at, token_expires_at, phone, country, profile_photo, account_type, permissions
      FROM admins
      WHERE id = $1
    `;
    
    try {
      const result = await pool.query(query, [adminId]);
      const admin = result.rows[0];
      if (!admin) return null;
      
      // Normalize permissions: ensure they're always an array, never null/undefined
      return {
        ...admin,
        permissions: admin.permissions && Array.isArray(admin.permissions) ? admin.permissions : [],
      };
    } catch (fieldError) {
      // If query fails, try with just base fields
      console.log('Retrying with base fields only');
      const fallbackQuery = `
        SELECT ${baseFields.join(', ')}
        FROM admins
        WHERE id = $1
      `;
      const fallbackResult = await pool.query(fallbackQuery, [adminId]);
      const admin = fallbackResult.rows[0];
      if (!admin) return null;
      
      // Normalize permissions: ensure they're always an array, never null/undefined
      return {
        ...admin,
        permissions: admin.permissions && Array.isArray(admin.permissions) ? admin.permissions : [],
      };
    }
  } catch (err) {
    console.error('getAdminById query error:', err);
    throw err;
  }
}

// update fields of an admin record
async function updateAdmin(adminId, updates) {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    if (fields.length === 0) return null;

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const query = `
      UPDATE admins SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} 
      RETURNING id, first_name, last_name, email, role, status, created_at, updated_at
    `;
    values.push(adminId);
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updateAdmin query error:', err);
    throw err;
  }
}

// delete admin
async function deleteAdmin(adminId) {
  try {
    const query = 'DELETE FROM admins WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [adminId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteAdmin query error:', err);
    throw err;
  }
}

// count statistics for export/stats page
async function getAdminCounts() {
  try {
    // detect columns by fetching zero rows from the table (safer across schemas)
    const sample = await pool.query('SELECT * FROM admins LIMIT 0');
    const present = new Set((sample.fields || []).map(f => f.name));
    const hasStatus = present.has('status');
    const hasRoleLevel = present.has('role_level');
    const hasRole = present.has('role');

    // build query dynamically depending on which columns exist
    let query = `SELECT COUNT(*) AS total_admins, `;

    if (hasStatus) {
      query += `COUNT(*) FILTER (WHERE status = 'active') AS active_admins, COUNT(*) FILTER (WHERE status <> 'active') AS inactive_admins, `;
    } else {
      query += `COUNT(*) AS active_admins, 0 AS inactive_admins, `;
    }

    if (hasRoleLevel) {
      query += `COUNT(*) FILTER (WHERE role_level = 1) AS super_admins, COUNT(*) FILTER (WHERE role_level = 2) AS content_admins, COUNT(*) FILTER (WHERE role_level = 3) AS user_admins, COUNT(*) FILTER (WHERE role_level = 4) AS analytics_admins, COUNT(*) FILTER (WHERE role_level = 5) AS billing_admins, `;
    } else if (hasRole) {
      query += `COUNT(*) FILTER (WHERE role = 'super_admin') AS super_admins, COUNT(*) FILTER (WHERE role = 'admin_offres' OR role = 'content_admin') AS content_admins, COUNT(*) FILTER (WHERE role = 'admin_users' OR role = 'user_admin') AS user_admins, 0 AS analytics_admins, 0 AS billing_admins, `;
    } else {
      query += `0 AS super_admins, 0 AS content_admins, 0 AS user_admins, 0 AS analytics_admins, 0 AS billing_admins, `;
    }

    query += `MAX(created_at) AS last_created FROM admins`;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error('getAdminCounts query error:', err);
    throw err;
  }
}

export default {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  getAdminCounts,
};
