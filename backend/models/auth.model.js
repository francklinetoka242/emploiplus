import pool from '../config/db.js';

// verify user credentials by email and password hash
// returns user object if credentials are valid, null otherwise
async function verifyCredentials(email, passwordHash) {
  try {
    const query = `
      SELECT id, email, username, role, password_hash, created_at
      FROM users
      WHERE email = $1 AND password_hash = $2
    `;
    const result = await pool.query(query, [email, passwordHash]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('verifyCredentials query error:', err);
    throw err;
  }
}

// retrieve user by email for password comparison
// password hash comparison should be done by service layer using bcrypt
async function getUserForAuth(email) {
  try {
    const query = `
      SELECT id, email, username, role, password_hash, created_at
      FROM users
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getUserForAuth query error:', err);
    throw err;
  }
}

// update password hash for a user
async function updatePasswordHash(userId, newPasswordHash) {
  try {
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      RETURNING id, email, username, role
    `;
    const result = await pool.query(query, [newPasswordHash, userId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updatePasswordHash query error:', err);
    throw err;
  }
}

export default {
  verifyCredentials,
  getUserForAuth,
  updatePasswordHash,
};
