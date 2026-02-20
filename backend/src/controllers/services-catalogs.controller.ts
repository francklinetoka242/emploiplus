/**
 * Service Catalogs Controller
 * Handles CRUD operations for service catalogs
 */

import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

// Get all catalogs (admin)
export async function getAllCatalogs(req: Request, res: Response, next: NextFunction) {
  try {
    const includeHidden = req.query.all === 'true';
    const where = includeHidden ? '' : 'WHERE is_visible = true';
    const sql = `
      SELECT * FROM service_catalogs 
      ${where}
      ORDER BY display_order ASC, created_at DESC
    `;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Get single catalog
export async function getCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(
      'SELECT * FROM service_catalogs WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Catalog not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Create catalog (admin only)
export async function createCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, is_visible = true, is_featured = false, display_order = 0 } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO service_catalogs (name, description, is_visible, is_featured, display_order) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, description || null, is_visible, is_featured, display_order]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Update catalog (admin only)
export async function updateCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { name, description, is_visible, is_featured, display_order } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      params.push(description);
    }
    if (is_visible !== undefined) {
      updates.push(`is_visible = $${paramCount++}`);
      params.push(is_visible);
    }
    if (is_featured !== undefined) {
      updates.push(`is_featured = $${paramCount++}`);
      params.push(is_featured);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      params.push(display_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const sql = `
      UPDATE service_catalogs 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const { rows } = await pool.query(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Catalog not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Delete catalog (admin only)
export async function deleteCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    
    const { rows } = await pool.query(
      'DELETE FROM service_catalogs WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Catalog not found' });
    }

    res.json({ success: true, message: 'Catalog deleted' });
  } catch (err) {
    next(err);
  }
}
