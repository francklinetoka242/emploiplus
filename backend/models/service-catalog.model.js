import pool from '../config/db.js';

// retrieve all service catalogs with optional publication filter
async function getAllCatalogs(limit = 20, offset = 0, published = null) {
  try {
    const conditions = [];
    const params = [];

    if (published !== null && published !== undefined) {
      conditions.push(`is_featured = $${params.length + 1}`);
      params.push(published);
    }

    let query = `
      SELECT id, name, description, icon, is_featured, created_at, updated_at
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
      SELECT id, name, description, icon, is_featured, created_at, updated_at
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
    const { name, description, icon, is_featured } = data;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Catalog name is required');
    }

    const query = `
      INSERT INTO services_catalog (name, description, icon, is_featured, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, description, icon, is_featured, created_at, updated_at
    `;

    const result = await pool.query(query, [name, description || null, icon || null, is_featured || false]);
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
      RETURNING id, name, description, icon, is_featured, created_at, updated_at
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
