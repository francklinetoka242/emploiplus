import pool from '../config/db.js';

// retrieve all formations with pagination and optional publication filter
// `published` may be true/false or undefined (no filter).
async function getAllFormations(limit = 20, offset = 0, published, filters = {}) {
  try {
    // build dynamic WHERE clause
    const conditions = [];
    const params = [];

    if (published !== undefined) {
      conditions.push(`published = $${params.length + 1}`);
      params.push(published);
    }

    // Search by title or description
    if (filters.search) {
      conditions.push(`(title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${filters.search}%`);
    }

    // Filter by category
    if (filters.category) {
      conditions.push(`category ILIKE $${params.length + 1}`);
      params.push(`%${filters.category}%`);
    }

    // Filter by level
    if (filters.level) {
      conditions.push(`level ILIKE $${params.length + 1}`);
      params.push(`%${filters.level}%`);
    }

    let query = `
      SELECT id, title, description, category, level, duration, price, image_url, published, created_at, updated_at
      FROM formations
    `;

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Handle sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = (filters.sortOrder || 'DESC').toUpperCase();
    if (!['ASC', 'DESC'].includes(sortOrder)) {
      throw new Error('Invalid sort order');
    }
    if (!['created_at', 'title', 'price'].includes(sortBy)) {
      throw new Error('Invalid sort field');
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('getAllFormations query error:', err);
    throw err;
  }
}

// retrieve a single formation by ID
async function getFormationById(formationId) {
  try {
    const query = `
      SELECT id, title, description, duration, level, price, image_url, created_at, updated_at
      FROM formations
      WHERE id = $1
    `;
    const result = await pool.query(query, [formationId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getFormationById query error:', err);
    throw err;
  }
}

// create a new formation using a flexible payload object (only provided fields will be inserted)
async function createFormation(data) {
  try {
    // build dynamic column list and parameter placeholders
    const columns = [];
    const placeholders = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      columns.push(key);
      placeholders.push(`$${idx}`);
      values.push(value);
      idx += 1;
    }

    // always set timestamps if not provided
    if (!columns.includes('created_at')) {
      columns.push('created_at');
      placeholders.push('NOW()');
    }
    if (!columns.includes('updated_at')) {
      columns.push('updated_at');
      placeholders.push('NOW()');
    }

    const query = `
      INSERT INTO formations (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error('createFormation query error:', err);
    throw err;
  }
}

// update a formation by ID
async function updateFormation(formationId, updates) {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(formationId);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at');
    values.splice(values.length - 1, 0, new Date());

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE formations
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING id, title, description, duration, level, price, image_url, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updateFormation query error:', err);
    throw err;
  }
}

// delete a formation by ID
async function deleteFormation(formationId) {
  try {
    const query = 'DELETE FROM formations WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [formationId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteFormation query error:', err);
    throw err;
  }
}

// enroll a user in a formation (create record in enrollment table)
async function enrollUserInFormation(userId, formationId) {
  try {
    const query = `
      INSERT INTO formation_enrollments (user_id, formation_id, enrolled_at)
      VALUES ($1, $2, NOW())
      RETURNING id, user_id, formation_id, enrolled_at
    `;
    const result = await pool.query(query, [userId, formationId]);
    return result.rows[0];
  } catch (err) {
    console.error('enrollUserInFormation query error:', err);
    throw err;
  }
}

// check if user is already enrolled in a formation
async function isUserEnrolled(userId, formationId) {
  try {
    const query = `
      SELECT id FROM formation_enrollments
      WHERE user_id = $1 AND formation_id = $2
    `;
    const result = await pool.query(query, [userId, formationId]);
    return result.rows.length > 0;
  } catch (err) {
    console.error('isUserEnrolled query error:', err);
    throw err;
  }
}

// retrieve all formations a user is enrolled in
async function getUserFormations(userId, limit = 20, offset = 0) {
  try {
    const query = `
      SELECT f.id, f.title, f.description, f.duration, f.level, f.price, f.image_url, fe.enrolled_at
      FROM formations f
      INNER JOIN formation_enrollments fe ON f.id = fe.formation_id
      WHERE fe.user_id = $1
      ORDER BY fe.enrolled_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  } catch (err) {
    console.error('getUserFormations query error:', err);
    throw err;
  }
}

// remove user enrollment from a formation
async function removeUserFromFormation(userId, formationId) {
  try {
    const query = `
      DELETE FROM formation_enrollments
      WHERE user_id = $1 AND formation_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [userId, formationId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('removeUserFromFormation query error:', err);
    throw err;
  }
}

export default {
  getAllFormations,
  getFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
  enrollUserInFormation,
  isUserEnrolled,
  getUserFormations,
  removeUserFromFormation,
};
