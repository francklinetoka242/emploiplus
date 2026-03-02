import formationService from '../services/formation.service.js';

async function getFormations(req, res) {
  try {
    const list = await formationService.getFormations(req.query);
    res.json({ data: list });
  } catch (err) {
    console.error('getFormations error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function getFormationById(req, res) {
  try {
    const item = await formationService.getFormationById(req.params.id);
    res.json({ data: item });
  } catch (err) {
    console.error('getFormationById error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function enroll(req, res) {
  try {
    const result = await formationService.enroll(req.params.id, req.user, req.body);
    res.json({ data: result });
  } catch (err) {
    console.error('enroll error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// admin-only operations
async function createFormation(req, res) {
  try {
    const newFormation = await formationService.createFormation(req.body);
    res.status(201).json({ data: newFormation });
  } catch (err) {
    console.error('createFormation error', err);
    const status = /required|must/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function updateFormation(req, res) {
  try {
    const updated = await formationService.updateFormation(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    console.error('updateFormation error', err);
    const status = /required|must/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function deleteFormation(req, res) {
  try {
    await formationService.deleteFormation(req.params.id);
    res.json({ message: 'Formation deleted' });
  } catch (err) {
    console.error('deleteFormation error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function publishFormation(req, res) {
  try {
    const { published } = req.body;
    if (typeof published !== 'boolean') {
      throw new Error('Published flag must be boolean');
    }
    const updates = { published };
    if (published) {
      updates.published_at = new Date();
    } else {
      updates.published_at = null;
    }
    const updated = await formationService.updateFormation(req.params.id, updates);
    res.json({ data: updated });
  } catch (err) {
    console.error('publishFormation error:', err);
    const status = /required|must/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}
async function getUserFormations(req, res) {
  try {
    const result = await formationService.getUserFormations(req.user.id, req.query);
    res.json({ data: result });
  } catch (err) {
    console.error('getUserFormations error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

export {
  getFormations,
  getFormationById,
  enroll,
  getUserFormations,
  createFormation,
  updateFormation,
  deleteFormation,
  publishFormation,
};
