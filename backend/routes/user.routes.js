import express from 'express';
const router = express.Router();
import { 
  getUsers, 
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// GET /api/users - retrieve all users
// public endpoint used for displaying lists
router.get('/', getUsers);

// GET /api/users/:id - retrieve a single user by ID
router.get('/:id', getUserById);

// administrative user management (super_admin)
router.post('/', requireAdmin, requireRoles('super_admin'), createUser);
router.put('/:id', requireAdmin, requireRoles('super_admin'), updateUser);
router.delete('/:id', requireAdmin, requireRoles('super_admin'), deleteUser);

export default router;
