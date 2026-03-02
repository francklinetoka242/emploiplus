import express from 'express';
const router = express.Router();
import { getPublications, getPublicationById, createPublication, deletePublication } from '../controllers/publication.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// GET /api/publications - retrieve all publications with optional filtering/pagination
// query params: ?limit=20&offset=0
router.get('/', getPublications);

// GET /api/publications/:id - retrieve a single publication by ID
router.get('/:id', getPublicationById);

// POST /api/publications - create a new publication (protected)
// requires admin token (only content admins or super admins)
// body: { content, image_url?, visibility?, category?, achievement? }
router.post('/', requireAdmin, requireRoles('super_admin','content_admin'), createPublication);

// DELETE /api/publications/:id - delete a publication (protected)
// requires admin token (only content admins or super admins)
router.delete('/:id', requireAdmin, requireRoles('super_admin','content_admin'), deletePublication);

export default router;
