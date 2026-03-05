import pool from '../config/db.js';

// retrieve all jobs with company information via JOIN
// include all relevant columns (published status, sector, deadlines...) so
// the admin interface can display and filter them.
async function getAllJobs(limit = 20, offset = 0) {
  try {
    const query = `
      SELECT 
        j.id, j.title, j.description, j.location, j.salary, j.job_type,
        j.sector, j.type, j.published, j.published_at, j.deadline_date,
        j.experience_level, j.is_closed, j.company_id, j.requirements,
        c.name AS company, c.logo,
        j.created_at, j.updated_at
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ORDER BY j.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (err) {
    console.error('getAllJobs query error:', err);
    throw err;
  }
}

// retrieve a single job by ID with company details
async function getJobById(jobId) {
  try {
    const query = `
      SELECT 
        j.id, j.title, j.description, j.location, j.salary, j.job_type,
        j.sector, j.type, j.published, j.published_at, j.deadline_date,
        j.experience_level, j.is_closed, j.company_id, j.requirements,
        c.name AS company, c.logo, c.website,
        j.created_at, j.updated_at
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1
    `;
    const result = await pool.query(query, [jobId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getJobById query error:', err);
    throw err;
  }
}

// retrieve all jobs for a specific company
async function getJobsByCompanyId(companyId, limit = 10, offset = 0) {
  try {
    const query = `
      SELECT 
        j.id, j.title, j.description, j.location, j.salary, j.job_type, j.requirements,
        j.company_id, c.name AS company,
        j.created_at, j.updated_at
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.company_id = $1
      ORDER BY j.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [companyId, limit, offset]);
    return result.rows;
  } catch (err) {
    console.error('getJobsByCompanyId query error:', err);
    throw err;
  }
}


// create a new job posting
// Accepts an object of fields so that we can persist optional attributes
// (published, sector, type, salary_min, salary_max, company, etc.) without
// having to update the signature every time.
async function createJob(jobData) {
  try {
    const fields = [];
    const placeholders = [];
    const values = [];

    Object.entries(jobData).forEach(([key, value], idx) => {
      // ignore undefined values
      if (value !== undefined) {
        fields.push(key);
        placeholders.push(`$${idx + 1}`);
        values.push(value);
      }
    });

    // always set timestamps
    fields.push('created_at', 'updated_at');
    placeholders.push('NOW()', 'NOW()');

    const query = `
      INSERT INTO jobs (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error('createJob query error:', err);
    throw err;
  }
}

// update a job by ID
async function updateJob(jobId, updates) {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(jobId);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // add updated_at to the SET clause
    fields.push('updated_at');
    values.splice(values.length - 1, 0, new Date());

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE jobs
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING id, title, description, location, salary, job_type, company_id, requirements, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updateJob query error:', err);
    throw err;
  }
}

// delete a job by ID
async function deleteJob(jobId) {
  try {
    const query = 'DELETE FROM jobs WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [jobId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteJob query error:', err);
    throw err;
  }
}

export default {
  getAllJobs,
  getJobById,
  getJobsByCompanyId,
  createJob,
  updateJob,
  deleteJob,
};
