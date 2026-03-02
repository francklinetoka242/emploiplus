import pool from '../config/db.js';

// create history entry
export async function recordLoginEvent(event) {
  /*
    event should contain:
      admin_id, admin_email, success (boolean), ip_address, user_agent, details
  */
  try {
    const query = `
      INSERT INTO admin_login_history
        (admin_id, admin_email, success, ip_address, user_agent, details, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW())
      RETURNING id
    `;
    const vals = [event.admin_id, event.admin_email, event.success, event.ip_address, event.user_agent, event.details || null];
    const result = await pool.query(query, vals);
    return result.rows[0];
  } catch (err) {
    console.error('recordLoginEvent query error:', err);
    throw err;
  }
}

// retrieve history list with optional filters
export async function getLoginHistory(filters = {}, limit = 50, offset = 0) {
  try {
    const params = [];
    let where = [];
    if (filters.admin_id) {
      params.push(filters.admin_id);
      where.push(`admin_id = $${params.length}`);
    }
    if (filters.success !== undefined) {
      params.push(filters.success);
      where.push(`success = $${params.length}`);
    }
    if (filters.date_from) {
      params.push(filters.date_from);
      where.push(`created_at >= $${params.length}`);
    }
    if (filters.date_to) {
      params.push(filters.date_to);
      where.push(`created_at <= $${params.length}`);
    }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);
    const query = `
      SELECT *
      FROM admin_login_history
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length-1} OFFSET $${params.length}
    `;
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('getLoginHistory query error:', err);
    throw err;
  }
}

export async function purgeOldHistory(days) {
  try {
    const query = `DELETE FROM admin_login_history WHERE created_at < NOW() - INTERVAL '$1 days'`;
    await pool.query(query, [days]);
  } catch (err) {
    console.error('purgeOldHistory query error:', err);
    throw err;
  }
}
