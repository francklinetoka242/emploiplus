import { Request, Response } from 'express';
import { query } from '@config/database.js';
import { CustomError } from '@middlewares/errorMiddleware.js';

/**
 * Contrôleur pour les offres d'emploi
 * Gère la logique métier de lecture des jobs
 */

/**
 * GET /api/jobs
 * Récupère toutes les offres d'emploi
 * 
 * Query parameters optionnels:
 * - limit: nombre d'offres (par défaut 128)
 * - offset: pagination (par défaut 0)
 * - company_id: filtrer par compagnie
 * - status: filtrer par statut (active, inactive, archived)
 */
export async function getJobs(req: Request, res: Response): Promise<void> {
  try {
    // Paramètres de pagination
    const limit = Math.min(parseInt(req.query.limit as string) || 128, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    // Paramètres de filtrage optionnels
    const companyId = req.query.company_id as string;
    const status = req.query.status as string;

    // Construire la requête dynamiquement
    let sql = 'SELECT * FROM jobs';
    const params: any[] = [];
    const conditions: string[] = [];

    // Filtrage par compagnie
    if (companyId) {
      conditions.push('company_id = $' + (params.length + 1));
      params.push(companyId);
    }

    // Filtrage par statut
    if (status) {
      conditions.push('status = $' + (params.length + 1));
      params.push(status);
    }

    // Ajouter les conditions WHERE
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Ajouter la pagination
    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    // Exécuter la requête
    const result = await query(sql, params);

    // Répondre avec succès
    res.json({
      success: true,
      message: `${result.rows.length} offres d'emploi trouvées`,
      data: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rowCount,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    throw new CustomError(
      `Erreur lors de la lecture des jobs: ${message}`,
      500,
      'jobsController.getJobs'
    );
  }
}

/**
 * GET /api/jobs/:id
 * Récupère une offre d'emploi spécifique
 */
export async function getJobById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      throw new CustomError('L\'ID de l\'offre est requis', 400, 'jobsController.getJobById');
    }

    const result = await query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new CustomError(`Offre d'emploi avec l'ID ${id} non trouvée`, 404, 'jobsController.getJobById');
    }

    res.json({
      success: true,
      message: 'Offre d\'emploi trouvée',
      data: result.rows[0],
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    throw new CustomError(
      `Erreur lors de la lecture du job: ${message}`,
      500,
      'jobsController.getJobById'
    );
  }
}

/**
 * GET /api/jobs/search/:query
 * Recherche des offres d'emploi par keyword
 */
export async function searchJobs(req: Request, res: Response): Promise<void> {
  try {
    const { query: searchQuery } = req.params;

    if (!searchQuery || (typeof searchQuery === 'string' && searchQuery.trim().length === 0)) {
      throw new CustomError('Le terme de recherche est requis', 400, 'jobsController.searchJobs');
    }

    const queryString = typeof searchQuery === 'string' ? searchQuery : Array.isArray(searchQuery) ? searchQuery[0] : String(searchQuery);

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);

    // Recherche textuelle
    const result = await query(
      `
      SELECT * FROM jobs 
      WHERE 
        title ILIKE $1 OR 
        description ILIKE $1 OR 
        company_name ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [`%${queryString}%`, limit]
    );

    res.json({
      success: true,
      message: `${result.rows.length} offres trouvées pour "${queryString}"`,
      query: queryString,
      data: result.rows,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    throw new CustomError(
      `Erreur lors de la recherche: ${message}`,
      500,
      'jobsController.searchJobs'
    );
  }
}

/**
 * GET /api/jobs/stats
 * Récupère les statistiques sur les offres d'emploi
 */
export async function getJobStats(req: Request, res: Response): Promise<void> {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_jobs,
        COUNT(DISTINCT company_id) as total_companies
      FROM jobs
    `);

    res.json({
      success: true,
      message: 'Statistiques des offres d\'emploi',
      data: result.rows[0],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    throw new CustomError(
      `Erreur lors de la lecture des statistiques: ${message}`,
      500,
      'jobsController.getJobStats'
    );
  }
}
