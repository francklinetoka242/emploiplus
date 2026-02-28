const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboard.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// GET /api/dashboard/stats - retrieve dashboard statistics (protected)
// requires valid JWT token (admin-only access recommended)
// returns system health, user counts, revenue, etc.
router.get('/stats', authenticateJWT, getStats);

module.exports = router;
