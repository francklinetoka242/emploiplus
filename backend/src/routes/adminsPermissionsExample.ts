import express from 'express';
import checkPermission from '../middleware/checkPermission.js';

const router = express.Router();

// Example protected route: list users (only admins with perm_users)
router.get('/users', checkPermission('perm_users'), async (req, res) => {
  // Implement actual list logic here (DB query)
  // Placeholder: return empty list
  res.json({ users: [] });
});

// Example content admin route: manage jobs list
router.get('/jobs', checkPermission('perm_jobs'), async (req, res) => {
  res.json({ jobs: [] });
});

export default router;
