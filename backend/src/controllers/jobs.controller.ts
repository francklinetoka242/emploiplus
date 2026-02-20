import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

export async function listJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, location, country, company, sector, type, page = '1', limit = '10' } = req.query as any;
    const pageNum = parseInt(page, 10) || 1;
    // 🚀 OPTIMISATION BAS DÉBIT: Max 10 résultats par page
    const pageSize = Math.min(parseInt(limit, 10) || 10, 10);

    const where: string[] = [];
    const params: any[] = [];

    if (q) { params.push(`%${String(q).toLowerCase()}%`); where.push(`(LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`); }
    if (company) { params.push(String(company)); where.push(`company = $${params.length}`); }
    if (sector) { params.push(String(sector)); where.push(`sector = $${params.length}`); }
    if (type && String(type).toLowerCase() !== 'all') { params.push(String(type)); where.push(`LOWER(type) = LOWER($${params.length})`); }
    if (location) { params.push(String(location)); where.push(`location = $${params.length}`); }
    if (country) { params.push(String(country)); where.push(`location ILIKE '%' || $${params.length} || ''`); }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const offset = (pageNum - 1) * pageSize;

    const sql = `SELECT id, title, description, company, location, salary, type, created_at FROM jobs ${whereSql} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const result = await pool.query(sql, params);
    const countRes = await pool.query(`SELECT COUNT(*) as total FROM jobs ${whereSql}`, params.slice(0, params.length - 2));
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    res.json({ data: result.rows || [], pagination: { total, page: pageNum, pages: Math.ceil(total / pageSize), hasNextPage: offset + pageSize < total } });
  } catch (err) { 
    console.error('Error listing jobs:', err);
    res.json({ data: [], pagination: { total: 0, page: 1, pages: 0, hasNextPage: false } });
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Offre introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function createJob(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      title, company, location, sector, type, salary, description, image_url, application_url, application_via_emploi, deadline, deadline_date
    } = req.body as any;

    const result = await pool.query(`INSERT INTO jobs (title, company, location, sector, type, salary, description, image_url, application_url, application_via_emploi, deadline, deadline_date, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW()) RETURNING *`,
      [title, company, location, sector, type, salary, description, image_url, application_url, !!application_via_emploi, deadline || null, deadline_date || deadline || null]);

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function updateJob(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const fields = req.body as any;
    const allowed = ['title','company','location','sector','type','salary','description','image_url','application_url','application_via_emploi','deadline','deadline_date','published'];
    const sets: string[] = [];
    const params: any[] = [];
    Object.keys(fields).forEach((k) => {
      if (!allowed.includes(k)) return;
      params.push(fields[k]);
      sets.push(`${k} = $${params.length}`);
    });
    if (sets.length === 0) return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    params.push(id);
    const sql = `UPDATE jobs SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
    const result = await pool.query(sql, params);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function deleteJob(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function publishJob(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { published } = req.body as any;
    const result = await pool.query('UPDATE jobs SET published = $1, published_at = CASE WHEN $1 THEN NOW() ELSE NULL END WHERE id = $2 RETURNING *', [!!published, id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}
