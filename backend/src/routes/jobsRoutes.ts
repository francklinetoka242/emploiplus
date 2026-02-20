import express from 'express';
import {
  listJobs, getJob, createJob, updateJob, deleteJob, publishJob
} from '../controllers/jobs.controller.js';

const router = express.Router();

router.get('/', listJobs);
router.get('/:id', getJob);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.patch('/:id/publish', publishJob);

export default router;
