import JobModel from '../models/job.model.js';
import CompanyModel from '../models/company.model.js';

// validate job payload data
function validateJobData(data, isUpdate = false) {
  if (isUpdate && Object.keys(data).length === 0) {
    throw new Error('No fields to update');
  }

  // if not an update or field is present, validate required fields for creation
  if (!isUpdate) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Job title is required and must be a non-empty string');
    }
    if (!data.description || typeof data.description !== 'string') {
      throw new Error('Job description is required');
    }
    if (!data.location || typeof data.location !== 'string') {
      throw new Error('Job location is required');
    }
    // company can be passed either as numeric ID or name string
    if (!data.company_id && !data.company) {
      throw new Error('Company ID or name is required');
    }
  }

  // validation for optional numeric fields if present
  if (data.salary !== undefined && typeof data.salary !== 'number') {
    throw new Error('Salary must be a number');
  }

  return true;
}

// retrieve all jobs with optional filtering and pagination
// query may include: limit, offset, published (boolean/string)
// filters such as search/company/sector are intentionally ignored for now;
// client-side filtering is handled in the frontend.
async function getJobs(query = {}) {
  try {
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    // fetch all jobs with company info via JOIN
    let jobs = await JobModel.getAllJobs(limit, offset);

    // filter by publication status if requested (default for public routes)
    if (query.published !== undefined) {
      const want = query.published === true || String(query.published).toLowerCase() === 'true';
      jobs = jobs.filter((j) => !!j.published === want);
    }

    return jobs;
  } catch (err) {
    console.error('getJobs service error:', err);
    throw err;
  }
}

// retrieve a single job by ID
async function getJobById(jobId) {
  try {
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    // fetch job with company details
    const job = await JobModel.getJobById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  } catch (err) {
    console.error('getJobById service error:', err);
    throw err;
  }
}

// create a new job posting
async function createJob(jobData) {
  try {
    // validate the minimal required fields
    validateJobData(jobData, false);

    // if company name provided, translate to ID (same logic as before)
    let companyId = jobData.company_id;
    if (!companyId && jobData.company) {
      const name = String(jobData.company).trim();
      const existing = await CompanyModel.getCompanyByName(name);
      if (existing) {
        companyId = existing.id;
      } else {
        const created = await CompanyModel.createCompany(name, null, null, null, null);
        companyId = created.id;
      }
    }

    // prepare payload for model (spread all fields, override company_id)
    const payload = { ...jobData, company_id: companyId };
    if (payload.published && !payload.published_at) {
      payload.published_at = new Date();
    }

    const newJob = await JobModel.createJob(payload);
    return newJob;
  } catch (err) {
    console.error('createJob service error:', err);
    throw err;
  }
}

// update an existing job posting
async function updateJob(jobId, jobData) {
  try {
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    // validate update data
    validateJobData(jobData, true);

    // if company name provided, translate to ID
    if (!jobData.company_id && jobData.company) {
      const name = String(jobData.company).trim();
      const existingComp = await CompanyModel.getCompanyByName(name);
      if (existingComp) {
        jobData.company_id = existingComp.id;
      } else {
        const created = await CompanyModel.createCompany(name, null, null, null, null);
        jobData.company_id = created.id;
      }
    }

    // verify job exists
    const existing = await JobModel.getJobById(jobId);
    if (!existing) {
      throw new Error('Job not found');
    }

    // update job in database (only provided fields)
    const updated = await JobModel.updateJob(jobId, jobData);
    return updated;
  } catch (err) {
    console.error('updateJob service error:', err);
    throw err;
  }
}

// delete a job posting
async function deleteJob(jobId) {
  try {
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    // verify job exists before deletion
    const job = await JobModel.getJobById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // delete job from database
    const deleted = await JobModel.deleteJob(jobId);
    return deleted;
  } catch (err) {
    console.error('deleteJob service error:', err);
    throw err;
  }
}

// retrieve jobs for a specific company
async function getJobsByCompany(companyId, query = {}) {
  try {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const limit = parseInt(query.limit) || 10;
    const offset = parseInt(query.offset) || 0;

    // fetch jobs filtered by company
    const jobs = await JobModel.getJobsByCompanyId(companyId, limit, offset);
    return jobs;
  } catch (err) {
    console.error('getJobsByCompany service error:', err);
    throw err;
  }
}

export default {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsByCompany,
};
