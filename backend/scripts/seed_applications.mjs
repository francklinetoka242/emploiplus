#!/usr/bin/env node
import dotenv from 'dotenv';
import { pool, isConnected } from '../src/config/database.js';

dotenv.config();

async function up() {
  try {
    // Wait for DB connection (tries for up to ~15s)
    const waitForDb = async (retries = 15, delayMs = 1000) => {
      for (let i = 0; i < retries; i++) {
        if (isConnected) return true;
        await new Promise(r => setTimeout(r, delayMs));
      }
      return false;
    };
    const ok = await waitForDb();
    if (!ok) throw new Error('Database not connected - aborting seed');
    // Create or find a company user
    const companyEmail = process.env.SEED_COMPANY_EMAIL || 'acme@example.com';
    const applicantEmail = process.env.SEED_APPLICANT_EMAIL || 'candidate@example.com';

    const { rows: compRows } = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [companyEmail]);
    let companyId;
    if (compRows && compRows.length > 0) {
      companyId = compRows[0].id;
      console.log('Found existing company id', companyId);
    } else {
      const r = await pool.query(
        `INSERT INTO users (full_name, email, password, user_type, company_name, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id`,
        ['ACME Ltd', companyEmail, 'seed', 'company', 'ACME Ltd']
      );
      companyId = (r && r.rows && r.rows[0]) ? r.rows[0].id : null;
      if (!companyId) throw new Error('Could not insert or retrieve company id');
      console.log('Inserted company id', companyId);
    }

    // Create or find a job owned by company
    const jobTitle = 'Développeur Web (seed)';
    const { rows: jobRows } = await pool.query('SELECT id FROM jobs WHERE title = $1 AND company_id = $2 LIMIT 1', [jobTitle, companyId]);
    let jobId;
    if (jobRows && jobRows.length > 0) {
      jobId = jobRows[0].id;
      console.log('Found existing job id', jobId);
    } else {
      const jr = await pool.query(
        `INSERT INTO jobs (title, company, company_id, location, description, published, created_at) VALUES ($1,$2,$3,$4,$5,true,NOW()) RETURNING id`,
        [jobTitle, 'ACME Ltd', companyId, 'Kinshasa', 'Offre seed pour test']
      );
      jobId = (jr && jr.rows && jr.rows[0]) ? jr.rows[0].id : null;
      if (!jobId) throw new Error('Could not insert or retrieve job id');
      console.log('Inserted job id', jobId);
    }

    // Create or find an applicant user
    const { rows: appRows } = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [applicantEmail]);
    let applicantId;
    if (appRows && appRows.length > 0) {
      applicantId = appRows[0].id;
      console.log('Found existing applicant id', applicantId);
    } else {
      const ar = await pool.query(
        `INSERT INTO users (full_name, email, password, user_type, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING id`,
        ['Candidate Test', applicantEmail, 'seed', 'candidate']
      );
      applicantId = (ar && ar.rows && ar.rows[0]) ? ar.rows[0].id : null;
      if (!applicantId) throw new Error('Could not insert or retrieve applicant id');
      console.log('Inserted applicant id', applicantId);
    }

    // Insert a job_application
    const { rows: existingApps } = await pool.query('SELECT id FROM job_applications WHERE job_id=$1 AND applicant_id=$2 LIMIT 1', [jobId, applicantId]);
    if (existingApps && existingApps.length > 0) {
      console.log('Application already exists, id', existingApps[0].id);
    } else {
      const ir = await pool.query(
        `INSERT INTO job_applications (job_id, applicant_id, company_id, cv_url, cover_letter_url, message, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,'pending',NOW()) RETURNING id`,
        [jobId, applicantId, companyId, 'https://example.com/cv.pdf', null, 'Candidature seed']
      );
      const insertedAppId = (ir && ir.rows && ir.rows[0]) ? ir.rows[0].id : null;
      console.log('Inserted job_application id', insertedAppId);
    }

    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

up();
