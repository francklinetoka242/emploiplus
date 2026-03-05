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
// query may include:
//   - limit (1-100, default 20): number of jobs per page
//   - offset (default 0) OR page (default 1): for pagination
//   - published (boolean/string): filter by publication status
//   - company_id: filter by company ID
//   - q: search query (searches title, description, sector, type)
//   - location: filter by location
//   - country: filter by country (extracted from location)
//   - sector: filter by sector
//   - type: filter by job type
//   - company: filter by company name
//   - sortBy, sortOrder: sorting options (default: created_at DESC)
async function getJobs(query = {}) {
  try {
    // log incoming query for debugging pagination issues
    console.log('getJobs query params:', query);

    // determine limit (default 10 per new requirement)
    let limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }
    if (limit > 100) {
      // clamp to prevent database overload
      limit = 100;
    }
    
    // Support both offset and page parameters
    // If page is provided, calculate offset from it; otherwise use offset directly
    let offset;
    let pageNum = 1;
    if (query.page !== undefined && query.page !== null && query.page !== '') {
      pageNum = parseInt(query.page);
      if (isNaN(pageNum) || pageNum < 1) {
        pageNum = 1;
        offset = 0;
      } else {
        offset = (pageNum - 1) * limit;
      }
    } else {
      offset = parseInt(query.offset) || 0;
      pageNum = Math.floor(offset / limit) + 1;
    }

    // validation errors have a status property so controller can return 400
    const error = new Error();
    if (limit < 1 || limit > 100) {
      error.message = 'Limit must be between 1 and 100';
      error.status = 400;
      throw error;
    }
    if (offset < 0) {
      // negative offset makes no sense, reset to zero
      offset = 0;
      pageNum = 1;
    }

    // Fetch ALL jobs first (unfiltered, no limit/offset) to apply filters correctly
    // This ensures pagination info is accurate AFTER filtering
    let jobs = await JobModel.getAllJobs(1000, 0); // Fetch up to 1000 jobs, unfiltered

    // filter by publication status if requested (default for public routes)
    if (query.published !== undefined) {
      const want = query.published === true || String(query.published).toLowerCase() === 'true';
      jobs = jobs.filter((j) => !!j.published === want);
    }

    // filter by company_id if provided (for Company page)
    if (query.company_id) {
      const companyId = parseInt(query.company_id);
      if (isNaN(companyId)) {
        error.message = 'Invalid company_id';
        error.status = 400;
        throw error;
      }
      jobs = jobs.filter((j) => j.company_id === companyId);
    }

    // filter by company name if provided
    if (query.company && String(query.company).trim().length > 0) {
      const companyFilter = String(query.company).trim().toLowerCase();
      jobs = jobs.filter((j) => 
        j.company && String(j.company).toLowerCase().includes(companyFilter)
      );
    }

    // filter by search query (q parameter - searches title, description, sector, type)
    if (query.q && String(query.q).trim().length > 0) {
      const searchTerm = String(query.q).trim().toLowerCase();
      jobs = jobs.filter((j) => {
        const title = String(j.title || '').toLowerCase();
        const description = String(j.description || '').toLowerCase();
        const sector = String(j.sector || '').toLowerCase();
        const jobType = String(j.type || j.job_type || '').toLowerCase();
        return title.includes(searchTerm) || 
               description.includes(searchTerm) || 
               sector.includes(searchTerm) || 
               jobType.includes(searchTerm);
      });
    }

    // filter by location if provided
    if (query.location && String(query.location).trim().length > 0) {
      const locationFilter = String(query.location).trim().toLowerCase();
      jobs = jobs.filter((j) => 
        j.location && String(j.location).toLowerCase().includes(locationFilter)
      );
    }

    // filter by country if provided (country is part of location, last part after comma)
    if (query.country && String(query.country).trim().length > 0) {
      const countryFilter = String(query.country).trim().toLowerCase();
      jobs = jobs.filter((j) => {
        if (!j.location) return false;
        const locationParts = String(j.location).split(',').map(p => p.trim());
        const locationCountry = locationParts.length > 0 ? locationParts[locationParts.length - 1].toLowerCase() : '';
        return locationCountry.includes(countryFilter);
      });
    }

    // filter by sector if provided
    if (query.sector && String(query.sector).trim().length > 0) {
      const sectorFilter = String(query.sector).trim().toLowerCase();
      jobs = jobs.filter((j) => 
        j.sector && String(j.sector).toLowerCase().includes(sectorFilter)
      );
    }

    // filter by job type if provided
    if (query.type && String(query.type).trim().length > 0) {
      const typeFilter = String(query.type).trim().toLowerCase();
      jobs = jobs.filter((j) => {
        const jobType = String(j.type || j.job_type || '').toLowerCase();
        return jobType.includes(typeFilter);
      });
    }

    // Apply sorting (default: created_at DESC for most recent first)
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'DESC';
    jobs.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Handle date fields
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      // Handle numeric fields
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'ASC' ? aVal - bVal : bVal - aVal;
      }
      
      // Handle string fields
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
      if (sortOrder === 'ASC') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

    // Calculate pagination AFTER filtering and sorting
    const totalFiltered = jobs.length;
    const paginatedJobs = jobs.slice(offset, offset + limit);
    const pages = Math.ceil(totalFiltered / limit);
    
    return {
      jobs: paginatedJobs,
      pagination: {
        total: totalFiltered,
        pages,
        page: pageNum,
        hasNextPage: pageNum < pages,
        hasPreviousPage: pageNum > 1,
      },
    };
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
