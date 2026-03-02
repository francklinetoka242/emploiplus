import express from 'express';
const router = express.Router();
import {
  getServices,
  getServiceById,
  searchServices,
  createService,
  updateService,
  deleteService
} from '../controllers/service.controller.js';
import { requireRoles } from '../middleware/auth.middleware.js';

// GET /api/services - retrieve all available services
// no authentication required, public endpoint
router.get('/', getServices);

// GET /api/services/search - search services by name or description
// public endpoint
router.get('/search', searchServices);

// GET /api/services/:id - retrieve a single service by ID
// public endpoint
router.get('/:id', getServiceById);

// POST /api/services - create a new service
// admin-only (super_admin)
router.post('/', requireRoles('super_admin'), createService);

// PUT /api/services/:id - update an existing service
// admin-only (super_admin)
router.put('/:id', requireRoles('super_admin'), updateService);

// DELETE /api/services/:id - delete a service
// admin-only (super_admin)
router.delete('/:id', requireRoles('super_admin'), deleteService);

export default router;
