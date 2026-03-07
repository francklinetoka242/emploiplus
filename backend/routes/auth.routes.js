
import express from 'express';
const router = express.Router();
import { register, loginAdmin, loginUser, verifySession } from '../controllers/auth.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

// ---------------------------------------------------------------------------
// ADMIN AUTHENTICATION ROUTES
// ---------------------------------------------------------------------------

// POST /api/auth/register
// Create a new super admin (first-time setup)
// Public endpoint - used only for creating the initial admin
// Body: { email, password, first_name, last_name }
router.post('/register', register);
// Compatibility alias: some frontends still call /api/auth/admin/register
router.post('/admin/register', register);

// POST /api/auth/login
// Admin login endpoint
// Queries public.admins table only
// Body: { email, password }
// Returns: { token, user: { id, email, role, firstName, lastName }, userType: 'admin' }
router.post('/login', loginAdmin);

// GET /api/auth/verify
// Verify that an admin's session is still valid after a page refresh
// Requires admin authentication (Bearer token in Authorization header)
// Returns: { success: true, data: { admin } } with updated admin data from database
router.get('/verify', requireAdmin, verifySession);

// ---------------------------------------------------------------------------
// USER (CANDIDATE/COMPANY) AUTHENTICATION ROUTES
// ---------------------------------------------------------------------------

// POST /api/auth/user/login
// User (candidate or company) login endpoint
// Queries public.users table only (NOT public.admins)
// SECURITY: Uses user_type field instead of role field
// Body: { email, password }
// Returns: { token, user: { id, email, user_type, firstName, lastName }, userType: 'user' }
router.post('/user/login', loginUser);

export default router;