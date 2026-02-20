import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

export async function listTrainings(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, page = '1', limit = '10' } = req.query as any;
    const pageNum = parseInt(page, 10) || 1;
    // 🚀 OPTIMISATION BAS DÉBIT: Max 10 résultats par page
    const pageSize = Math.min(parseInt(limit, 10) || 10, 10);
    const where: string[] = [];
    const params: any[] = [];
    if (q) { params.push(`%${String(q).toLowerCase()}%`); where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`); }
    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (pageNum - 1) * pageSize;
    const sql = `SELECT * FROM trainings ${whereSql} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);
    const result = await pool.query(sql, params);
    const countRes = await pool.query(`SELECT COUNT(*) as total FROM trainings ${whereSql}`, params.slice(0, params.length - 2));
    const total = parseInt(countRes.rows[0]?.total || '0', 10);
    res.json({ data: result.rows, pagination: { total, page: pageNum, pages: Math.ceil(total / pageSize), hasNextPage: offset + pageSize < total } });
  } catch (err) { next(err); }
}

export async function getTraining(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('SELECT * FROM trainings WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Formation introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function createTraining(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, provider, modalities, description, image_url, deadline_date } = req.body as any;
    const result = await pool.query(`INSERT INTO trainings (name, provider, modalities, description, image_url, deadline_date, created_at)
      VALUES ($1,$2,$3,$4,$5,$6, NOW()) RETURNING *`, [name, provider, modalities, description || null, image_url || null, deadline_date || null]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function updateTraining(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const fields = req.body as any;
    const allowed = ['name','provider','modalities','description','image_url','deadline_date'];
    const sets: string[] = [];
    const params: any[] = [];
    Object.keys(fields).forEach((k) => { if (!allowed.includes(k)) return; params.push(fields[k]); sets.push(`${k} = $${params.length}`); });
    if (sets.length === 0) return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    params.push(id);
    const sql = `UPDATE trainings SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
    const result = await pool.query(sql, params);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function deleteTraining(req: Request, res: Response, next: NextFunction) {
  try { const id = Number(req.params.id); await pool.query('DELETE FROM trainings WHERE id = $1', [id]); res.json({ success: true }); } catch (err) { next(err); }
}
