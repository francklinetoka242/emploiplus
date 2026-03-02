import pool from '../config/db.js';

// helper that builds where clauses based on optional filters
function buildFilterClause(filters, params) {
  let where = [];
  if (filters.status) {
    where.push(`status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.role) {
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
    const filterClause = buildFilterClause(filters, params);
    const query = `
      SELECT id, first_name, last_name, email, role, role_level, status, created_at, updated_at, token_expires_at
      FROM admins
      ${filterClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('getAllAdmins query error:', err);
    throw err;
  }
}

// get single admin
async function getAdminById(adminId) {
  try {
    const query = `
      SELECT id, first_name, last_name, email, role, role_level, status, created_at, updated_at, token_expires_at
      FROM admins
      WHERE id = $1
    `;
    const result = await pool.query(query, [adminId]);
    return result.rows[0] || null;
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
      UPDATE admins SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *
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
    const query = `
      SELECT
        COUNT(*) AS total_admins,
        COUNT(*) FILTER (WHERE status = 'active') AS active_admins,
        COUNT(*) FILTER (WHERE status <> 'active') AS inactive_admins,
        COUNT(*) FILTER (WHERE role_level = 1) AS super_admins,
        COUNT(*) FILTER (WHERE role_level = 2) AS content_admins,
        COUNT(*) FILTER (WHERE role_level = 3) AS user_admins,
        COUNT(*) FILTER (WHERE role_level = 4) AS analytics_admins,
        COUNT(*) FILTER (WHERE role_level = 5) AS billing_admins,
        MAX(created_at) AS last_created
      FROM admins
    `;
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
