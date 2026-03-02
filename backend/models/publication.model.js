import pool from '../config/db.js';

// retrieve all publications with pagination
async function getAllPublications(limit = 20, offset = 0) {
  try {
    const query = `
      SELECT id, title, content, author_id, image_url, created_at, updated_at
      FROM publications
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (err) {
    console.error('getAllPublications query error:', err);
    throw err;
  }
}

// retrieve a single publication by ID
async function getPublicationById(publicationId) {
  try {
    const query = `
      SELECT id, title, content, author_id, image_url, created_at, updated_at
      FROM publications
      WHERE id = $1
    `;
    const result = await pool.query(query, [publicationId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getPublicationById query error:', err);
    throw err;
  }
}

// retrieve publications by a specific author
async function getPublicationsByAuthor(authorId, limit = 20, offset = 0) {
  try {
    const query = `
      SELECT id, title, content, author_id, image_url, created_at, updated_at
      FROM publications
      WHERE author_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [authorId, limit, offset]);
    return result.rows;
  } catch (err) {
    console.error('getPublicationsByAuthor query error:', err);
    throw err;
  }
}

// create a new publication
async function createPublication(title, content, authorId, imageUrl = null) {
  try {
    const query = `
      INSERT INTO publications (title, content, author_id, image_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, title, content, author_id, image_url, created_at, updated_at
    `;
    const result = await pool.query(query, [title, content, authorId, imageUrl]);
    return result.rows[0];
  } catch (err) {
    console.error('createPublication query error:', err);
    throw err;
  }
}

// update a publication by ID
async function updatePublication(publicationId, updates) {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(publicationId);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at');
    values.splice(values.length - 1, 0, new Date());

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE publications
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING id, title, content, author_id, image_url, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updatePublication query error:', err);
    throw err;
  }
}

// delete a publication by ID
async function deletePublication(publicationId) {
  try {
    const query = 'DELETE FROM publications WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [publicationId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deletePublication query error:', err);
    throw err;
  }
}

export default {
  getAllPublications,
  getPublicationById,
  getPublicationsByAuthor,
  createPublication,
  updatePublication,
  deletePublication,
};
