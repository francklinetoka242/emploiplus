import { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';
import checkPermission from '../middleware/checkPermission.js';

const router = Router();

// Ensure table exists
pool.query(`CREATE TABLE IF NOT EXISTS static_pages (
  slug VARCHAR(200) PRIMARY KEY,
  title TEXT,
  content TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
)`).catch(() => { });

// Get a static page (admin view)
router.get('/static-pages/:slug', checkPermission('perm_editoriale'), async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const { rows } = await pool.query('SELECT slug, title, content, updated_at FROM static_pages WHERE slug = $1', [slug]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page: rows[0] });
  } catch (err) {
    console.error('Error fetching static page', err);
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

// Public get (non-admin) - optional, uses no permission check
router.get('/public/static-pages/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const { rows } = await pool.query('SELECT slug, title, content, updated_at FROM static_pages WHERE slug = $1', [slug]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page: rows[0] });
  } catch (err) {
    console.error('Error fetching static page (public)', err);
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

// Create or update a static page
router.put('/static-pages/:slug', checkPermission('perm_editoriale'), async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content required' });
  try {
    // Upsert
    await pool.query(
      `INSERT INTO static_pages (slug, title, content, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW()`,
      [slug, title, content]
    );
    res.json({ success: true, message: 'Page saved' });
  } catch (err) {
    console.error('Error saving static page', err);
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

export default router;
