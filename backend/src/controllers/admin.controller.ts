/**
 * Admin Management Controller
 * CRUD operations for admin users and permissions
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { AdminUser, Permission } from '../types/index.js';
import { logAdminAction } from '../middleware/adminAuth.js';

/**
 * List all admins
 */
export async function listAdmins(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT 
        a.id, a.first_name, a.last_name, a.email, a.role_id,
        r.name as role_name, a.is_active, a.last_login, a.created_at
      FROM admins a
      LEFT JOIN admin_roles r ON a.role_id = r.id
      ORDER BY a.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error listing admins:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des administrateurs' });
  }
}

/**
 * Get single admin with permissions
 */
export async function getAdmin(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const adminResult = await pool.query(
      `SELECT 
        a.id, a.user_id, a.first_name, a.last_name, a.email, a.role_id,
        r.name as role_name, r.description as role_description,
        a.is_active, a.last_login, a.login_attempts, a.created_at, a.updated_at
      FROM admins a
      LEFT JOIN admin_roles r ON a.role_id = r.id
      WHERE a.id = $1`,
      [id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({ error: 'Admin non trouvé' });
    }

    const admin = adminResult.rows[0];

    // Get role permissions
    const permResult = await pool.query(
      `SELECT p.id, p.slug, p.description FROM permissions p
       LEFT JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [admin.role_id]
    );

    // Get custom permissions
    const customPermResult = await pool.query(
      `SELECT acp.id, acp.permission_id, acp.is_granted, p.slug, p.description
       FROM admin_custom_permissions acp
       JOIN permissions p ON acp.permission_id = p.id
       WHERE acp.admin_id = $1`,
      [id]
    );

    res.json({
      ...admin,
      rolePermissions: permResult.rows,
      customPermissions: customPermResult.rows
    });
  } catch (error) {
    console.error('Error getting admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'administrateur' });
  }
}

/**
 * Create admin
 */
export async function createAdmin(req: Request, res: Response) {
  try {
    const { first_name, last_name, email, password, role_id } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password || !role_id) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Check if email already exists
    const existingResult = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const result = await pool.query(
      `INSERT INTO admins (first_name, last_name, email, password_hash, role_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, first_name, last_name, email, role_id, is_active, created_at`,
      [first_name, last_name, email, hashedPassword, role_id]
    );

    const newAdmin = result.rows[0];

    // Log action
    if (req.admin) {
      await logAdminAction(req.admin.id, 'create', 'admins', newAdmin.id);
    }

    res.status(201).json({
      message: 'Admin créé avec succès',
      admin: newAdmin
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'administrateur' });
  }
}

/**
 * Update admin
 */
export async function updateAdmin(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role_id, is_active } = req.body;

    const oldResult = await pool.query(
      'SELECT first_name, last_name, email, role_id, is_active FROM admins WHERE id = $1',
      [id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Admin non trouvé' });
    }

    const oldAdmin = oldResult.rows[0];
    const changes: Record<string, { old: string; new: string }> = {};

    // Track changes
    if (first_name && first_name !== oldAdmin.first_name) {
      changes.first_name = { old: oldAdmin.first_name, new: first_name };
    }
    if (last_name && last_name !== oldAdmin.last_name) {
      changes.last_name = { old: oldAdmin.last_name, new: last_name };
    }
    if (email && email !== oldAdmin.email) {
      changes.email = { old: oldAdmin.email, new: email };
    }
    if (role_id && role_id !== oldAdmin.role_id) {
      changes.role_id = { old: String(oldAdmin.role_id), new: String(role_id) };
    }
    if (is_active !== undefined && is_active !== oldAdmin.is_active) {
      changes.is_active = { old: String(oldAdmin.is_active), new: String(is_active) };
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (first_name) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(first_name);
      paramCount++;
    }
    if (last_name) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(last_name);
      paramCount++;
    }
    if (email) {
      updateFields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    if (role_id) {
      updateFields.push(`role_id = $${paramCount}`);
      values.push(role_id);
      paramCount++;
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const updateQuery = `UPDATE admins SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(updateQuery, values);

    if (req.admin && Object.keys(changes).length > 0) {
      await logAdminAction(req.admin.id, 'update', 'admins', Number(id), changes);
    }

    res.json({
      message: 'Admin mis à jour avec succès',
      admin: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

/**
 * Delete admin
 */
export async function deleteAdmin(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Prevent deleting your own account
    if (req.admin && req.admin.id === Number(id)) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const result = await pool.query(
      'DELETE FROM admins WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin non trouvé' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'delete', 'admins', Number(id));
    }

    res.json({ message: 'Admin supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}

/**
 * Update admin permissions
 */
export async function updateAdminPermissions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions doit être un tableau' });
    }

    // Delete existing custom permissions
    await pool.query('DELETE FROM admin_custom_permissions WHERE admin_id = $1', [id]);

    // Insert new permissions
    for (const perm of permissions) {
      const { permission_id, is_granted } = perm;
      await pool.query(
        `INSERT INTO admin_custom_permissions (admin_id, permission_id, is_granted, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [id, permission_id, is_granted]
      );
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'admin_permissions', Number(id));
    }

    res.json({ message: 'Permissions mises à jour avec succès' });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des permissions' });
  }
}

/**
 * Get all roles with permissions
 */
export async function getRoles(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.name, r.description, r.created_at,
              array_agg(json_build_object('id', p.id, 'slug', p.slug, 'description', p.description)) as permissions
       FROM admin_roles r
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.id
       GROUP BY r.id, r.name, r.description, r.created_at`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rôles' });
  }
}

/**
 * Get all permissions
 */
export async function getPermissions(req: Request, res: Response) {
  try {
    const result = await pool.query(
      'SELECT id, slug, description FROM permissions ORDER BY slug'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting permissions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des permissions' });
  }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { admin_id, action, limit = '50', offset = '0' } = req.query;

    let query = 'SELECT al.*, a.first_name, a.last_name FROM audit_logs al LEFT JOIN admins a ON al.admin_id = a.id WHERE 1=1';
    const values = [];

    if (admin_id) {
      query += ` AND al.admin_id = $${values.length + 1}`;
      values.push(admin_id);
    }

    if (action) {
      query += ` AND al.action = $${values.length + 1}`;
      values.push(action);
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), Number(offset));

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des logs' });
  }
}
