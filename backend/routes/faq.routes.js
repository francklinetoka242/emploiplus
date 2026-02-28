const express = require('express');
const router = express.Router();
const { getFAQ } = require('../controllers/faq.controller');

// GET /api/faq - retrieve all FAQ entries
// no authentication required, public endpoint
router.get('/', getFAQ);

module.exports = router;
