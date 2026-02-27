import { pool } from '../src/config/database.js';

async function run() {
  try {
    console.log('Starting backfill: jobs.company_id from users.company_name...');
    const r1 = await pool.query(`UPDATE jobs SET company_id = u.id
      FROM users u
      WHERE jobs.company_id IS NULL
        AND lower(trim(coalesce(jobs.company,''))) = lower(trim(coalesce(u.company_name,'')))
        AND lower(coalesce(u.user_type,'')) = 'company'`);
    console.log('Jobs backfilled (by company_name):', r1.rowCount);

    console.log('Backfilling job_applications.company_id from jobs.company_id where missing...');
    const r2 = await pool.query(`UPDATE job_applications ja SET company_id = j.company_id
      FROM jobs j
      WHERE ja.company_id IS NULL
        AND ja.job_id = j.id
        AND j.company_id IS NOT NULL`);
    console.log('Job applications backfilled (from jobs.company_id):', r2.rowCount);

    console.log('Backfilling job_applications.company_id by matching job.company to users.company_name...');
    const r3 = await pool.query(`UPDATE job_applications ja SET company_id = u.id
      FROM jobs j, users u
      WHERE ja.company_id IS NULL
        AND ja.job_id = j.id
        AND j.company IS NOT NULL
        AND lower(trim(u.company_name)) = lower(trim(j.company))
        AND lower(coalesce(u.user_type,'')) = 'company'`);
    console.log('Job applications backfilled (by job.company -> users.company_name):', r3.rowCount);

    const c = await pool.query('SELECT COUNT(*)::int AS cnt FROM job_applications WHERE company_id IS NULL');
    console.log('Remaining job_applications with NULL company_id:', (c.rows[0] && c.rows[0].cnt) || 0);

    const jc = await pool.query('SELECT COUNT(*)::int AS cnt FROM jobs WHERE company_id IS NULL');
    console.log('Remaining jobs with NULL company_id:', (jc.rows[0] && jc.rows[0].cnt) || 0);

    console.log('Backfill complete.');
  } catch (e) {
    console.error('Backfill error:', e.stack || e.message || e);
  } finally {
    try { await pool.end(); } catch (e) {}
  }
}

run();
