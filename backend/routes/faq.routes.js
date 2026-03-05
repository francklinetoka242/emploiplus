import express from 'express';
const router = express.Router();
import { getFAQ, getFAQByIdHandler, createFAQEntry, updateFAQEntry, deleteFAQEntry, getFAQStats, reorderFAQItems } from '../controllers/faq.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// GET /api/faq - retrieve all FAQ entries
// no authentication required, public endpoint
router.get('/', getFAQ);

// administrative FAQ management (super_admin or perm_manage_faq)
const adminProtection = [requireAdmin, requireRoles('super_admin','perm_manage_faq')];

// IMPORTANT: These routes must come BEFORE the /:id route so they match first
// GET /api/admin/faq/stats - get FAQ statistics
router.get('/stats', ...adminProtection, getFAQStats);

// POST /api/admin/faq/reorder - reorder FAQ items
router.post('/reorder', ...adminProtection, reorderFAQItems);

// GET /api/faq/:id - retrieve a single FAQ entry
// no authentication required, public endpoint
router.get('/:id', getFAQByIdHandler);

// POST /api/faq - create new FAQ (admin only)
router.post('/', ...adminProtection, createFAQEntry);

// PUT /api/faq/:id - update FAQ (admin only)
router.put('/:id', ...adminProtection, updateFAQEntry);

// DELETE /api/faq/:id - delete FAQ (admin only)
router.delete('/:id', ...adminProtection, deleteFAQEntry);

export default router;
