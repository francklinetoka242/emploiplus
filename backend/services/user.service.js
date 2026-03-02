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
    const users = await UserModel.getAllUsers(limit, offset);
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
    if (!email || !firstname || !lastname || !passwordHash) {
      throw new Error('Email, first name, last name, and password hash are required');
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

    // create new user in database
    const newUser = await UserModel.createUser(email, firstname, lastname, passwordHash, user_type);
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
    const allowedFields = ['email', 'first_name', 'last_name', 'user_type', 'phone', 'job_title', 'profession', 'experience_years'];
    const updates = {};
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
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // verify user exists before deletion
    const user = await UserModel.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // delete user from database
    const deleted = await UserModel.deleteUser(userId);
    return deleted;
  } catch (err) {
    console.error('deleteUser service error:', err);
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
