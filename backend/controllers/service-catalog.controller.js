import serviceCatalogService from '../services/service-catalog.service.js';

async function getCatalogs(req, res) {
  try {
    const list = await serviceCatalogService.getCatalogs(req.query);
    res.json({ data: list });
  } catch (err) {
    console.error('getCatalogs error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function getCatalogById(req, res) {
  try {
    const item = await serviceCatalogService.getCatalogById(req.params.id);
    res.json({ data: item });
  } catch (err) {
    console.error('getCatalogById error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// admin-only operations
async function createCatalog(req, res) {
  try {
    const newCatalog = await serviceCatalogService.createCatalog(req.body);
    res.status(201).json({ data: newCatalog });
  } catch (err) {
    console.error('createCatalog error', err);
    const status = /required|must/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function updateCatalog(req, res) {
  try {
    const updated = await serviceCatalogService.updateCatalog(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    console.error('updateCatalog error', err);
    const status = /required|must|not found/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function deleteCatalog(req, res) {
  try {
    await serviceCatalogService.deleteCatalog(req.params.id);
    res.json({ message: 'Catalog deleted' });
  } catch (err) {
    console.error('deleteCatalog error', err);
    const status = /not found/i.test(err.message) ? 404 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

export {
  getCatalogs,
  getCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog
};
