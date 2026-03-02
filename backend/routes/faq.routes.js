import express from 'express';
const router = express.Router();
import { getFAQ, createFAQEntry, updateFAQEntry, deleteFAQEntry } from '../controllers/faq.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// GET /api/faq - retrieve all FAQ entries
// no authentication required, public endpoint
router.get('/', getFAQ);

// administrative FAQ management (super_admin or perm_manage_faq)
const adminProtection = [requireAdmin, requireRoles('super_admin','perm_manage_faq')];
router.post('/', ...adminProtection, createFAQEntry);
router.put('/:id', ...adminProtection, updateFAQEntry);
router.delete('/:id', ...adminProtection, deleteFAQEntry);

export default router;
