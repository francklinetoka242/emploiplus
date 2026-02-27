/**
 * Security Monitoring Routes
 * Admin endpoints for monitoring login attempts and account security
 */

import { Router } from 'express';
import { verifyAdminToken, requireSuperAdmin } from '../middleware/adminAuth.js';
import {
  getRecentLoginAttempts,
  getSecurityStats,
  unlockAdminAccount,
  getFailedAttemptsByIP,
  clearLoginHistory
} from '../controllers/security-monitoring.controller.js';

const router = Router();

// All routes require admin authentication
router.use(verifyAdminToken);

/**
 * GET /security/login-attempts
 * Retrieve recent login attempts (paginated)
 * Query: email?, limit?, offset?
 */
router.get('/login-attempts', getRecentLoginAttempts);

/**
 * GET /security/stats
 * Get security statistics for a specific admin account
 * Query: email (required)
 */
router.get('/stats', getSecurityStats);

/**
 * GET /security/attacks
 * Detect potential brute force attacks by IP
 * Query: hours?, minAttempts?
 */
router.get('/attacks', requireSuperAdmin, getFailedAttemptsByIP);

/**
 * POST /security/unlock
 * Unlock a blocked admin account
 * Body: { email }
 * Requires: super admin
 */
router.post('/unlock', requireSuperAdmin, unlockAdminAccount);

/**
 * POST /security/clear-history
 * Clear login history for an admin account
 * Body: { email }
 * Requires: super admin
 */
router.post('/clear-history', requireSuperAdmin, clearLoginHistory);

export default router;
