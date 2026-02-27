/**
 * Security Monitoring Controller
 * Admin endpoints for monitoring login attempts and account security
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { getAttemptStats } from '../services/loginAttemptsService.js';

/**
 * Get recent login attempts (admin view)
 */
export async function getRecentLoginAttempts(req: Request, res: Response) {
  try {
    const { email, limit = '100', offset = '0' } = req.query;
    const pageLimit = Math.min(parseInt(limit as string), 500);
    const pageOffset = parseInt(offset as string);

    let query = `
      SELECT 
        id,
        email,
        ip_address,
        attempt_type,
        user_agent,
        created_at
      FROM login_attempts
    `;
    const params: any[] = [];

    if (email) {
      query += ` WHERE email = $${params.length + 1}`;
      params.push(email);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageLimit, pageOffset);

    const result = await pool.query(query, params);

    res.json({
      attempts: result.rows,
      total: result.rowCount,
      limit: pageLimit,
      offset: pageOffset
    });
  } catch (error) {
    console.error('[SecurityMonitoring] Error fetching login attempts:', error);
    res.status(500).json({ error: 'Error fetching attempt history' });
  }
}

/**
 * Get admin account security stats
 */
export async function getSecurityStats(req: Request, res: Response) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const stats = await getAttemptStats(email as string);

    if (!stats) {
      return res.status(404).json({ error: 'No stats available' });
    }

    // Get current lock status
    const adminResult = await pool.query(
      `SELECT locked_until FROM admins WHERE email = $1`,
      [email]
    );

    const isLocked = adminResult.rows.length > 0 && 
                    adminResult.rows[0].locked_until && 
                    new Date(adminResult.rows[0].locked_until) > new Date();

    res.json({
      email,
      ...stats,
      isCurrentlyLocked: isLocked,
      lockedUntil: adminResult.rows[0]?.locked_until || null
    });
  } catch (error) {
    console.error('[SecurityMonitoring] Error fetching security stats:', error);
    res.status(500).json({ error: 'Error fetching security stats' });
  }
}

/**
 * Unlock a blocked admin account (super admin only)
 */
export async function unlockAdminAccount(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Only super admin can unlock
    if (req.admin?.role?.name !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admin can unlock accounts' });
    }

    const result = await pool.query(
      `UPDATE admins SET locked_until = NULL WHERE email = $1 RETURNING email`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ 
      message: 'Account unlocked successfully',
      email: result.rows[0].email 
    });
  } catch (error) {
    console.error('[SecurityMonitoring] Error unlocking account:', error);
    res.status(500).json({ error: 'Error unlocking account' });
  }
}

/**
 * Get failed attempts by IP (to detect attacks)
 */
export async function getFailedAttemptsByIP(req: Request, res: Response) {
  try {
    const { hours = '24', minAttempts = '5' } = req.query;

    const query = `
      SELECT 
        ip_address,
        COUNT(*) as attempt_count,
        COUNT(DISTINCT email) as unique_accounts,
        MAX(created_at) as latest_attempt,
        ARRAY_AGG(DISTINCT email) as targeted_emails
      FROM login_attempts
      WHERE attempt_type = 'failed'
      AND created_at > NOW() - INTERVAL '${hours} hours'
      GROUP BY ip_address
      HAVING COUNT(*) >= $1
      ORDER BY attempt_count DESC
    `;

    const result = await pool.query(query, [parseInt(minAttempts as string)]);

    res.json({
      potentialAttacks: result.rows,
      period: `${hours} hours`,
      threshold: `${minAttempts} attempts`
    });
  } catch (error) {
    console.error('[SecurityMonitoring] Error fetching IP stats:', error);
    res.status(500).json({ error: 'Error fetching IP statistics' });
  }
}

/**
 * Clear login attempts for a specific email (super admin only)
 */
export async function clearLoginHistory(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    if (req.admin?.role?.name !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admin can clear login history' });
    }

    await pool.query(
      `DELETE FROM login_attempts WHERE email = $1`,
      [email]
    );

    res.json({ message: 'Login history cleared' });
  } catch (error) {
    console.error('[SecurityMonitoring] Error clearing login history:', error);
    res.status(500).json({ error: 'Error clearing login history' });
  }
}
