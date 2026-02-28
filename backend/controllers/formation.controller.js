const formationService = require('../services/formation.service');

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

module.exports = {
  getFormations,
  getFormationById,
  enroll,
};
