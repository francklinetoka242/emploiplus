const express = require('express');
const router = express.Router();
const { getServices } = require('../controllers/service.controller');

// GET /api/services - retrieve all available services
// no authentication required, public endpoint
router.get('/', getServices);

module.exports = router;
