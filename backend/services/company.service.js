const CompanyModel = require('../models/company.model');

// validate company payload data
function validateCompanyData(data, isUpdate = false) {
  if (isUpdate && Object.keys(data).length === 0) {
    throw new Error('No fields to update');
  }

  // validate required fields for creation
  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('Company name is required and must be a non-empty string');
    }
  }

  // validate optional fields if present
  if (data.website !== undefined && data.website !== null) {
    // basic URL validation
    const urlRegex = /^(https?:\/\/).+/;
    if (data.website && !urlRegex.test(data.website)) {
      throw new Error('Website must be a valid URL');
    }
  }

  return true;
}

// retrieve all companies with pagination
async function getCompanies(query = {}) {
  try {
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    // fetch all companies from database
    const companies = await CompanyModel.getAllCompanies(limit, offset);
    return companies;
  } catch (err) {
    console.error('getCompanies service error:', err);
    throw err;
  }
}

// retrieve a single company by ID
async function getCompanyById(companyId) {
  try {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    // fetch company from database
    const company = await CompanyModel.getCompanyById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  } catch (err) {
    console.error('getCompanyById service error:', err);
    throw err;
  }
}

// create a new company
async function createCompany(companyData) {
  try {
    // validate required fields
    validateCompanyData(companyData, false);

    const { name, description, logo, website, location } = companyData;

    // check if company with same name already exists
    const existing = await CompanyModel.getCompanyByName(name);
    if (existing) {
      throw new Error('Company with this name already exists');
    }

    // insert company into database
    const newCompany = await CompanyModel.createCompany(name, description, logo, website, location);
    return newCompany;
  } catch (err) {
    console.error('createCompany service error:', err);
    throw err;
  }
}

// update an existing company
async function updateCompany(companyId, companyData) {
  try {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    // validate update data
    validateCompanyData(companyData, true);

    // verify company exists
    const existing = await CompanyModel.getCompanyById(companyId);
    if (!existing) {
      throw new Error('Company not found');
    }

    // if updating name, check for duplicates
    if (companyData.name && companyData.name !== existing.name) {
      const duplicate = await CompanyModel.getCompanyByName(companyData.name);
      if (duplicate) {
        throw new Error('Company with this name already exists');
      }
    }

    // update company in database
    const updated = await CompanyModel.updateCompany(companyId, companyData);
    return updated;
  } catch (err) {
    console.error('updateCompany service error:', err);
    throw err;
  }
}

// delete a company
async function deleteCompany(companyId) {
  try {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    // verify company exists before deletion
    const company = await CompanyModel.getCompanyById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    // delete company from database
    const deleted = await CompanyModel.deleteCompany(companyId);
    return deleted;
  } catch (err) {
    console.error('deleteCompany service error:', err);
    throw err;
  }
}

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
