import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';

// ---------------------------------------------------------------------------
// ADMIN REGISTRATION
// ---------------------------------------------------------------------------
// Register a new super admin (used during initial setup)
// - Inserts into public.admins table only
// - Validates email/password requirements
// - Hashes password before storing
// - Returns created admin record (without password)
async function registerAdmin(email, password, firstName = 'Admin', lastName = 'User') {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  try {
    // Check if admin already exists in admins table
    const { rows: existingAdmins } = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );
    
    if (existingAdmins.length > 0) {
      throw new AppError('An admin with this email already exists', 409);
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into admins table ONLY with superadmin role
    const insert = `
      INSERT INTO admins (email, password, role, first_name, last_name, is_verified, is_active, created_at, updated_at)
      VALUES ($1, $2, 'super_admin', $3, $4, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, role, first_name, last_name
    `;

    const result = await pool.query(insert, [email, hashedPassword, firstName, lastName]);
    return result.rows[0];
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Error registering admin: ' + error.message, 500);
  }
}

// ---------------------------------------------------------------------------
// ADMIN LOGIN
// ---------------------------------------------------------------------------
// Authenticate an admin and produce a JWT token
// - Queries ONLY public.admins table (CRITICAL for security)
// - Verifies email and password
// - Requires is_active = true
// - Returns { token, user } with admin role information
async function loginAdmin(email, password) {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  try {
    // Fetch admin record from admins table ONLY
    // SECURITY: Do NOT query users table here
    const { rows: adminRows } = await pool.query(
      `SELECT id, email, password, role, first_name, last_name, is_active 
       FROM admins 
       WHERE email = $1`,
      [email]
    );

    const admin = adminRows[0];
    if (!admin) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Check if admin account is active
    if (!admin.is_active) {
      throw new AppError('Admin account is inactive', 403);
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Generate JWT token with admin-specific claims
    const payload = { 
      id: admin.id, 
      email: admin.email, 
      role: admin.role,
      type: 'admin'  // Mark as admin token
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return token and admin data (without password)
    return {
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        firstName: admin.first_name,
        lastName: admin.last_name
      }
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Error logging in: ' + error.message, 500);
  }
}

// ---------------------------------------------------------------------------
// USER (CANDIDATE/COMPANY) LOGIN
// ---------------------------------------------------------------------------
// Authenticate a user (candidate or company) and produce a JWT token
// - Queries ONLY public.users table (CRITICAL for security)
// - Verifies email and password
// - Uses user_type field (NOT role, which doesn't exist in users table)
// - Requires is_verified = true for full access
// - Returns { token, user } with user_type information
async function loginUser(email, password) {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  try {
    // Fetch user record from users table ONLY
    // SECURITY: Do NOT query admins table here
    // Note: users table uses 'user_type' column, NOT 'role'
    const { rows: userRows } = await pool.query(
      `SELECT id, email, password, user_type, first_name, last_name, is_verified, is_blocked 
       FROM users 
       WHERE email = $1`,
      [email]
    );

    const user = userRows[0];
    if (!user) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Check if user account is blocked
    if (user.is_blocked) {
      throw new AppError('User account is blocked', 403);
    }

    // Compare passwords
    if (!user.password) {
      throw new AppError('User has not set a password', 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Generate JWT token with user-specific claims
    const payload = { 
      id: user.id, 
      email: user.email, 
      user_type: user.user_type,
      type: 'user'  // Mark as user token
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return token and user data (without password)
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name,
        is_verified: user.is_verified
      }
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Error logging in: ' + error.message, 500);
  }
}

export default {
  registerAdmin,
  loginAdmin,    // Admin login: /api/auth/login
  loginUser,     // User login: /api/auth/user/login
};
