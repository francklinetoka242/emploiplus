import express from 'express';
const router = express.Router();
import { getFAQ } from '../controllers/faq.controller.js';

// GET /api/faq - retrieve all FAQ entries
// no authentication required, public endpoint
router.get('/', getFAQ);

export default router;
