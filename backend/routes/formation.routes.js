import express from 'express';
const router = express.Router();
import { getFormations, getFormationById, enroll, createFormation, updateFormation, deleteFormation, publishFormation } from '../controllers/formation.controller.js';
import { requireUser, requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// GET /api/formations - retrieve all formations with optional filtering/pagination
// query params: ?limit=20&offset=0&published=true|false
router.get('/', getFormations);

// GET /api/formations/:id - retrieve a single formation by ID
router.get('/:id', getFormationById);

// POST /api/formations/:id/enroll - enroll current user in a formation (protected)
// requires valid user token (candidate/company)
router.post('/:id/enroll', requireUser, enroll);

// the following routes are meant for administrators; they will also be
// mounted under `/api/admin/formations` with extra middleware in server.js.
// we still protect them here with role checks just in case the router is
// accidentally used directly in a public context.

// create new formation
router.post('/', requireRoles('super_admin'), createFormation);

// update formation
router.put('/:id', requireRoles('super_admin'), updateFormation);

// delete formation
router.delete('/:id', requireRoles('super_admin'), deleteFormation);

// publish/unpublish
router.patch('/:id/publish', requireRoles('super_admin'), publishFormation);

export default router;
