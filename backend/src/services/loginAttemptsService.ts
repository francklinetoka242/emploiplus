/**
 * Login Attempts Security Service
 * Manages brute force protection with rate limiting by email and IP
 */

import { pool } from '../config/database.js';

// Configuration
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 15;
const ATTEMPT_WINDOW_MINUTES = 15; // Reset attempts after this period

interface LoginAttemptResult {
  allowed: boolean;
  message?: string;
  remainingMinutes?: number;
  remainingSeconds?: number;
}

/**
 * Get client IP address from request
 */
export function getClientIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (forwarded as string).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

/**
 * Record a login attempt (successful or failed)
 */
export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  userAgent: string,
  attemptType: 'failed' | 'success'
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO login_attempts (email, ip_address, user_agent, attempt_type, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [email, ipAddress, userAgent, attemptType]
    );
  } catch (error) {
    console.error(`[LoginAttempts] Error recording ${attemptType} attempt for ${email}:`, error);
  }
}

/**
 * Check if a login is blocked (by email and/or IP)
 * Returns whether the login is allowed and remaining wait time if blocked
 */
export async function checkLoginAttempts(
  email: string,
  ipAddress: string
): Promise<LoginAttemptResult> {
  try {
    // 1. Check if admin account is directly locked
    const adminResult = await pool.query(
      `SELECT locked_until FROM admins WHERE email = $1`,
      [email]
    );

    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
        const remainingMs = new Date(admin.locked_until).getTime() - new Date().getTime();
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        const remainingSeconds = Math.ceil((remainingMs % 60000) / 1000);

        return {
          allowed: false,
          message: `Compte bloqué. Réessayez dans ${remainingMinutes} min ${remainingSeconds}s`,
          remainingMinutes,
          remainingSeconds
        };
      }
    }

    // 2. Check failed attempts for this email in the last 15 minutes
    const emailAttemptsResult = await pool.query(
      `SELECT COUNT(*) as failed_count, MAX(created_at) as last_attempt
       FROM login_attempts
       WHERE email = $1 
       AND attempt_type = 'failed'
       AND created_at > NOW() - INTERVAL '${ATTEMPT_WINDOW_MINUTES} minutes'`,
      [email]
    );

    const emailFailedCount = parseInt(emailAttemptsResult.rows[0].failed_count, 10);
    const emailLastAttempt = emailAttemptsResult.rows[0].last_attempt;

    // 3. Check failed attempts for this IP in the last 15 minutes
    const ipAttemptsResult = await pool.query(
      `SELECT COUNT(*) as failed_count, MAX(created_at) as last_attempt
       FROM login_attempts
       WHERE ip_address = $1 
       AND attempt_type = 'failed'
       AND created_at > NOW() - INTERVAL '${ATTEMPT_WINDOW_MINUTES} minutes'`,
      [ipAddress]
    );

    const ipFailedCount = parseInt(ipAttemptsResult.rows[0].failed_count, 10);
    const ipLastAttempt = ipAttemptsResult.rows[0].last_attempt;

    // 4. Check both: email OR IP has too many attempts
    if (emailFailedCount >= MAX_ATTEMPTS) {
      // Block this account
      const lockedUntil = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60000);
      await pool.query(
        `UPDATE admins SET locked_until = $1 WHERE email = $2`,
        [lockedUntil, email]
      );

      const remainingMs = lockedUntil.getTime() - new Date().getTime();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      const remainingSeconds = Math.ceil((remainingMs % 60000) / 1000);

      return {
        allowed: false,
        message: `Trop de tentatives de connexion. Compte bloqué ${BLOCK_DURATION_MINUTES} minutes. Réessayez dans ${remainingMinutes}m ${remainingSeconds}s`,
        remainingMinutes,
        remainingSeconds
      };
    }

    if (ipFailedCount >= MAX_ATTEMPTS) {
      // Determine how long to block based on when the block started
      const blockStartTime = new Date(ipLastAttempt).getTime() - (MAX_ATTEMPTS - 1) * (emailLastAttempt ? 1000 : 0);
      const blockedUntilTime = blockStartTime + BLOCK_DURATION_MINUTES * 60000;
      const remainingMs = blockedUntilTime - new Date().getTime();

      if (remainingMs > 0) {
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        const remainingSeconds = Math.ceil((remainingMs % 60000) / 1000);

        return {
          allowed: false,
          message: `Trop de tentatives depuis cette adresse IP. Bloqué ${BLOCK_DURATION_MINUTES} minutes. Réessayez dans ${remainingMinutes}m ${remainingSeconds}s`,
          remainingMinutes,
          remainingSeconds
        };
      }
    }

    // 5. Login is allowed
    return { allowed: true };
  } catch (error) {
    console.error('[LoginAttempts] Error checking login attempts:', error);
    // On database error, allow login to continue (fail open, not fail closed)
    return { allowed: true };
  }
}

/**
 * Reset login attempts after successful login
 */
export async function resetLoginAttempts(email: string, ipAddress: string): Promise<void> {
  try {
    // Clear account lock
    await pool.query(
      `UPDATE admins SET locked_until = NULL, last_failed_at = NULL WHERE email = $1`,
      [email]
    );

    // Log success
    await recordLoginAttempt(email, ipAddress, '', 'success');
  } catch (error) {
    console.error('[LoginAttempts] Error resetting login attempts:', error);
  }
}

/**
 * Clean up old login attempts (keep only 30 days)
 */
export async function cleanupOldAttempts(): Promise<void> {
  try {
    const result = await pool.query(
      `DELETE FROM login_attempts 
       WHERE created_at < NOW() - INTERVAL '30 days'`
    );
    console.log(`[LoginAttempts] Cleaned up ${result.rowCount} old attempt records`);
  } catch (error) {
    console.error('[LoginAttempts] Error cleaning up old attempts:', error);
  }
}

/**
 * Get statistics for a given email (for admin panels)
 */
export async function getAttemptStats(email: string) {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN attempt_type = 'failed' THEN 1 END) as failed_attempts,
        COUNT(CASE WHEN attempt_type = 'success' THEN 1 END) as successful_attempts,
        MAX(created_at) as last_attempt,
        COUNT(DISTINCT ip_address) as unique_ips
       FROM login_attempts
       WHERE email = $1
       AND created_at > NOW() - INTERVAL '24 hours'`,
      [email]
    );

    return result.rows[0];
  } catch (error) {
    console.error('[LoginAttempts] Error getting attempt stats:', error);
    return null;
  }
}
