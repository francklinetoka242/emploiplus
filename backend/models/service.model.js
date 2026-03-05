import pool from '../config/db.js';

// retrieve all services with optional filtering (by catalog, visibility, etc.)
async function getAllServices(limit = 20, offset = 0, catalogId = null, visibleOnly = false) {
  try {
    const conditions = [];
    const params = [];

    if (catalogId) {
      conditions.push(`catalog_id = $${params.length + 1}`);
      params.push(catalogId);
    }

    if (visibleOnly) {
      conditions.push(`is_featured = true`);
    }

    let query = `
      SELECT id, catalog_id, name, description, price, duration, is_featured, created_at, updated_at
      FROM services
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
    console.error('getAllServices query error:', err);
    throw err;
  }
}

// retrieve a single service by ID
async function getServiceById(serviceId) {
  try {
    const query = `
      SELECT id, catalog_id, name, description, price, duration, is_featured, created_at, updated_at
      FROM services
      WHERE id = $1
    `;
    const result = await pool.query(query, [serviceId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getServiceById query error:', err);
    throw err;
  }
}

// retrieve services by name or description (search functionality)
async function searchServices(searchTerm, limit = 20) {
  try {
    const query = `
      SELECT id, catalog_id, name, description, price, duration, is_featured, created_at, updated_at
      FROM services
      WHERE name ILIKE $1 OR description ILIKE $1
      ORDER BY name ASC
      LIMIT $2
    `;
    const result = await pool.query(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  } catch (err) {
    console.error('searchServices query error:', err);
    throw err;
  }
}

// create a new service with flexible columns
async function createService(data) {
  try {
    const columns = [];
    const placeholders = [];
    const values = [];
    let idx = 1;

    // catalog_id is required
    if (!data.catalog_id) {
      throw new Error('Catalog ID is required');
    }

    for (const [key, value] of Object.entries(data)) {
      columns.push(key);
      placeholders.push(`$${idx}`);
      values.push(value);
      idx += 1;
    }

    // always set timestamps if not provided
    if (!columns.includes('created_at')) {
      columns.push('created_at');
      placeholders.push('NOW()');
    }
    if (!columns.includes('updated_at')) {
      columns.push('updated_at');
      placeholders.push('NOW()');
    }

    const query = `
      INSERT INTO services (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id, catalog_id, name, description, price, duration, is_featured, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error('createService query error:', err);
    throw err;
  }
}

// update a service by ID
async function updateService(serviceId, updates) {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(serviceId);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at');
    values.splice(values.length - 1, 0, new Date());

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE services
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING id, catalog_id, name, description, price, duration, is_featured, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updateService query error:', err);
    throw err;
  }
}

// delete a service by ID
async function deleteService(serviceId) {
  try {
    const query = 'DELETE FROM services WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [serviceId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteService query error:', err);
    throw err;
  }
}

export default {
  getAllServices,
  getServiceById,
  searchServices,
  createService,
  updateService,
  deleteService,
};
