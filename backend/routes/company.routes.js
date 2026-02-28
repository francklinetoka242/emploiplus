const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyById } = require('../controllers/company.controller');

// GET /api/companies - retrieve all companies
// no authentication required, public endpoint
// query params: ?limit=20&offset=0
router.get('/', getCompanies);

// GET /api/companies/:id - retrieve a single company by ID
router.get('/:id', getCompanyById);

module.exports = router;
