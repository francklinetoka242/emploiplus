import userService from '../services/user.service.js';

async function getUsers(req, res) {
  console.log('[user.controller] getUsers called with query', req.query);
  try {
    const users = await userService.getUsers(req.query);
    res.json({ data: users });
  } catch (err) {
    console.error('getUsers error', err.stack || err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ data: user });
  } catch (err) {
    console.error('getUserById error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// admin-only handlers
async function createUser(req, res) {
  try {
    const { email, first_name, last_name, full_name, password, user_type } = req.body;
    const nameProvided = full_name || (first_name && last_name);
    if (!email || !nameProvided || !password) {
      return res.status(400).json({ message: 'Email, name, and password are required' });
    }
    // determine parts for service
    const fn = full_name || first_name;
    const ln = last_name || '';
    // password should arrive hashed by auth controller or hashed here
    const newUser = await userService.createUser(email, fn, ln, password, user_type);
    res.status(201).json({ data: newUser });
  } catch (err) {
    console.error('createUser error', err);
    const status = /required|already in use|Invalid/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function updateUser(req, res) {
  try {
    const updated = await userService.updateUserProfile(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    console.error('updateUser error', err);
    const status = /required|not found|No valid/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function deleteUser(req, res) {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error', err);
    let status = 500;
    if (/not found/i.test(err.message)) status = 404;
    else if (/dependent|referenc|foreign|constraint/i.test(err.message)) status = 409;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
