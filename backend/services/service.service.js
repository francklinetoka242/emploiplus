import ServiceModel from '../models/service.model.js';

// retrieve all services with pagination
async function getServices(query = {}) {
  try {
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    // fetch all services from database
    const services = await ServiceModel.getAllServices(limit, offset);
    return services;
  } catch (err) {
    console.error('getServices service error:', err);
    throw err;
  }
}

// retrieve a single service by ID
async function getServiceById(serviceId) {
  try {
    if (!serviceId) {
      throw new Error('Service ID is required');
    }

    // fetch service from database
    const service = await ServiceModel.getServiceById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    return service;
  } catch (err) {
    console.error('getServiceById service error:', err);
    throw err;
  }
}

// search services by name or description
async function searchServices(searchTerm, query = {}) {
  try {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }

    const limit = parseInt(query.limit) || 20;

    // search services using ILIKE (case-insensitive)
    const results = await ServiceModel.searchServices(searchTerm, limit);
    return results;
  } catch (err) {
    console.error('searchServices service error:', err);
    throw err;
  }
}

// create a new service
async function createService(serviceData) {
  try {
    const { catalog_id, name, description } = serviceData;

    if (!catalog_id) {
      throw new Error('Catalog ID is required');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Service name is required');
    }

    if (!description || typeof description !== 'string') {
      throw new Error('Service description is required');
    }

    // create service in database, passing the entire data object
    const service = await ServiceModel.createService(serviceData);
    return service;
  } catch (err) {
    console.error('createService service error:', err);
    throw err;
  }
}

// update an existing service
async function updateService(serviceId, serviceData) {
  try {
    if (!serviceId) {
      throw new Error('Service ID is required');
    }

    if (Object.keys(serviceData).length === 0) {
      throw new Error('No fields to update');
    }

    // verify service exists
    const existing = await ServiceModel.getServiceById(serviceId);
    if (!existing) {
      throw new Error('Service not found');
    }

    // update service in database
    const updated = await ServiceModel.updateService(serviceId, serviceData);
    return updated;
  } catch (err) {
    console.error('updateService service error:', err);
    throw err;
  }
}

// delete a service
async function deleteService(serviceId) {
  try {
    if (!serviceId) {
      throw new Error('Service ID is required');
    }

    // verify service exists before deletion
    const service = await ServiceModel.getServiceById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // delete service from database
    const deleted = await ServiceModel.deleteService(serviceId);
    return deleted;
  } catch (err) {
    console.error('deleteService service error:', err);
    throw err;
  }
}

export default {
  getServices,
  getServiceById,
  searchServices,
  createService,
  updateService,
  deleteService,
};
