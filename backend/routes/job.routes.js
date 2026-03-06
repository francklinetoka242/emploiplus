import express from 'express';
const router = express.Router();
import { getJobs, getJobById, createJob, updateJob, deleteJob, publishJob } from '../controllers/job.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// GET /api/jobs - retrieve all jobs with optional filtering/pagination
// query params: ?limit=20&offset=0
// this route is intentionally public; when mounted under "/api/admin/jobs" it
// will be wrapped by the `requireAdmin` middleware in server.js.
router.get('/', getJobs);

// GET /api/jobs/:id - retrieve a single job by ID
router.get('/:id', getJobById);

// POST /api/jobs - create a new job posting (protected)
// requires admin token (only admins can create jobs)
// body: { title, description, location, salary, jobType, companyId, ... }
// only super_admin or admin_offres may create/update/delete jobs
router.post('/', requireRoles('super_admin','admin_offres'), createJob);

// PUT /api/jobs/:id - update an existing job posting (protected)
// requires admin token (only admins with appropriate role)
router.put('/:id', requireRoles('super_admin','admin_offres'), updateJob);

// PATCH /api/jobs/:id - update an existing job posting (protected)
// requires admin token (only admins with appropriate role)
router.patch('/:id', requireRoles('super_admin','admin_offres'), updateJob);

// PATCH /api/jobs/:id/publish - change publication status
router.patch('/:id/publish', requireRoles('super_admin','admin_offres'), publishJob);

// DELETE /api/jobs/:id - delete a job posting (protected)
// requires admin token (only admins with appropriate role)
router.delete('/:id', requireRoles('super_admin','admin_offres'), deleteJob);

export default router;
