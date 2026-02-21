import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

export async function listFaqs(req: Request, res: Response, next: NextFunction) {
  try {
    // New strict schema: faqs(id, question, answer, published)
    const onlyPublished = req.query.published === undefined ? true : req.query.published === 'true';
    const params: any[] = [];
    let where = '';
    if (onlyPublished) {
      params.push(true);
      where = `WHERE published = $${params.length}`;
    }
    const sql = `SELECT id, question, answer, published FROM faqs ${where} ORDER BY id ASC`;
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
    const { question, answer, published = true } = req.body as any;
    if (!question || !answer) return res.status(400).json({ message: 'question et answer sont obligatoires' });
    const { rows } = await pool.query(`INSERT INTO faqs (question, answer, published) VALUES ($1,$2,$3) RETURNING id, question, answer, published`, [question, answer, published]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

export async function updateFaq(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const fields = req.body as any;
    const allowed = ['question','answer','published'];
    const sets: string[] = [];
    const params: any[] = [];
    Object.keys(fields).forEach((k) => { if (!allowed.includes(k)) return; params.push(fields[k]); sets.push(`${k} = $${params.length}`); });
    if (sets.length === 0) return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    params.push(id);
    const sql = `UPDATE faqs SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING id, question, answer, published`;
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
