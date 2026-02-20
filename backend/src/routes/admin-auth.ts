/**
 * Admin Authentication Routes
 * Login, logout, and token verification
 */

import { Router, Request, Response } from 'express';
import * as authController from '../controllers/admin-auth.controller.js';

const router = Router();

/**
 * Login endpoint
 * POST /admin-auth/login
 */
router.post('/login', authController.loginAdmin);

/**
 * Verify token endpoint
 * POST /admin-auth/verify
 */
router.post('/verify', authController.verifyToken);

/**
 * Logout endpoint
 * POST /admin-auth/logout
 */
router.post('/logout', authController.logoutAdmin);

/**
 * Request password reset
 * POST /admin-auth/forgot-password
 */
router.post('/forgot-password', authController.requestPasswordReset);

/**
 * Reset password with token
 * POST /admin-auth/reset-password
 */
router.post('/reset-password', authController.resetPassword);

/**
 * Change password (authenticated)
 * POST /admin-auth/change-password
 */
router.post('/change-password', authController.changePassword);

export default router;
