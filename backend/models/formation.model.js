const pool = require('../config/db');

// retrieve all formations with pagination
async function getAllFormations(limit = 20, offset = 0) {
  try {
    const query = `
      SELECT id, title, description, duration, level, price, image_url, created_at, updated_at
      FROM formations
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
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

// create a new formation
async function createFormation(title, description, duration, level, price, imageUrl) {
  try {
    const query = `
      INSERT INTO formations (title, description, duration, level, price, image_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, title, description, duration, level, price, image_url, created_at, updated_at
    `;
    const result = await pool.query(query, [title, description, duration, level, price, imageUrl]);
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

module.exports = {
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
