const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/job.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// GET /api/jobs - retrieve all jobs with optional filtering/pagination
// query params: ?limit=20&offset=0
router.get('/', getJobs);

// GET /api/jobs/:id - retrieve a single job by ID
router.get('/:id', getJobById);

// POST /api/jobs - create a new job posting (protected)
// requires valid JWT token
// body: { title, description, location, salary, jobType, companyId }
router.post('/', authenticateJWT, createJob);

// PUT /api/jobs/:id - update an existing job posting (protected)
// requires valid JWT token
// body: { title?, description?, location?, salary?, jobType?, companyId? }
router.put('/:id', authenticateJWT, updateJob);

// DELETE /api/jobs/:id - delete a job posting (protected)
// requires valid JWT token
router.delete('/:id', authenticateJWT, deleteJob);

module.exports = router;
