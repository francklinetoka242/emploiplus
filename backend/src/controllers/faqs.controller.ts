import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

export async function listFaqs(req: Request, res: Response, next: NextFunction) {
  try {
    const all = req.query.all === 'true' || false;
    const category = typeof req.query.category === 'string' ? req.query.category : null;
    const params: any[] = [];
    let where = '';
    if (!all) {
      params.push(true);
      where = `WHERE is_visible = $${params.length}`;
    }
    if (category) {
      params.push(category);
      where = where ? `${where} AND category = $${params.length}` : `WHERE category = $${params.length}`;
    }
    const sql = `SELECT * FROM faqs ${where} ORDER BY category ASC, display_order ASC, id ASC`;
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
}

export async function getFaq(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query('SELECT * FROM faqs WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'FAQ introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

export async function createFaq(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, question, answer, display_order, is_visible = true } = req.body as any;
    if (!category || !question || !answer) return res.status(400).json({ message: 'category, question et answer sont obligatoires' });
    const { rows } = await pool.query(`INSERT INTO faqs (category, question, answer, display_order, is_visible) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [category, question, answer, display_order || 0, is_visible]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

export async function updateFaq(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const fields = req.body as any;
    const allowed = ['category','question','answer','display_order','is_visible'];
    const sets: string[] = [];
    const params: any[] = [];
    Object.keys(fields).forEach((k) => { if (!allowed.includes(k)) return; params.push(fields[k]); sets.push(`${k} = $${params.length}`); });
    if (sets.length === 0) return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    params.push(id);
    const sql = `UPDATE faqs SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
    const { rows } = await pool.query(sql, params);
    res.json(rows[0]);
  } catch (err) { next(err); }
}

export async function deleteFaq(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM faqs WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { next(err); }
}
