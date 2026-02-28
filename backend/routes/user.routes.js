const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/user.controller');

// GET /api/users - retrieve all users
// no authentication required, public endpoint (for display purposes)
// query params: ?limit=20&offset=0
router.get('/', getUsers);

// GET /api/users/:id - retrieve a single user by ID
router.get('/:id', getUserById);

module.exports = router;
