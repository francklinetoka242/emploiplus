import jobApplicationModel from '../models/jobApplication.model.js';

async function recordApplication(data) {
  return jobApplicationModel.createApplication(data);
}

async function checkUserApplied(jobId, userId) {
  if (!userId) return false;
  return jobApplicationModel.hasApplied(jobId, userId);
}

async function fetchAll() {
  return jobApplicationModel.listApplications();
}

async function fetchById(id) {
  return jobApplicationModel.getApplicationById(id);
}

async function changeStatus(id, status) {
  return jobApplicationModel.updateStatus(id, status);
}

export default {
  recordApplication,
  checkUserApplied,
  fetchAll,
  fetchById,
  changeStatus,
};
