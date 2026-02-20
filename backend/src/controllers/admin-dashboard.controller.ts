/**
 * Admin Dashboard Content Controller
 * Manages jobs, trainings, FAQs, and static pages
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { Job, Training, FAQ, StaticPage } from '../types/index.js';
import { logAdminAction } from '../middleware/adminAuth.js';

// ============================================================================
// JOBS MANAGEMENT
// ============================================================================

export async function listJobs(req: Request, res: Response) {
  try {
    const { company_id, is_closed, limit = '20', offset = '0' } = req.query;

    let query = 'SELECT * FROM jobs WHERE 1=1';
    const values = [];

    if (company_id) {
      query += ` AND company_id = $${values.length + 1}`;
      values.push(company_id);
    }

    if (is_closed !== undefined) {
      query += ` AND is_closed = $${values.length + 1}`;
      values.push(is_closed === 'true');
    }

    query += ` ORDER BY deadline_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), Number(offset));

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing jobs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des offres' });
  }
}

export async function createJob(req: Request, res: Response) {
  try {
    const { company_id, title, description, requirements, location, salary_min, salary_max, job_type, experience_level, deadline_date } = req.body;

    const result = await pool.query(
      `INSERT INTO jobs (company_id, title, description, requirements, location, salary_min, salary_max, job_type, experience_level, deadline_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [company_id, title, description, requirements, location, salary_min, salary_max, job_type, experience_level, deadline_date]
    );

    if (req.admin) {
      await logAdminAction(req.admin.id, 'create', 'jobs', result.rows[0].id);
    }

    res.status(201).json({ message: 'Offre créée avec succès', job: result.rows[0] });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
}

export async function updateJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, requirements, location, salary_min, salary_max, job_type, experience_level, deadline_date, is_closed } = req.body;

    // Check if deadline_date has passed, auto-close if needed
    let shouldClose = is_closed;
    if (deadline_date) {
      shouldClose = new Date(deadline_date) < new Date();
    }

    const result = await pool.query(
      `UPDATE jobs SET title = COALESCE($1, title), description = COALESCE($2, description),
                       requirements = COALESCE($3, requirements), location = COALESCE($4, location),
                       salary_min = COALESCE($5, salary_min), salary_max = COALESCE($6, salary_max),
                       job_type = COALESCE($7, job_type), experience_level = COALESCE($8, experience_level),
                       deadline_date = COALESCE($9, deadline_date), is_closed = COALESCE($10, is_closed),
                       updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [title, description, requirements, location, salary_min, salary_max, job_type, experience_level, deadline_date, shouldClose, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'jobs', Number(id));
    }

    res.json({ message: 'Offre mise à jour avec succès', job: result.rows[0] });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

export async function deleteJob(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'delete', 'jobs', Number(id));
    }

    res.json({ message: 'Offre supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}

// ============================================================================
// TRAININGS MANAGEMENT
// ============================================================================

export async function listTrainings(req: Request, res: Response) {
  try {
    const { category, is_closed, limit = '20', offset = '0' } = req.query;

    let query = 'SELECT * FROM trainings WHERE 1=1';
    const values = [];

    if (category) {
      query += ` AND category = $${values.length + 1}`;
      values.push(category);
    }

    if (is_closed !== undefined) {
      query += ` AND is_closed = $${values.length + 1}`;
      values.push(is_closed === 'true');
    }

    query += ` ORDER BY deadline_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), Number(offset));

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing trainings:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des formations' });
  }
}

export async function createTraining(req: Request, res: Response) {
  try {
    const { title, description, provider, duration, level, category, deadline_date, certification, cost } = req.body;

    const result = await pool.query(
      `INSERT INTO trainings (title, description, provider, duration, level, category, deadline_date, certification, cost, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [title, description, provider, duration, level, category, deadline_date, certification, cost]
    );

    if (req.admin) {
      await logAdminAction(req.admin.id, 'create', 'trainings', result.rows[0].id);
    }

    res.status(201).json({ message: 'Formation créée avec succès', training: result.rows[0] });
  } catch (error) {
    console.error('Error creating training:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
}

export async function updateTraining(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, provider, duration, level, category, deadline_date, certification, cost, is_closed } = req.body;

    let shouldClose = is_closed;
    if (deadline_date) {
      shouldClose = new Date(deadline_date) < new Date();
    }

    const result = await pool.query(
      `UPDATE trainings SET title = COALESCE($1, title), description = COALESCE($2, description),
                            provider = COALESCE($3, provider), duration = COALESCE($4, duration),
                            level = COALESCE($5, level), category = COALESCE($6, category),
                            deadline_date = COALESCE($7, deadline_date), certification = COALESCE($8, certification),
                            cost = COALESCE($9, cost), is_closed = COALESCE($10, is_closed),
                            updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [title, description, provider, duration, level, category, deadline_date, certification, cost, shouldClose, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'trainings', Number(id));
    }

    res.json({ message: 'Formation mise à jour avec succès', training: result.rows[0] });
  } catch (error) {
    console.error('Error updating training:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

export async function deleteTraining(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM trainings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'delete', 'trainings', Number(id));
    }

    res.json({ message: 'Formation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting training:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}

// ============================================================================
// FAQ MANAGEMENT
// ============================================================================

export async function listFAQs(req: Request, res: Response) {
  try {
    const { category, is_active } = req.query;

    let query = 'SELECT * FROM faqs WHERE 1=1';
    const values = [];

    if (category) {
      query += ` AND category = $${values.length + 1}`;
      values.push(category);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${values.length + 1}`;
      values.push(is_active === 'true');
    }

    query += ` ORDER BY category, order_position`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing FAQs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des FAQs' });
  }
}

export async function createFAQ(req: Request, res: Response) {
  try {
    const { category, question, answer, order_position } = req.body;

    const result = await pool.query(
      `INSERT INTO faqs (category, question, answer, order_position, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [category, question, answer, order_position || 0]
    );

    if (req.admin) {
      await logAdminAction(req.admin.id, 'create', 'faqs', result.rows[0].id);
    }

    res.status(201).json({ message: 'FAQ créée avec succès', faq: result.rows[0] });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
}

export async function updateFAQ(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { category, question, answer, order_position, is_active } = req.body;

    const result = await pool.query(
      `UPDATE faqs SET category = COALESCE($1, category), question = COALESCE($2, question),
                       answer = COALESCE($3, answer), order_position = COALESCE($4, order_position),
                       is_active = COALESCE($5, is_active), updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [category, question, answer, order_position, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'FAQ non trouvée' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'faqs', Number(id));
    }

    res.json({ message: 'FAQ mise à jour avec succès', faq: result.rows[0] });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

export async function deleteFAQ(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'FAQ non trouvée' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'delete', 'faqs', Number(id));
    }

    res.json({ message: 'FAQ supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}

// ============================================================================
// STATIC PAGES (GESTION ÉDITORIALE)
// ============================================================================

export async function listStaticPages(req: Request, res: Response) {
  try {
    const result = await pool.query(
      'SELECT id, slug, title, meta_description, published, created_at, updated_at FROM static_pages ORDER BY slug'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error listing static pages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des pages' });
  }
}

export async function getStaticPage(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      'SELECT * FROM static_pages WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting static page:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
}

export async function updateStaticPage(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const { title, content, meta_description, published } = req.body;

    const result = await pool.query(
      `UPDATE static_pages SET title = COALESCE($1, title), content = COALESCE($2, content),
                               meta_description = COALESCE($3, meta_description),
                               published = COALESCE($4, published),
                               updated_by = $5, updated_at = NOW()
       WHERE slug = $6 RETURNING *`,
      [title, content, meta_description, published, req.admin?.id, slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page non trouvée' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'static_pages', result.rows[0].id);
    }

    res.json({ message: 'Page mise à jour avec succès', page: result.rows[0] });
  } catch (error) {
    console.error('Error updating static page:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}
