/**
 * Service Module Routes
 * Isolated routes for service catalogs and services management
 * Protected with Global Error Handler
 */

import express from 'express';
import { adminAuth, isSuperAdmin, authenticateToken } from '../middleware/auth.js';
import {
  getAllCatalogs,
  getCatalog,
  createCatalog,
  updateCatalog,
  deleteCatalog
} from '../controllers/services-catalogs.controller.js';
import {
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService
} from '../controllers/services.controller.js';

const router = express.Router();

/**
 * CATALOG ROUTES (Admin Management)
 */

// Get all catalogs
router.get('/catalogs', getAllCatalogs);

// Get single catalog
router.get('/catalogs/:id', getCatalog);

// Create catalog (Admin only)
router.post('/catalogs', authenticateToken, adminAuth, createCatalog);

// Update catalog (Admin only)
router.put('/catalogs/:id', authenticateToken, adminAuth, updateCatalog);

// Delete catalog (Super Admin only)
router.delete('/catalogs/:id', authenticateToken, isSuperAdmin, deleteCatalog);

/**
 * SERVICES ROUTES (Admin Management)
 */

// Get all services (with optional filters)
router.get('/', getAllServices);

// Get single service
router.get('/:id', getService);

// Create service (Admin only)
router.post('/', authenticateToken, adminAuth, createService);

// Update service (Admin only)
router.put('/:id', authenticateToken, adminAuth, updateService);

// Delete service (Super Admin only)
router.delete('/:id', authenticateToken, isSuperAdmin, deleteService);

export default router;
