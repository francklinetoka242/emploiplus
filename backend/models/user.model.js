import pool from '../config/db.js';

// retrieve all users from the users table
async function getAllUsers(limit = 10, offset = 0) {
  try {
    // Return commonly used fields in the admin UI schema
    // Note: is_blocked column may not exist in all database schemas
    const query = 'SELECT id, full_name, email, user_type, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    console.log('[user.model] getAllUsers query:', query, [limit, offset]);
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (err) {
    console.error('getAllUsers query error:', err);
    throw err;
  }
}

// retrieve a single user by ID
async function getUserById(userId) {
  try {
    const query = 'SELECT id, full_name, email, user_type, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getUserById query error:', err);
    throw err;
  }
}

// retrieve user by email
async function getUserByEmail(email) {
  try {
    const query = 'SELECT id, full_name, email, user_type, password, created_at FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getUserByEmail query error:', err);
    throw err;
  }
}

// insert a new user into the users table
// Using password (not password_hash) as per schema, and user_type (not role)
async function createUser(email, firstname, lastname, passwordHash, user_type = 'candidate') {
  try {
    const fullName = `${firstname} ${lastname}`.trim();
    const query = `
      INSERT INTO users (email, full_name, password, user_type, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, email, full_name, user_type, created_at
    `;
    const result = await pool.query(query, [email, fullName, passwordHash, user_type]);
    return result.rows[0];
  } catch (err) {
    console.error('createUser query error:', err);
    throw err;
  }
}

// update user information by ID
async function updateUser(userId, updates) {
  try {
    // dynamically build SET clause from updates object
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(userId); // add userId as last parameter for WHERE clause

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // build SET part dynamically
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updateUser query error:', err);
    throw err;
  }
}

// delete a user by ID
async function deleteUser(userId) {
  try {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteUser query error:', err);
    throw err;
  }
}

export default {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};