/**
 * Admin Jobs Management Controller
 * Handles CRUD operations for job postings in the admin panel
 * 
 * All list endpoints return [] (empty array) instead of errors
 * to prevent "t.map is not a function" errors on the frontend
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { logAdminAction } from '../middleware/adminAuth.js';

/**
 * List all jobs with optional filters
 * Always returns an array (empty if no results)
 */
export async function listJobs(req: Request, res: Response) {
  try {
    const { company_id, is_closed, limit = '20', offset = '0' } = req.query;

    let query = `
      SELECT 
        id, 
        title, 
        description, 
        company_id, 
        location, 
        salary_min, 
        salary_max, 
        job_type, 
        experience_level, 
        deadline_date, 
        is_closed, 
        created_at, 
        updated_at 
      FROM jobs 
      WHERE 1=1
    `;
    const values = [];

    // Add filters
    if (company_id) {
      query += ` AND company_id = $${values.length + 1}`;
      values.push(company_id);
    }

    if (is_closed !== undefined) {
      query += ` AND is_closed = $${values.length + 1}`;
      values.push(is_closed === 'true');
    }

    // Add pagination
    query += ` ORDER BY deadline_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), Number(offset));

    const result = await pool.query(query, values);
    
    // Always return array, even if empty
    res.json(result.rows || []);
  } catch (error) {
    console.error('Error listing jobs:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json([]);
  }
}

/**
 * Get a single job by ID
 */
export async function getJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        id, 
        title, 
        description, 
        company_id, 
        location, 
        salary_min, 
        salary_max, 
        job_type, 
        experience_level, 
        deadline_date, 
        is_closed, 
        created_at, 
        updated_at 
      FROM jobs WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
}

/**
 * Create a new job
 */
export async function createJob(req: Request, res: Response) {
  try {
    const { 
      company_id, 
      title, 
      description, 
      location, 
      salary_min, 
      salary_max, 
      job_type, 
      experience_level, 
      deadline_date 
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Le titre et la description sont requis' });
    }

    const result = await pool.query(
      `INSERT INTO jobs (
        company_id, 
        title, 
        description, 
        location, 
        salary_min, 
        salary_max, 
        job_type, 
        experience_level, 
        deadline_date, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [company_id, title, description, location, salary_min, salary_max, job_type, experience_level, deadline_date]
    );

    if (req.admin) {
      await logAdminAction(req.admin.id, 'create', 'jobs', result.rows[0].id);
    }

    res.status(201).json({ 
      message: 'Offre créée avec succès', 
      job: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
}

/**
 * Update an existing job
 */
export async function updateJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      location, 
      salary_min, 
      salary_max, 
      job_type, 
      experience_level, 
      deadline_date, 
      is_closed 
    } = req.body;

    // Determine if job should be auto-closed based on deadline
    let shouldClose = is_closed;
    if (deadline_date) {
      shouldClose = new Date(deadline_date) < new Date();
    }

    const result = await pool.query(
      `UPDATE jobs 
       SET 
        title = COALESCE($1, title), 
        description = COALESCE($2, description),
        location = COALESCE($3, location),
        salary_min = COALESCE($4, salary_min), 
        salary_max = COALESCE($5, salary_max),
        job_type = COALESCE($6, job_type), 
        experience_level = COALESCE($7, experience_level),
        deadline_date = COALESCE($8, deadline_date), 
        is_closed = COALESCE($9, is_closed),
        updated_at = NOW()
       WHERE id = $10 
       RETURNING *`,
      [title, description, location, salary_min, salary_max, job_type, experience_level, deadline_date, shouldClose, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    if (req.admin) {
      await logAdminAction(req.admin.id, 'update', 'jobs', Number(id));
    }

    res.json({ 
      message: 'Offre mise à jour avec succès', 
      job: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

/**
 * Delete a job
 */
export async function deleteJob(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 RETURNING id',
      [id]
    );

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
