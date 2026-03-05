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
    
    // Admin ID filter
    if (filters.admin_id) {
      params.push(filters.admin_id);
      where.push(`alh.admin_id = $${params.length}`);
    }
    
    // Success status filter
    if (filters.success !== undefined) {
      params.push(filters.success === 'true' || filters.success === true);
      where.push(`alh.success = $${params.length}`);
    }
    
    // Role filter
    if (filters.role) {
      params.push(filters.role);
      where.push(`a.role = $${params.length}`);
    }
    
    // Date range filters
    if (filters.date_from) {
      params.push(filters.date_from);
      where.push(`alh.created_at >= $${params.length}`);
    }
    if (filters.date_to) {
      params.push(filters.date_to);
      where.push(`alh.created_at <= $${params.length}`);
    }
    
    // Email search filter
    if (filters.email) {
      params.push(`%${filters.email}%`);
      where.push(`alh.admin_email ILIKE $${params.length}`);
    }
    
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);
    
    const query = `
      SELECT 
        alh.id,
        alh.admin_id,
        alh.admin_email,
        alh.success,
        alh.ip_address,
        alh.user_agent,
        alh.details,
        alh.created_at,
        a.first_name,
        a.last_name,
        a.role,
        COALESCE(a.first_name || ' ' || a.last_name, alh.admin_email) as full_name
      FROM admin_login_history alh
      LEFT JOIN admins a ON alh.admin_id = a.id
      ${whereClause}
      ORDER BY alh.created_at DESC
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
