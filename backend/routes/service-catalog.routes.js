import express from 'express';
const router = express.Router();
import {
  getCatalogs,
  getCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog
} from '../controllers/service-catalog.controller.js';
import { requireRoles } from '../middleware/auth.middleware.js';

// GET /api/services/catalogs - retrieve all service catalogs
// public endpoint, returns published catalogs by default
router.get('/', getCatalogs);

// GET /api/services/catalogs/:id - retrieve a single catalog by ID
router.get('/:id', getCatalogById);

// POST /api/services/catalogs - create a new service catalog
// admin-only (super_admin)
router.post('/', requireRoles('super_admin'), createCatalog);

// PUT /api/services/catalogs/:id - update a service catalog
// admin-only (super_admin)
router.put('/:id', requireRoles('super_admin'), updateCatalog);

// DELETE /api/services/catalogs/:id - delete a service catalog
// admin-only (super_admin)
router.delete('/:id', requireRoles('super_admin'), deleteCatalog);

export default router;
