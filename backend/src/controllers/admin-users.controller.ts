/**
 * Admin Users & Services Management Controller
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { logAdminAction } from '../middleware/adminAuth.js';

// ============================================================================
// USERS MANAGEMENT
// ============================================================================

export async function listUsers(req: Request, res: Response) {
  try {
    const { user_type, is_blocked, limit = '20', offset = '0' } = req.query;

    let query = 'SELECT id, email, first_name, last_name, user_type, is_blocked, created_at, updated_at FROM users WHERE 1=1';
    const values = [];

    if (user_type) {
      query += ` AND user_type = $${values.length + 1}`;
      values.push(user_type);
    }

    if (is_blocked !== undefined) {
      query += ` AND is_blocked = $${values.length + 1}`;
      values.push(is_blocked === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), Number(offset));

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, user_type, is_blocked, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
}

export async function blockUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET is_blocked = true WHERE id = $1 RETURNING id, email, is_blocked',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'users', Number(id), { 
        is_blocked: { old: 'false', new: 'true' } 
      });
    }

    res.json({ message: 'Utilisateur bloqué avec succès', user: result.rows[0] });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Erreur lors du blocage' });
  }
}

export async function unblockUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET is_blocked = false WHERE id = $1 RETURNING id, email, is_blocked',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'users', Number(id), {
        is_blocked: { old: 'true', new: 'false' }
      });
    }

    res.json({ message: 'Utilisateur débloqué avec succès', user: result.rows[0] });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Erreur lors du déblocage' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Get user info before deletion
    const userResult = await pool.query('SELECT id, email FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (req.admin) {
      await logAdminAction(req.admin.id, 'delete', 'users', Number(id));
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}

// ============================================================================
// SERVICES & CATALOG MANAGEMENT
// ============================================================================

export async function listServiceCatalogs(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT sc.*, 
              COUNT(s.id) as service_count
       FROM service_catalogs sc
       LEFT JOIN services s ON sc.id = s.catalog_id
       GROUP BY sc.id
       ORDER BY sc.display_order`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error listing service catalogs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catalogues' });
  }
}

export async function createServiceCatalog(req: Request, res: Response) {
  try {
    const { name, description, display_order, is_visible, is_featured } = req.body;

    const result = await pool.query(
      `INSERT INTO service_catalogs (name, description, display_order, is_visible, is_featured, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [name, description, display_order || 0, is_visible !== false, is_featured || false]
    );

    if (req.admin) {
      await logAdminAction(req.admin.id, 'create', 'service_catalogs', result.rows[0].id);
    }

    res.status(201).json({ message: 'Catalogue créé avec succès', catalog: result.rows[0] });
  } catch (error) {
    console.error('Error creating service catalog:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
}

export async function updateServiceCatalog(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, display_order, is_visible, is_featured } = req.body;

    const result = await pool.query(
      `UPDATE service_catalogs SET name = COALESCE($1, name), description = COALESCE($2, description),
                                   display_order = COALESCE($3, display_order),
                                   is_visible = COALESCE($4, is_visible),
                                   is_featured = COALESCE($5, is_featured),
                                   updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, description, display_order, is_visible, is_featured, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catalogue non trouvé' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'service_catalogs', Number(id));
    }

    res.json({ message: 'Catalogue mis à jour avec succès', catalog: result.rows[0] });
  } catch (error) {
    console.error('Error updating service catalog:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

export async function deleteServiceCatalog(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM service_catalogs WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catalogue non trouvé' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'delete', 'service_catalogs', Number(id));
    }

    res.json({ message: 'Catalogue supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting service catalog:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}

// Services
export async function listServices(req: Request, res: Response) {
  try {
    const { catalog_id, is_promo, limit = '20', offset = '0' } = req.query;

    let query = 'SELECT s.*, sc.name as catalog_name FROM services s LEFT JOIN service_catalogs sc ON s.catalog_id = sc.id WHERE 1=1';
    const values = [];

    if (catalog_id) {
      query += ` AND s.catalog_id = $${values.length + 1}`;
      values.push(catalog_id);
    }

    if (is_promo !== undefined) {
      query += ` AND s.is_promo = $${values.length + 1}`;
      values.push(is_promo === 'true');
    }

    query += ` ORDER BY s.display_order LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), Number(offset));

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing services:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des services' });
  }
}

export async function createService(req: Request, res: Response) {
  try {
    const { catalog_id, name, description, price, is_promo, promo_text, display_order } = req.body;

    const result = await pool.query(
      `INSERT INTO services (catalog_id, name, description, price, is_promo, promo_text, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [catalog_id, name, description, price, is_promo || false, promo_text, display_order || 0]
    );

    if (req.admin) {
      await logAdminAction(req.admin.id, 'create', 'services', result.rows[0].id);
    }

    res.status(201).json({ message: 'Service créé avec succès', service: result.rows[0] });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
}

export async function updateService(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, price, is_promo, promo_text, display_order, is_visible } = req.body;

    const result = await pool.query(
      `UPDATE services SET name = COALESCE($1, name), description = COALESCE($2, description),
                           price = COALESCE($3, price), is_promo = COALESCE($4, is_promo),
                           promo_text = COALESCE($5, promo_text), display_order = COALESCE($6, display_order),
                           is_visible = COALESCE($7, is_visible), updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, description, price, is_promo, promo_text, display_order, is_visible, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'services', Number(id));
    }

    res.json({ message: 'Service mis à jour avec succès', service: result.rows[0] });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

export async function deleteService(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'delete', 'services', Number(id));
    }

    res.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}

// Service Ratings
export async function updateServiceRating(req: Request, res: Response) {
  try {
    const { service_id } = req.params;
    const { rating, review_count } = req.body;

    const result = await pool.query(
      `UPDATE service_ratings SET rating = $1, review_count = $2, updated_at = NOW()
       WHERE service_id = $3 RETURNING *`,
      [rating, review_count, service_id]
    );

    if (result.rows.length === 0) {
      // Create if doesn't exist
      const createResult = await pool.query(
        `INSERT INTO service_ratings (service_id, rating, review_count, updated_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [service_id, rating, review_count]
      );
      return res.json({ message: 'Note créée avec succès', rating: createResult.rows[0] });
    }

    res.json({ message: 'Note mise à jour avec succès', rating: result.rows[0] });
  } catch (error) {
    console.error('Error updating service rating:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

// Promotion Badges
export async function createPromotionBadge(req: Request, res: Response) {
  try {
    const { service_catalog_id, badge_text, badge_color } = req.body;

    const result = await pool.query(
      `INSERT INTO promotion_badges (service_catalog_id, badge_text, badge_color, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [service_catalog_id, badge_text, badge_color]
    );

    res.status(201).json({ message: 'Badge créé avec succès', badge: result.rows[0] });
  } catch (error) {
    console.error('Error creating promotion badge:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
}

export async function updatePromotionBadge(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { badge_text, badge_color, is_active } = req.body;

    const result = await pool.query(
      `UPDATE promotion_badges SET badge_text = COALESCE($1, badge_text),
                                   badge_color = COALESCE($2, badge_color),
                                   is_active = COALESCE($3, is_active),
                                   updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [badge_text, badge_color, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Badge non trouvé' });
    }

    res.json({ message: 'Badge mis à jour avec succès', badge: result.rows[0] });
  } catch (error) {
    console.error('Error updating promotion badge:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

export async function deletePromotionBadge(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM promotion_badges WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Badge non trouvé' });
    }

    res.json({ message: 'Badge supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting promotion badge:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}
