/**
 * Services Controller
 * Handles CRUD operations for individual services
 */

import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

// Get all services with optional filters
export async function getAllServices(req: Request, res: Response, next: NextFunction) {
  try {
    const { catalog_id, visible_only = true, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    // 🚀 OPTIMISATION BAS DÉBIT: Max 10 résultats par page
    const pageSize = Math.min(parseInt(limit as string, 10) || 10, 10);
    const offset = (pageNum - 1) * pageSize;
    
    let sql = 'SELECT * FROM services';
    const params: any[] = [];

    const where: string[] = [];

    if (visible_only === 'true') {
      where.push('services.is_visible = true');
      where.push('(SELECT is_visible FROM service_catalogs WHERE id = services.catalog_id) = true');
    }

    if (catalog_id) {
      where.push(`catalog_id = $${params.length + 1}`);
      params.push(Number(catalog_id));
    }

    if (where.length > 0) {
      sql += ` WHERE ${where.join(' AND ')}`;
    }

    sql += ' ORDER BY display_order ASC, created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(pageSize, offset);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM services';
    if (where.length > 0) {
      countSql += ` WHERE ${where.join(' AND ')}`;
    }
    const countParams = where.length > 0 ? params.slice(0, params.length - 2) : [];
    const countRes = await pool.query(countSql, countParams);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const { rows } = await pool.query(sql, params);
    res.json({ 
      data: rows,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
        hasNextPage: offset + pageSize < total
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get single service
export async function getService(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(
      'SELECT * FROM services WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Create service (admin only)
export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      catalog_id,
      name,
      description,
      price,
      rating,
      is_promo = false,
      promo_text,
      is_visible = true,
      image_url,
      brochure_url,
      display_order = 0
    } = req.body;

    if (!catalog_id || !name) {
      return res.status(400).json({ message: 'catalog_id and name are required' });
    }

    // Verify catalog exists
    const catalogCheck = await pool.query(
      'SELECT id FROM service_catalogs WHERE id = $1',
      [catalog_id]
    );

    if (catalogCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Catalog not found' });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const { rows } = await pool.query(
      `INSERT INTO services 
       (catalog_id, name, description, price, rating, is_promo, promo_text, is_visible, image_url, brochure_url, display_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        catalog_id,
        name,
        description || null,
        price || null,
        rating || null,
        is_promo,
        promo_text || null,
        is_visible,
        image_url || null,
        brochure_url || null,
        display_order
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Update service (admin only)
export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const {
      catalog_id,
      name,
      description,
      price,
      rating,
      is_promo,
      promo_text,
      is_visible,
      image_url,
      brochure_url,
      display_order
    } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (catalog_id !== undefined) {
      updates.push(`catalog_id = $${paramCount++}`);
      params.push(catalog_id);
    }
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      params.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      params.push(price);
    }
    if (rating !== undefined) {
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      updates.push(`rating = $${paramCount++}`);
      params.push(rating);
    }
    if (is_promo !== undefined) {
      updates.push(`is_promo = $${paramCount++}`);
      params.push(is_promo);
    }
    if (promo_text !== undefined) {
      updates.push(`promo_text = $${paramCount++}`);
      params.push(promo_text);
    }
    if (is_visible !== undefined) {
      updates.push(`is_visible = $${paramCount++}`);
      params.push(is_visible);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      params.push(image_url);
    }
    if (brochure_url !== undefined) {
      updates.push(`brochure_url = $${paramCount++}`);
      params.push(brochure_url);
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
      UPDATE services 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const { rows } = await pool.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Delete service (admin only)
export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);

    const { rows } = await pool.query(
      'DELETE FROM services WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
}
