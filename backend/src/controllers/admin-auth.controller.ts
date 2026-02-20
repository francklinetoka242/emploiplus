/**
 * Admin Authentication Controller
 * Login and token management for admin users
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { checkLoginAttempts, recordLoginAttempt, resetLoginAttempts, getClientIP } from '../services/loginAttemptsService.js';
import { logAdminAction } from '../middleware/adminAuth.js';

const JWT_SECRET: string | undefined = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
const JWT_EXPIRY: string | number = process.env.JWT_ADMIN_EXPIRY || '24h';

if (!JWT_SECRET) {
  // Fail fast during startup/build so TypeScript/Runtime know secret is required
  console.error('JWT admin secret is not set. Set JWT_ADMIN_SECRET in environment.');
}

/**
 * Admin Login
 */
export async function loginAdmin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Get client IP and user agent
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';

    // Check login attempts (by email and IP)
    const attemptsCheck = await checkLoginAttempts(email, clientIP);
    if (!attemptsCheck.allowed) {
      return res.status(429).json({ 
        error: attemptsCheck.message,
        remainingMinutes: attemptsCheck.remainingMinutes,
        remainingSeconds: attemptsCheck.remainingSeconds
      });
    }

    // Find admin by email
    const result = await pool.query(
      `SELECT a.id, a.email, a.password_hash, a.first_name, a.last_name, a.is_active, a.role_id, r.name as role_name
       FROM admins a
       LEFT JOIN admin_roles r ON a.role_id = r.id
       WHERE a.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      await recordLoginAttempt(email, clientIP, userAgent, 'failed');
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const admin = result.rows[0];

    // Check if active
    if (!admin.is_active) {
      await recordLoginAttempt(email, clientIP, userAgent, 'failed');
      return res.status(401).json({ error: 'Compte désactivé' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      await recordLoginAttempt(email, clientIP, userAgent, 'failed');
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Success: reset login attempts
    await resetLoginAttempts(email, clientIP);

    // Get permissions
    const permResult = await pool.query(
      `SELECT DISTINCT p.id, p.slug, p.description
      FROM permissions p
      LEFT JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1`,
      [admin.role_id]
    );

    // Ensure secret exists at runtime
    if (!JWT_SECRET) {
      console.error('Missing JWT secret for admin token generation');
      return res.status(500).json({ error: 'Configuration JWT manquante' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET as string,
      { expiresIn: JWT_EXPIRY }
    );

    // Log login action
    await logAdminAction(admin.id, 'login');

    // Update last login
    await pool.query('UPDATE admins SET last_login = NOW() WHERE id = $1', [admin.id]);

    res.json({
      message: 'Connexion réussie',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: {
          id: admin.role_id,
          name: admin.role_name
        },
        permissions: permResult.rows
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
}

/**
 * Verify current admin token
 */
export async function verifyToken(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };

      // Fetch admin data
      const result = await pool.query(
        `SELECT a.id, a.email, a.first_name, a.last_name, a.is_active, a.role_id, r.name as role_name
         FROM admins a
         LEFT JOIN admin_roles r ON a.role_id = r.id
         WHERE a.id = $1 AND a.is_active = true`,
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Admin non trouvé' });
      }

      const admin = result.rows[0];

      // Get permissions
      const permResult = await pool.query(
        `SELECT DISTINCT p.id, p.slug, p.description
        FROM permissions p
        LEFT JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1`,
        [admin.role_id]
      );

      res.json({
        valid: true,
        admin: {
          id: admin.id,
          email: admin.email,
          first_name: admin.first_name,
          last_name: admin.last_name,
          role: {
            id: admin.role_id,
            name: admin.role_name
          },
          permissions: permResult.rows
        }
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expiré', valid: false });
      }
      return res.status(401).json({ error: 'Token invalide', valid: false });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Erreur de vérification' });
  }
}

/**
 * Logout admin
 */
export async function logoutAdmin(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      
      // Log logout action
      await logAdminAction(decoded.id, 'logout');
    }

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Error logging out admin:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const result = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    // Don't reveal if user exists
    if (result.rows.length === 0) {
      return res.json({ message: 'Un email a été envoyé si le compte existe' });
    }

    // TODO: Generate reset token and send email
    // This would involve:
    // 1. Generate a secure token
    // 2. Store it in database with expiry
    // 3. Send email with reset link

    res.json({ message: 'Un email a été envoyé si le compte existe' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ error: 'Erreur lors de la demande' });
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
    }

    // TODO: Validate token from database
    // For now, just reject
    return res.status(400).json({ error: 'Fonctionnalité non encore implémentée' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
  }
}

/**
 * Change password (for authenticated admin)
 */
export async function changePassword(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    // Get admin
    const result = await pool.query(
      'SELECT id, password_hash FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin non trouvé' });
    }

    const admin = result.rows[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, decoded.id]
    );

    // Log action
    await logAdminAction(decoded.id, 'update', 'admins', decoded.id);

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
}
