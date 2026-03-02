import serviceService from '../services/service.service.js';

async function getServices(req, res) {
  try {
    const list = await serviceService.getServices(req.query);
    res.json({ data: list });
  } catch (err) {
    console.error('getServices error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function getServiceById(req, res) {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    res.json({ data: service });
  } catch (err) {
    console.error('getServiceById error', err);
    const status = /not found/i.test(err.message) ? 404 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function searchServices(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      throw new Error('Search term is required');
    }
    const results = await serviceService.searchServices(q, req.query);
    res.json({ data: results });
  } catch (err) {
    console.error('searchServices error', err);
    res.status(400).json({ message: err.message || 'Internal server error' });
  }
}

// admin-only operations
async function createService(req, res) {
  try {
    const newService = await serviceService.createService(req.body);
    res.status(201).json({ data: newService });
  } catch (err) {
    console.error('createService error', err);
    const status = /required|must/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function updateService(req, res) {
  try {
    const updated = await serviceService.updateService(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    console.error('updateService error', err);
    const status = /required|must|not found/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function deleteService(req, res) {
  try {
    await serviceService.deleteService(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('deleteService error', err);
    const status = /not found/i.test(err.message) ? 404 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

export {
  getServices,
  getServiceById,
  searchServices,
  createService,
  updateService,
  deleteService
};
