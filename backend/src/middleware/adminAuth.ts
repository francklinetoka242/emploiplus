/**
 * Admin Authentication & Authorization Middleware
 * Handles JWT verification and permission checks
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { AdminUser, Permission } from '../types/index.js';
import { checkLoginAttempts, recordLoginAttempt, resetLoginAttempts, getClientIP } from '../services/loginAttemptsService.js';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminUser;
      adminPermissions?: Permission[];
      adminToken?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'admin_secret_key';
const JWT_EXPIRY = process.env.JWT_ADMIN_EXPIRY || '24h';

/**
 * Verify Admin JWT Token
 */
export async function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.substring(7);
    req.adminToken = token;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
      
      // Fetch admin data from database
      const result = await pool.query(
        `SELECT 
          a.id, a.user_id, a.first_name, a.last_name, a.email, 
          a.role_id, a.is_active, a.last_login, a.login_attempts,
          r.name as role_name, r.description as role_description
        FROM admins a
        LEFT JOIN admin_roles r ON a.role_id = r.id
        WHERE a.id = $1 AND a.is_active = true`,
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Admin non trouvé ou inactif' });
      }

      const adminRow = result.rows[0];

      // Fetch permissions for this admin
      const permResult = await pool.query(
        `SELECT DISTINCT p.id, p.slug, p.description
        FROM permissions p
        LEFT JOIN role_permissions rp ON p.id = rp.permission_id
        LEFT JOIN admin_custom_permissions acp ON p.id = acp.permission_id
        WHERE (
          rp.role_id = $1
          OR (acp.admin_id = $2 AND acp.is_granted = true)
        )
        AND (acp.admin_id IS NULL OR acp.is_granted = true)`,
        [adminRow.role_id, decoded.id]
      );

      req.admin = {
        id: adminRow.id,
        user_id: adminRow.user_id,
        first_name: adminRow.first_name,
        last_name: adminRow.last_name,
        email: adminRow.email,
        is_active: adminRow.is_active,
        created_at: adminRow.created_at,
        updated_at: adminRow.updated_at,
        role_id: adminRow.role_id,
        role: {
          id: adminRow.role_id,
          name: adminRow.role_name,
          description: adminRow.role_description
        }
      } as AdminUser;

      req.adminPermissions = permResult.rows;

      // Update last login
      await pool.query(
        'UPDATE admins SET last_login = NOW(), login_attempts = 0 WHERE id = $1',
        [decoded.id]
      );

      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expiré' });
      }
      return res.status(401).json({ error: 'Token invalide' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erreur de vérification du token' });
  }
}

/**
 * Check if admin has specific permission
 */
export function checkPermission(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!req.adminPermissions) {
      return res.status(403).json({ error: 'Pas de permissions' });
    }

    // Super admin has all permissions
    if (req.admin.role?.name === 'super_admin') {
      return next();
    }

    const hasPermission = req.adminPermissions.some(
      p => p.slug === requiredPermission
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Permission manquante',
        requiredPermission 
      });
    }

    next();
  };
}

/**
 * Check multiple permissions (OR logic)
 */
export function checkAnyPermission(requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (req.admin.role?.name === 'super_admin') {
      return next();
    }

    const hasAnyPermission = requiredPermissions.some(perm =>
      req.adminPermissions?.some(p => p.slug === perm)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({ 
        error: 'Aucune permission suffisante',
        requiredPermissions 
      });
    }

    next();
  };
}

/**
 * Require Super Admin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.admin.role?.name !== 'super_admin') {
    return res.status(403).json({ error: 'Accès réservé au Super Admin' });
  }

  next();
}

/**
 * Log admin action
 */
export async function logAdminAction(
  adminId: number,
  action: 'create' | 'update' | 'delete' | 'login' | 'logout',
  tableName?: string,
  recordId?: number,
  changes?: Record<string, { old: string; new: string }>
) {
  try {
    await pool.query(
      `INSERT INTO audit_logs 
       (admin_id, action, table_name, record_id, changes, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        adminId,
        action,
        tableName,
        recordId,
        changes ? JSON.stringify(changes) : null,
        null, // IP will be added by middleware
        null  // User-Agent will be added by middleware
      ]
    );
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

// Removed duplicate `logAdminAction` and deprecated local login-attempt helpers.
// Use `loginAttemptsService` exports (checkLoginAttempts, recordLoginAttempt, resetLoginAttempts)
// which are imported at the top of this file. Keeping this file focused on middleware helpers only.
