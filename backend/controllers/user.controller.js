import userService from '../services/user.service.js';

async function getUsers(req, res) {
  try {
    const users = await userService.getUsers(req.query);
    res.json({ data: users });
  } catch (err) {
    console.error('getUsers error', err);
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

export {
  getUsers,
  getUserById,
};
