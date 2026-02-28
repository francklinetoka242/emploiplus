const pool = require('../config/db');

// retrieve all users from the users table
async function getAllUsers(limit = 10, offset = 0) {
  try {
    const query = 'SELECT id, email, username, role, created_at FROM users LIMIT $1 OFFSET $2';
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
    const query = 'SELECT id, email, username, role, created_at FROM users WHERE id = $1';
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
    const query = 'SELECT id, email, username, role, password_hash, created_at FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getUserByEmail query error:', err);
    throw err;
  }
}

// insert a new user into the users table
async function createUser(email, username, passwordHash, role = 'user') {
  try {
    const query = `
      INSERT INTO users (email, username, password_hash, role, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, email, username, role, created_at
    `;
    const result = await pool.query(query, [email, username, passwordHash, role]);
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

    // build SET part: email = $1, username = $2, ...
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING id, email, username, role, created_at`;
    
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

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};
