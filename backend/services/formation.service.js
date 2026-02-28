const FormationModel = require('../models/formation.model');

// retrieve all formations with pagination
async function getFormations(query = {}) {
  try {
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    const formations = await FormationModel.getAllFormations(limit, offset);
    return formations;
  } catch (err) {
    console.error('getFormations service error:', err);
    throw err;
  }
}

// retrieve a single formation by ID
async function getFormationById(formationId) {
  try {
    if (!formationId) {
      throw new Error('Formation ID is required');
    }

    const formation = await FormationModel.getFormationById(formationId);
    if (!formation) {
      throw new Error('Formation not found');
    }

    return formation;
  } catch (err) {
    console.error('getFormationById service error:', err);
    throw err;
  }
}

// enroll a user in a formation
async function enroll(formationId, user, data) {
  try {
    if (!formationId || !user || !user.id) {
      throw new Error('Formation ID and authenticated user are required');
    }

    // verify formation exists
    const formation = await FormationModel.getFormationById(formationId);
    if (!formation) {
      throw new Error('Formation not found');
    }

    // check if user is already enrolled
    const alreadyEnrolled = await FormationModel.isUserEnrolled(user.id, formationId);
    if (alreadyEnrolled) {
      throw new Error('User is already enrolled in this formation');
    }

    // create enrollment record
    const enrollment = await FormationModel.enrollUserInFormation(user.id, formationId);
    return { success: true, enrollment };
  } catch (err) {
    console.error('enroll service error:', err);
    throw err;
  }
}

// get all formations a user is enrolled in
async function getUserFormations(userId, query = {}) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    const formations = await FormationModel.getUserFormations(userId, limit, offset);
    return formations;
  } catch (err) {
    console.error('getUserFormations service error:', err);
    throw err;
  }
}

module.exports = {
  getFormations,
  getFormationById,
  enroll,
  getUserFormations,
};
