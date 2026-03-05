import UserModel from '../models/user.model.js';

// retrieve all users with pagination
async function getUsers(query = {}) {
  try {
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    // fetch users from database
    const sql = 'SELECT id, full_name, email, user_type, is_blocked, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    console.log('[userService] executing getAllUsers:', sql, [limit, offset]);
    const users = await UserModel.getAllUsers(limit, offset);
    console.log('[userService] got', users.length, 'users');
    return users;
  } catch (err) {
    console.error('getUsers service error:', err);
    throw err;
  }
}

// retrieve a single user by ID
async function getUserById(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // fetch user from database
    const user = await UserModel.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (err) {
    console.error('getUserById service error:', err);
    throw err;
  }
}

// retrieve user by email
async function getUserByEmail(email) {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const user = await UserModel.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (err) {
    console.error('getUserByEmail service error:', err);
    throw err;
  }
}

// create a new user
async function createUser(email, firstname, lastname, passwordHash, user_type = 'candidate') {
  try {
    if (!email || (!firstname && !lastname) || !passwordHash) {
      throw new Error('Email, first name/last name, and password hash are required');
    }

    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // check if email already exists
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // combine name pieces into full_name for storage
    const fullName = [firstname, lastname].filter(Boolean).join(' ').trim();

    // create new user in database
    const newUser = await UserModel.createUser(email, fullName, passwordHash, user_type);
    return newUser;
  } catch (err) {
    console.error('createUser service error:', err);
    throw err;
  }
}

// update user profile information
async function updateUserProfile(userId, profileData) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // verify user exists
    const user = await UserModel.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // filter allowed fields for profile update
    const allowedFields = ['email', 'full_name', 'user_type', 'phone', 'job_title', 'profession', 'experience_years'];
    const updates = {};
    // support legacy first_name/last_name in incoming data
    let fn = profileData.first_name;
    let ln = profileData.last_name;
    if (fn || ln) {
      updates.full_name = [fn, ln].filter(Boolean).join(' ').trim();
    }

    for (const [key, value] of Object.entries(profileData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    // if changing email, check if new email is already taken
    if (updates.email && updates.email !== user.email) {
      const existing = await UserModel.getUserByEmail(updates.email);
      if (existing) {
        throw new Error('Email already in use');
      }
    }

    // update user in database
    const updated = await UserModel.updateUser(userId, updates);
    return updated;
  } catch (err) {
    console.error('updateUserProfile service error:', err);
    throw err;
  }
}

// delete a user account
async function deleteUser(userId) {
  // This implementation performs a transactional cleanup of common dependent rows
  // to avoid foreign key constraint errors when removing a user.

  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // verify user exists before deletion
    const user = await UserModel.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Start a transaction and remove dependent rows that reference users.id
    const client = await (await import('../config/db.js')).default.connect();
    try {
      await client.query('BEGIN');

      // Order matters: child tables first
      await client.query('DELETE FROM user_skills WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM user_documents WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM testimonials WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM verification_requests WHERE user_id = $1', [userId]);

      // job_applications can reference users as applicant or company
      await client.query('DELETE FROM job_applications WHERE applicant_id = $1 OR company_id = $1', [userId]);

      // jobs and business_cards reference companies
      await client.query('DELETE FROM jobs WHERE company_id = $1', [userId]);
      await client.query('DELETE FROM business_cards WHERE company_id = $1', [userId]);

      // Finally delete the user
      const delRes = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

      await client.query('COMMIT');
      return delRes.rowCount > 0;
    } catch (txErr) {
      await client.query('ROLLBACK');
      console.error('deleteUser transaction error:', txErr);
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('deleteUser service error:', err);
    // Handle common Postgres foreign-key/constraint errors when user is referenced elsewhere
    // Postgres FK violation code is '23503'
    if (err && (err.code === '23503' || /foreign key|constraint|referenc/i.test(err.message || ''))) {
      throw new Error('User has dependent records and cannot be deleted');
    }
    throw err;
  }
}

export default {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUserProfile,
  deleteUser,
};
