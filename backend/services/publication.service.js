const PublicationModel = require('../models/publication.model');

// retrieve all publications with pagination
async function getPublications(query = {}) {
  try {
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    const publications = await PublicationModel.getAllPublications(limit, offset);
    return publications;
  } catch (err) {
    console.error('getPublications service error:', err);
    throw err;
  }
}

// retrieve a single publication by ID
async function getPublicationById(publicationId) {
  try {
    if (!publicationId) {
      throw new Error('Publication ID is required');
    }

    const publication = await PublicationModel.getPublicationById(publicationId);
    if (!publication) {
      throw new Error('Publication not found');
    }

    return publication;
  } catch (err) {
    console.error('getPublicationById service error:', err);
    throw err;
  }
}

// create a new publication
async function createPublication(pubData, user) {
  try {
    if (!user || !user.id) {
      throw new Error('Authenticated user is required');
    }

    const { content, image_url } = pubData;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Publication content is required');
    }

    // create publication with current user as author
    const publication = await PublicationModel.createPublication(
      pubData.title || 'Untitled',
      content,
      user.id,
      image_url
    );

    return publication;
  } catch (err) {
    console.error('createPublication service error:', err);
    throw err;
  }
}

// delete a publication
async function deletePublication(publicationId, user) {
  try {
    if (!publicationId) {
      throw new Error('Publication ID is required');
    }
    if (!user || !user.id) {
      throw new Error('Authenticated user is required');
    }

    // verify publication exists
    const publication = await PublicationModel.getPublicationById(publicationId);
    if (!publication) {
      throw new Error('Publication not found');
    }

    // verify user owns the publication (or is admin)
    if (publication.author_id !== user.id && user.role !== 'admin') {
      throw new Error('Access denied: you can only delete your own publications');
    }

    // delete publication from database
    const deleted = await PublicationModel.deletePublication(publicationId);
    return { success: deleted };
  } catch (err) {
    console.error('deletePublication service error:', err);
    throw err;
  }
}

// retrieve publications by a specific author
async function getPublicationsByAuthor(authorId, query = {}) {
  try {
    if (!authorId) {
      throw new Error('Author ID is required');
    }

    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    const publications = await PublicationModel.getPublicationsByAuthor(authorId, limit, offset);
    return publications;
  } catch (err) {
    console.error('getPublicationsByAuthor service error:', err);
    throw err;
  }
}

module.exports = {
  getPublications,
  getPublicationById,
  createPublication,
  deletePublication,
  getPublicationsByAuthor,
};
