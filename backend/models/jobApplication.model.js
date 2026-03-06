import pool from '../config/db.js';

async function createApplication(data) {
  const {
    job_id,
    applicant_id,
    applicant_email,
    cv_url,
    cover_letter_url,
    receipt_url,
    additional_docs,
    message,
    status = 'pending',
  } = data;

  const query = `
    INSERT INTO job_applications
      (job_id, applicant_id, applicant_email, cv_url, cover_letter_url, receipt_url, additional_docs, message, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;
  const values = [
    job_id,
    applicant_id || null,
    applicant_email || null,
    cv_url || null,
    cover_letter_url || null,
    receipt_url || null,
    additional_docs ? JSON.stringify(additional_docs) : null,
    message || null,
    status,
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

async function hasApplied(jobId, userId) {
  const query = `SELECT count(*) FROM job_applications WHERE job_id = $1 AND applicant_id = $2`;
  const res = await pool.query(query, [jobId, userId]);
  return parseInt(res.rows[0].count, 10) > 0;
}

async function listApplications() {
  const query = `
    SELECT ja.*, j.title AS job_title, c.name AS job_company,
           u.first_name || ' ' || u.last_name AS applicant_name
    FROM job_applications ja
    LEFT JOIN jobs j ON j.id = ja.job_id
    LEFT JOIN users c ON c.id = j.company_id
    LEFT JOIN users u ON u.id = ja.applicant_id
    ORDER BY ja.created_at DESC
  `;
  const res = await pool.query(query);
  return res.rows;
}

async function getApplicationById(id) {
  const query = `
    SELECT ja.*, j.title AS job_title, c.name AS job_company,
           u.first_name || ' ' || u.last_name AS applicant_name
    FROM job_applications ja
    LEFT JOIN jobs j ON j.id = ja.job_id
    LEFT JOIN users c ON c.id = j.company_id
    LEFT JOIN users u ON u.id = ja.applicant_id
    WHERE ja.id = $1
  `;
  const res = await pool.query(query, [id]);
  return res.rows[0];
}

async function updateStatus(id, status) {
  const query = `UPDATE job_applications SET status = $1 WHERE id = $2 RETURNING *`;
  const res = await pool.query(query, [status, id]);
  return res.rows[0];
}

export default {
  createApplication,
  hasApplied,
  listApplications,
  getApplicationById,
  updateStatus,
};
