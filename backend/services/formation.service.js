import FormationModel from '../models/formation.model.js';

// helper to validate formation payloads
function validateFormationData(data, isUpdate = false) {
  if (isUpdate && Object.keys(data).length === 0) {
    throw new Error('No fields to update');
  }

  if (!isUpdate) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    // other required fields can be added here if needed
  }

  if (data.price !== undefined && typeof data.price !== 'number' && typeof data.price !== 'string') {
    // allow string to be parsed later in model
    throw new Error('Price must be a number');
  }

  return true;
}

// retrieve all formations with pagination and optional published filter
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

    // default behaviour: only return published formations unless explicit flag passed
    let publishedFilter;
    if (query.published !== undefined) {
      if (query.published === 'all') {
        publishedFilter = undefined; // no filter for admin
      } else {
        publishedFilter = query.published === true || String(query.published).toLowerCase() === 'true';
      }
    } else {
      // public route, hide unpublished
      publishedFilter = true;
    }

    // Gather additional filters
    let sortBy = query.sortBy || 'created_at';
    let sortOrder = query.sortOrder || 'DESC';

    if (query.sort) {
      if (query.sort === 'recent') {
        sortBy = 'created_at';
        sortOrder = 'DESC';
      } else if (query.sort === 'az') {
        sortBy = 'title';
        sortOrder = 'ASC';
      } else if (query.sort === 'price') {
        sortBy = 'price';
        sortOrder = 'ASC';
      }
    }

    const filters = {
      search: query.q || query.search || '',
      category: query.category || '',
      level: query.level || '',
      sortBy,
      sortOrder,
    };

    const formations = await FormationModel.getAllFormations(limit, offset, publishedFilter, filters);
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

// create a new formation (admin-side)
async function createFormation(data) {
  try {
    validateFormationData(data, false);

    // ensure boolean conversion for published if present
    if (data.published !== undefined) {
      data.published = !!data.published;
    } else {
      // default to unpublished for admin-created formations
      data.published = false;
    }

    const newFormation = await FormationModel.createFormation(data);
    return newFormation;
  } catch (err) {
    console.error('createFormation service error:', err);
    throw err;
  }
}

// update an existing formation
async function updateFormation(formationId, data) {
  try {
    if (!formationId) {
      throw new Error('Formation ID is required');
    }
    validateFormationData(data, true);

    // verify existence
    const existing = await FormationModel.getFormationById(formationId);
    if (!existing) {
      throw new Error('Formation not found');
    }

    // convert published flag if provided
    if (data.published !== undefined) {
      data.published = !!data.published;
    }

    const updated = await FormationModel.updateFormation(formationId, data);
    return updated;
  } catch (err) {
    console.error('updateFormation service error:', err);
    throw err;
  }
}

// delete a formation
async function deleteFormation(formationId) {
  try {
    if (!formationId) {
      throw new Error('Formation ID is required');
    }

    const existing = await FormationModel.getFormationById(formationId);
    if (!existing) {
      throw new Error('Formation not found');
    }

    const deleted = await FormationModel.deleteFormation(formationId);
    return deleted;
  } catch (err) {
    console.error('deleteFormation service error:', err);
    throw err;
  }
}

export default {
  getFormations,
  getFormationById,
  enroll,
  getUserFormations,
  createFormation,
  updateFormation,
  deleteFormation,
};
