const JobModel = require('../models/job.model');

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
    if (!data.company_id) {
      throw new Error('Company ID is required');
    }
  }

  // validation for optional numeric fields if present
  if (data.salary !== undefined && typeof data.salary !== 'number') {
    throw new Error('Salary must be a number');
  }

  return true;
}

// retrieve all jobs with optional filtering and pagination
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
    const jobs = await JobModel.getAllJobs(limit, offset);
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
    // validate all required fields before insertion
    validateJobData(jobData, false);

    const { title, description, location, salary, job_type, company_id } = jobData;

    // insert job into database
    const newJob = await JobModel.createJob(title, description, location, salary, job_type, company_id);
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

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsByCompany,
};
