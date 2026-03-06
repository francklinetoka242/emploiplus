import express from 'express';
const router = express.Router();
import {
  createJobApplication,
  checkApplied,
  listApplications,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/jobApplication.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// public endpoints
router.post('/', createJobApplication);
router.get('/check/:jobId', checkApplied);

// admin protected
router.get('/', requireAdmin, requireRoles('super_admin','admin_offres'), listApplications);
router.get('/:id', requireAdmin, requireRoles('super_admin','admin_offres'), getApplicationById);
router.patch('/:id', requireAdmin, requireRoles('super_admin','admin_offres'), updateApplicationStatus);

export default router;
