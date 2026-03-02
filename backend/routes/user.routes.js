import express from 'express';
const router = express.Router();
import { getUsers, getUserById } from '../controllers/user.controller.js';

// GET /api/users - retrieve all users
// no authentication required, public endpoint (for display purposes)
// query params: ?limit=20&offset=0
router.get('/', getUsers);

// GET /api/users/:id - retrieve a single user by ID
router.get('/:id', getUserById);

export default router;
