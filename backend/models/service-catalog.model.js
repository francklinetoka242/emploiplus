import pool from '../config/db.js';

// retrieve all service catalogs with optional publication filter
async function getAllCatalogs(limit = 20, offset = 0, published = null) {
  try {
    const conditions = [];
    const params = [];

    if (published !== null && published !== undefined) {
      conditions.push(`published = $${params.length + 1}`);
      params.push(published);
    }

    let query = `
      SELECT id, title, category_id, published, created_at, updated_at
      FROM services_catalog
    `;

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('getAllCatalogs query error:', err);
    throw err;
  }
}

// retrieve a single catalog by ID
async function getCatalogById(catalogId) {
  try {
    const query = `
      SELECT id, title, category_id, published, created_at, updated_at
      FROM services_catalog
      WHERE id = $1
    `;
    const result = await pool.query(query, [catalogId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getCatalogById query error:', err);
    throw err;
  }
}

// create a new service catalog
async function createCatalog(data) {
  try {
    const { title, category_id, published } = data;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new Error('Catalog title is required');
    }

    const query = `
      INSERT INTO services_catalog (title, category_id, published, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, title, category_id, published, created_at, updated_at
    `;

    const result = await pool.query(query, [title, category_id || null, published || false]);
    return result.rows[0];
  } catch (err) {
    console.error('createCatalog query error:', err);
    throw err;
  }
}

// update a service catalog
async function updateCatalog(catalogId, updates) {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(catalogId);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at');
    values.splice(values.length - 1, 0, new Date());

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE services_catalog
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING id, title, category_id, published, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updateCatalog query error:', err);
    throw err;
  }
}

// delete a service catalog
async function deleteCatalog(catalogId) {
  try {
    const query = 'DELETE FROM services_catalog WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [catalogId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteCatalog query error:', err);
    throw err;
  }
}

export default {
  getAllCatalogs,
  getCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog
};
