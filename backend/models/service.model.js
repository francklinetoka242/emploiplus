const pool = require('../config/db');

// retrieve all services with pagination
async function getAllServices(limit = 20, offset = 0) {
  try {
    const query = `
      SELECT id, name, description, icon_url, features, price, created_at, updated_at
      FROM services
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
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
      SELECT id, name, description, icon_url, features, price, created_at, updated_at
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

// retrieve services by name (search functionality)
async function searchServices(searchTerm, limit = 20) {
  try {
    const query = `
      SELECT id, name, description, icon_url, features, price, created_at, updated_at
      FROM services
      WHERE name ILIKE $1 OR description ILIKE $1
      LIMIT $2
    `;
    const result = await pool.query(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  } catch (err) {
    console.error('searchServices query error:', err);
    throw err;
  }
}

// create a new service
async function createService(name, description, iconUrl, features = null, price = null) {
  try {
    const query = `
      INSERT INTO services (name, description, icon_url, features, price, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, description, icon_url, features, price, created_at, updated_at
    `;
    const result = await pool.query(query, [name, description, iconUrl, features, price]);
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
      RETURNING id, name, description, icon_url, features, price, created_at, updated_at
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

module.exports = {
  getAllServices,
  getServiceById,
  searchServices,
  createService,
  updateService,
  deleteService,
};
