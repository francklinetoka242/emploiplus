const publicationService = require('../services/publication.service');

async function getPublications(req, res) {
  try {
    const list = await publicationService.getPublications(req.query);
    res.json({ data: list });
  } catch (err) {
    console.error('getPublications error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function getPublicationById(req, res) {
  try {
    const item = await publicationService.getPublicationById(req.params.id);
    res.json({ data: item });
  } catch (err) {
    console.error('getPublicationById error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function createPublication(req, res) {
  try {
    const pub = await publicationService.createPublication(req.body, req.user);
    res.status(201).json({ data: pub });
  } catch (err) {
    console.error('createPublication error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function deletePublication(req, res) {
  try {
    await publicationService.deletePublication(req.params.id, req.user);
    res.json({ message: 'Publication deleted' });
  } catch (err) {
    console.error('deletePublication error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = {
  getPublications,
  getPublicationById,
  createPublication,
  deletePublication,
};
