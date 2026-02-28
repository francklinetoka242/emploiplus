const express = require('express');
const router = express.Router();
const { getFormations, getFormationById, enroll } = require('../controllers/formation.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// GET /api/formations - retrieve all formations with optional filtering/pagination
// query params: ?limit=20&offset=0
router.get('/', getFormations);

// GET /api/formations/:id - retrieve a single formation by ID
router.get('/:id', getFormationById);

// POST /api/formations/:id/enroll - enroll current user in a formation (protected)
// requires valid JWT token
// formationId from URL parameter
router.post('/:id/enroll', authenticateJWT, enroll);

module.exports = router;
