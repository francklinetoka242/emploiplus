import express from 'express';
const router = express.Router();
import { getCompanies, getCompanyById } from '../controllers/company.controller.js';

// GET /api/companies - retrieve all companies
// no authentication required, public endpoint
// query params: ?limit=20&offset=0
router.get('/', getCompanies);

// GET /api/companies/:id - retrieve a single company by ID
router.get('/:id', getCompanyById);

export default router;
