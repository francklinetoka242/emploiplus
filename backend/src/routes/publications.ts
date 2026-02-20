/**
 * Publications / Newsfeed Routes
 * 
 * Handles:
 * - GET /publications - Fetch newsfeed with optional auth
 * - POST /publications - Create publication (auth required)
 * - PUT /publications/:id - Update publication (owner only)
 * - DELETE /publications/:id - Delete publication (owner only)
 * - POST /publications/:id/like - Like/Unlike publication
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';
import { userAuth } from '../middleware/auth.js';
import { NewsfeedService } from '../services/newsfeedService.js';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

interface PublicationRecord {
  id: number;
  author_id: number;
  content: string;
  image_url: string | null;
}

interface PublicationResponse extends PublicationRecord {
  full_name?: string;
  company_name?: string;
  profile_image_url?: string | null;
  user_type?: string;
}

/**
 * GET /api/publications
 * Public endpoint - fetch newsfeed with optional authentication
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    let viewerId: number | null = null;
    let viewerCompanyId: number | null = null;
    try {
      const authHeader = (req.headers.authorization || '') as string;
      if (authHeader) {
        const token = (authHeader.split(' ')[1] || '');
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
          viewerId = decoded?.id ?? null;
        }
      }
    } catch (e) {
      console.warn('Optional publications auth decode failed:', e instanceof Error ? e.message : String(e));
      viewerId = null;
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = parseInt(req.query.offset as string) || 0;
    const sortBy = (req.query.sort as string) || 'relevant';

    if (viewerId) {
      const { rows: viewerRows } = await pool.query(
        `SELECT id, company_id FROM users WHERE id = $1`,
        [viewerId]
      );
      viewerCompanyId = viewerRows?.[0]?.company_id;
    }

    const newsfeedService = new NewsfeedService(pool);
    const result = await newsfeedService.getNewsfeedPublications({
      viewerId: viewerId ?? 0,
      viewerCompanyId: viewerCompanyId ?? undefined,
      limit,
      offset,
      sortBy: sortBy as 'relevant' | 'recent',
    });
    
    const optimizedRows = result.publications.map((row: PublicationResponse) => ({
      ...row,
      image_url: row.image_url ? row.image_url : null,
      image_loading_strategy: 'lazy',
      certification_priority: undefined,
    }));
    
    const includeDebugInfo = process.env.DEBUG_NEWSFEED_FILTERS === 'true';
    
    res.json({
      publications: optimizedRows,
      total: result.total,
      limit,
      offset,
      hasMore: result.hasMore,
      ...(includeDebugInfo && { filtersSummary: result.filtersSummary }),
    });
  } catch (err) {
    console.error('Get publications error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * POST /api/publications
 * Create new publication (authenticated users only)
 */
router.post('/', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, visibility = 'public', hashtags, category = 'conseil', achievement = null, image_url = null } = req.body;
    const userId = req.userId;
    
    if (!content || !userId) {
      res.status(400).json({ success: false, message: 'Missing content or user ID' });
      return;
    }

    const newsfeedService = new NewsfeedService(pool);
    const profanityCheck = await newsfeedService.checkPublicationForProfanity(content);

    const { rows } = await pool.query(`
      INSERT INTO publications 
      (author_id, content, image_url, category, achievement, visibility, hashtags, likes_count, comments_count, is_active, contains_unmoderated_profanity, profanity_check_status, moderation_status, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, true, $8, $9, $10, NOW(), NOW()) 
      RETURNING *`, 
      [
        userId, 
        content, 
        image_url || null, 
        category, 
        achievement || null, 
        visibility, 
        hashtags || null,
        profanityCheck.hasProfanity,
        profanityCheck.hasProfanity ? 'flagged' : 'checked',
        profanityCheck.hasProfanity ? 'pending' : 'approved',
      ]
    );

    const publicationId = rows[0].id;

    if (profanityCheck.hasProfanity) {
      await pool.query(
        `INSERT INTO profanity_violations 
        (publication_id, user_id, violation_type, flagged_words, status) 
        VALUES ($1, $2, $3, $4, $5)`,
        [
          publicationId,
          userId,
          'banned_words',
          profanityCheck.foundWords,
          'pending',
        ]
      );
    }

    const { rows: userRows } = await pool.query(
      `SELECT full_name, company_name, profile_image_url, user_type FROM users WHERE id = $1`,
      [userId]
    );
    const publication = { ...rows[0], ...userRows[0] } as PublicationResponse;

    const response: { success: boolean; publication: PublicationResponse; profanityWarning?: Record<string, unknown> } = { 
      success: true, 
      publication 
    };
    if (profanityCheck.hasProfanity) {
      response.profanityWarning = {
        detected: true,
        severity: profanityCheck.severity,
        foundWords: profanityCheck.foundWords,
        message: 'Your publication contains forbidden words and requires moderation before being displayed publicly.',
      };
    }

    res.json(response);
  } catch (err) {
    console.error('Create publication error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * PUT /api/publications/:id
 * Update publication (owner only)
 */
router.put('/:id', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { content, visibility, hashtags, category, achievement, image_url } = req.body;
    
    const { rows: pubRows } = await pool.query(
      `SELECT author_id FROM publications WHERE id = $1`,
      [id]
    );
    
    if (!pubRows.length) {
      res.status(404).json({ success: false, message: 'Publication not found' });
      return;
    }
    
    if ((pubRows[0] as { author_id: number }).author_id !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized to update this publication' });
      return;
    }
    
    const { rows } = await pool.query(
      `UPDATE publications 
      SET content=$1, visibility=$2, hashtags=$3, image_url=$4, category=$5, achievement=$6, updated_at=NOW() 
      WHERE id=$7 
      RETURNING *`,
      [content, visibility || 'public', hashtags || null, image_url || null, category || 'annonce', achievement || false, id]
    );
    
    const { rows: userRows } = await pool.query(
      `SELECT full_name, company_name, profile_image_url, user_type FROM users WHERE id = $1`,
      [userId]
    );
    const publication = { ...rows[0], ...userRows[0] } as PublicationResponse;
    
    res.json({ success: true, publication });
  } catch (err) {
    console.error('Update publication error:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * DELETE /api/publications/:id
 * Delete publication (owner only)
 */
router.delete('/:id', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const { rows } = await pool.query(
      `SELECT author_id FROM publications WHERE id = $1`,
      [id]
    );
    
    if (!rows.length) {
      res.status(404).json({ success: false, message: 'Publication not found' });
      return;
    }
    
    if ((rows[0] as { author_id: number }).author_id !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this publication' });
      return;
    }
    
    await pool.query('DELETE FROM publications WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete publication error:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * POST /api/publications/:id/like
 * Like/Unlike publication
 */
router.post('/:id/like', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const { rows: pubRows } = await pool.query(
      `SELECT p.id, p.author_id, u.discreet_mode_enabled, u.company_id as author_company_id 
      FROM publications p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = $1`,
      [id]
    );
    
    if (!pubRows.length) {
      res.status(404).json({ success: false, message: 'Publication not found' });
      return;
    }

    const { rows: likeRows } = await pool.query(
      `SELECT id FROM publication_likes WHERE publication_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (likeRows.length > 0) {
      await pool.query(
        `DELETE FROM publication_likes WHERE publication_id = $1 AND user_id = $2`,
        [id, userId]
      );
      
      await pool.query(
        `UPDATE publications SET likes_count = likes_count - 1 WHERE id = $1`,
        [id]
      );
      
      res.json({ success: true, liked: false });
    } else {
      await pool.query(
        `INSERT INTO publication_likes (publication_id, user_id, created_at) VALUES ($1, $2, NOW())`,
        [id, userId]
      );
      
      await pool.query(
        `UPDATE publications SET likes_count = likes_count + 1 WHERE id = $1`,
        [id]
      );
      
      res.json({ success: true, liked: true });
    }
  } catch (err) {
    console.error('Like publication error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
