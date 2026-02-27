import { Request, Response } from 'express';
import { query } from '@config/database.js';
import { CustomError } from '@middlewares/errorMiddleware.js';

/**
 * Contrôleur pour les formations
 * Gère la logique métier de lecture des formations
 * 
 * IMPORTANT: Ce module est complètement isolé
 * Si la table 'formations' manque ou est vide, cela ne doit PAS affecter les autres routes
 */

/**
 * GET /api/formations
 * Récupère toutes les formations disponibles
 * 
 * Query parameters optionnels:
 * - limit: nombre de formations (par défaut 100)
 * - offset: pagination (par défaut 0)
 * - level: niveau (beginner, intermediate, advanced)
 * - category: catégorie
 */
export async function getFormations(req: Request, res: Response): Promise<void> {
  try {
    // Paramètres de pagination
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    // Paramètres de filtrage optionnels
    const level = req.query.level as string;
    const category = req.query.category as string;

    // Construire la requête dynamiquement
    let sql = 'SELECT * FROM formations';
    const params: any[] = [];
    const conditions: string[] = [];

    // Filtrage par niveau
    if (level) {
      conditions.push('level = $' + (params.length + 1));
      params.push(level);
    }

    // Filtrage par catégorie
    if (category) {
      conditions.push('category = $' + (params.length + 1));
      params.push(category);
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
      message: `${result.rows.length} formations trouvées`,
      data: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rowCount,
      },
    });
  } catch (error) {
    // ISOLEMENT: Si la table 'formations' n'existe pas,
    // on retourne une réponse vide mais contrôlée
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('does not exist') || errorMessage.includes('formations')) {
      console.warn('⚠️  Table formations non disponible - retour vide');
      res.json({
        success: true,
        message: 'Module formations non disponible',
        data: [],
        pagination: {
          limit: 0,
          offset: 0,
          total: 0,
        },
        note: 'La table formations n\'existe pas ou n\'est pas accessible',
      });
      return;
    }

    throw new CustomError(
      `Erreur lors de la lecture des formations: ${errorMessage}`,
      500,
      'formationsController.getFormations'
    );
  }
}

/**
 * GET /api/formations/:id
 * Récupère une formation spécifique
 */
export async function getFormationById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      throw new CustomError('L\'ID de la formation est requis', 400, 'formationsController.getFormationById');
    }

    const result = await query(
      'SELECT * FROM formations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new CustomError(`Formation avec l'ID ${id} non trouvée`, 404, 'formationsController.getFormationById');
    }

    res.json({
      success: true,
      message: 'Formation trouvée',
      data: result.rows[0],
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    throw new CustomError(
      `Erreur lors de la lecture de la formation: ${message}`,
      500,
      'formationsController.getFormationById'
    );
  }
}

/**
 * GET /api/formations/search/:query
 * Recherche des formations par keyword
 */
export async function searchFormations(req: Request, res: Response): Promise<void> {
  try {
    const { query: searchQuery } = req.params;

    if (!searchQuery || (typeof searchQuery === 'string' && searchQuery.trim().length === 0)) {
      throw new CustomError('Le terme de recherche est requis', 400, 'formationsController.searchFormations');
    }

    const queryString = typeof searchQuery === 'string' ? searchQuery : Array.isArray(searchQuery) ? searchQuery[0] : String(searchQuery);

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);

    // Recherche textuelle
    const result = await query(
      `
      SELECT * FROM formations 
      WHERE 
        title ILIKE $1 OR 
        description ILIKE $1 OR 
        instructor ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [`%${queryString}%`, limit]
    );

    res.json({
      success: true,
      message: `${result.rows.length} formations trouvées pour "${queryString}"`,
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
      'formationsController.searchFormations'
    );
  }
}

/**
 * GET /api/formations/stats
 * Récupère les statistiques sur les formations
 */
export async function getFormationStats(req: Request, res: Response): Promise<void> {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_formations,
        COUNT(DISTINCT level) as total_levels,
        COUNT(DISTINCT category) as total_categories,
        AVG(CAST(duration_hours AS DECIMAL)) as avg_duration
      FROM formations
    `);

    res.json({
      success: true,
      message: 'Statistiques des formations',
      data: result.rows[0],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Isolement: Si la table n'existe pas
    if (errorMessage.includes('does not exist') || errorMessage.includes('formations')) {
      res.json({
        success: true,
        message: 'Statistiques formations non disponibles',
        data: {
          total_formations: 0,
          total_levels: 0,
          total_categories: 0,
          avg_duration: null,
        },
        note: 'La table formations n\'existe pas ou n\'est pas accessible',
      });
      return;
    }

    throw new CustomError(
      `Erreur lors de la lecture des statistiques: ${errorMessage}`,
      500,
      'formationsController.getFormationStats'
    );
  }
}
