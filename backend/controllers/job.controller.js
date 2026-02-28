const jobService = require('../services/job.service');

async function getJobs(req, res) {
  try {
    const jobs = await jobService.getJobs(req.query);
    res.json({ data: jobs });
  } catch (err) {
    console.error('getJobs error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function getJobById(req, res) {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json({ data: job });
  } catch (err) {
    console.error('getJobById error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function createJob(req, res) {
  try {
    const newJob = await jobService.createJob(req.body);
    res.status(201).json({ data: newJob });
  } catch (err) {
    console.error('createJob error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function updateJob(req, res) {
  try {
    const updated = await jobService.updateJob(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    console.error('updateJob error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function deleteJob(req, res) {
  try {
    await jobService.deleteJob(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('deleteJob error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
