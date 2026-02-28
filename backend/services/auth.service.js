const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// ---------------------------------------------------------------------------
// Register a new superadmin user
// ---------------------------------------------------------------------------
// - email/password are required
// - rejects if a user with the same email already exists
// - stores hashed password and returns the created user record (sans password)
async function registerAdmin(email, password) {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // check whether an account with this email already exists
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (rows.length > 0) {
    throw new AppError('User already exists with this email', 409);
  }

  // hash the password before storing
  const hashed = await bcrypt.hash(password, 10);

  const insert = `
    INSERT INTO users (email, password, role, created_at, updated_at)
    VALUES ($1, $2, 'superadmin', NOW(), NOW())
    RETURNING id, email, role, created_at, updated_at
  `;

  const result = await pool.query(insert, [email, hashed]);
  return result.rows[0];
}

// ---------------------------------------------------------------------------
// Authenticate an admin and produce a JWT token
// ---------------------------------------------------------------------------
// - verifies email/password
// - returns { token, user }
async function loginAdmin(email, password) {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // fetch user record
  const { rows } = await pool.query(
    'SELECT id, email, password, role FROM users WHERE email = $1',
    [email]
  );
  const user = rows[0];
  if (!user) {
    throw new AppError('Incorrect email or password', 401);
  }

  // compare hashes
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError('Incorrect email or password', 401);
  }

  // generate token payload
  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  // don't return password hash
  delete user.password;

  return { token, user };
}

module.exports = {
  registerAdmin,
  loginAdmin,
};
