import pool from '../config/db.js';

// Récupérer tous les documents
async function getAllDocuments(limit = 50, offset = 0) {
  try {
    const query = `
      SELECT id, name, slug, type, content, is_published, 
             created_by, updated_by, created_at, updated_at
      FROM documentations
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (err) {
    console.error('getAllDocuments query error:', err);
    throw err;
  }
}

// Récupérer le nombre total de documents
async function getDocumentCount() {
  try {
    const query = `SELECT COUNT(*) as count FROM documentations`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  } catch (err) {
    console.error('getDocumentCount query error:', err);
    throw err;
  }
}

// Récupérer les documents par type
async function getDocumentsByType(type) {
  try {
    const query = `
      SELECT id, name, slug, type, content, is_published, 
             created_by, updated_by, created_at, updated_at
      FROM documentations
      WHERE type = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [type]);
    return result.rows;
  } catch (err) {
    console.error('getDocumentsByType query error:', err);
    throw err;
  }
}

// Récupérer un document par ID
async function getDocumentById(docId) {
  try {
    const query = `
      SELECT id, name, slug, type, content, is_published, 
             created_by, updated_by, created_at, updated_at
      FROM documentations
      WHERE id = $1
    `;
    const result = await pool.query(query, [docId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getDocumentById query error:', err);
    throw err;
  }
}

// Récupérer un document par slug
async function getDocumentBySlug(slug) {
  try {
    const query = `
      SELECT id, name, slug, type, content, is_published, 
             created_by, updated_by, created_at, updated_at
      FROM documentations
      WHERE slug = $1 AND is_published = true
    `;
    const result = await pool.query(query, [slug]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getDocumentBySlug query error:', err);
    throw err;
  }
}

// Créer un nouveau document
async function createDocument(name, slug, type, content, createdBy) {
  try {
    const query = `
      INSERT INTO documentations (name, slug, type, content, created_by, is_published, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW())
      RETURNING id, name, slug, type, content, is_published, created_by, updated_by, created_at, updated_at
    `;
    const result = await pool.query(query, [name, slug, type, content, createdBy]);
    return result.rows[0];
  } catch (err) {
    console.error('createDocument query error:', err);
    throw err;
  }
}

// Mettre à jour un document
async function updateDocument(docId, name, slug, type, content, isPublished, updatedBy) {
  try {
    const query = `
      UPDATE documentations
      SET name = $1, slug = $2, type = $3, content = $4, is_published = $5, updated_by = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING id, name, slug, type, content, is_published, created_by, updated_by, created_at, updated_at
    `;
    const result = await pool.query(query, [name, slug, type, content, isPublished, updatedBy, docId]);
    return result.rows[0];
  } catch (err) {
    console.error('updateDocument query error:', err);
    throw err;
  }
}

// Supprimer un document
async function deleteDocument(docId) {
  try {
    const query = `DELETE FROM documentations WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [docId]);
    return result.rows[0] ? true : false;
  } catch (err) {
    console.error('deleteDocument query error:', err);
    throw err;
  }
}

// Publier/Dépublier un document
async function toggleDocumentPublish(docId, isPublished, updatedBy) {
  try {
    const query = `
      UPDATE documentations
      SET is_published = $1, updated_by = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, slug, type, content, is_published, created_by, updated_by, created_at, updated_at
    `;
    const result = await pool.query(query, [isPublished, updatedBy, docId]);
    return result.rows[0];
  } catch (err) {
    console.error('toggleDocumentPublish query error:', err);
    throw err;
  }
}

// Obtenir les statistiques des documents
async function getDocumentStats() {
  try {
    const query = `
      SELECT type, COUNT(*) as count FROM documentations
      GROUP BY type
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error('getDocumentStats query error:', err);
    throw err;
  }
}

export {
  getAllDocuments,
  getDocumentCount,
  getDocumentsByType,
  getDocumentById,
  getDocumentBySlug,
  createDocument,
  updateDocument,
  deleteDocument,
  toggleDocumentPublish,
  getDocumentStats
};
