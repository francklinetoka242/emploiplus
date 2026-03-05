import ServiceCatalogModel from '../models/service-catalog.model.js';

// validate catalog payload data
function validateCatalogData(data, isUpdate = false) {
  if (isUpdate && Object.keys(data).length === 0) {
    throw new Error('No fields to update');
  }

  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('Catalog name is required');
    }
  }

  return true;
}

// retrieve all service catalogs with pagination
async function getCatalogs(query = {}) {
  try {
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    // default: only return published catalogs unless explicit flag passed
    let publishedFilter = query.published !== undefined 
      ? (query.published === true || String(query.published).toLowerCase() === 'true')
      : true;

    const catalogs = await ServiceCatalogModel.getAllCatalogs(limit, offset, publishedFilter);
    return catalogs;
  } catch (err) {
    console.error('getCatalogs service error:', err);
    throw err;
  }
}

// retrieve a single catalog by ID
async function getCatalogById(catalogId) {
  try {
    if (!catalogId) {
      throw new Error('Catalog ID is required');
    }

    const catalog = await ServiceCatalogModel.getCatalogById(catalogId);
    if (!catalog) {
      throw new Error('Catalog not found');
    }

    return catalog;
  } catch (err) {
    console.error('getCatalogById service error:', err);
    throw err;
  }
}

// create a new service catalog (admin-side)
async function createCatalog(data) {
  try {
    validateCatalogData(data, false);

    const newCatalog = await ServiceCatalogModel.createCatalog(data);
    return newCatalog;
  } catch (err) {
    console.error('createCatalog service error:', err);
    throw err;
  }
}

// update an existing service catalog
async function updateCatalog(catalogId, data) {
  try {
    if (!catalogId) {
      throw new Error('Catalog ID is required');
    }
    validateCatalogData(data, true);

    // verify existence
    const existing = await ServiceCatalogModel.getCatalogById(catalogId);
    if (!existing) {
      throw new Error('Catalog not found');
    }

    const updated = await ServiceCatalogModel.updateCatalog(catalogId, data);
    return updated;
  } catch (err) {
    console.error('updateCatalog service error:', err);
    throw err;
  }
}

// delete a service catalog
async function deleteCatalog(catalogId) {
  try {
    if (!catalogId) {
      throw new Error('Catalog ID is required');
    }

    const existing = await ServiceCatalogModel.getCatalogById(catalogId);
    if (!existing) {
      throw new Error('Catalog not found');
    }

    const deleted = await ServiceCatalogModel.deleteCatalog(catalogId);
    return deleted;
  } catch (err) {
    console.error('deleteCatalog service error:', err);
    throw err;
  }
}

export default {
  getCatalogs,
  getCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog
};
