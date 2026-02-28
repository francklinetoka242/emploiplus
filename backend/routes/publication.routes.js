const express = require('express');
const router = express.Router();
const { getPublications, getPublicationById, createPublication, deletePublication } = require('../controllers/publication.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// GET /api/publications - retrieve all publications with optional filtering/pagination
// query params: ?limit=20&offset=0
router.get('/', getPublications);

// GET /api/publications/:id - retrieve a single publication by ID
router.get('/:id', getPublicationById);

// POST /api/publications - create a new publication (protected)
// requires valid JWT token
// body: { content, image_url?, visibility?, category?, achievement? }
router.post('/', authenticateJWT, createPublication);

// DELETE /api/publications/:id - delete a publication (protected)
// requires valid JWT token
router.delete('/:id', authenticateJWT, deletePublication);

module.exports = router;
