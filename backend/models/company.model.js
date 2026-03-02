import pool from '../config/db.js';

// retrieve all companies
async function getAllCompanies(limit = 20, offset = 0) {
  try {
    const query = `
      SELECT id, name, description, logo, website, location, created_at, updated_at
      FROM companies
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (err) {
    console.error('getAllCompanies query error:', err);
    throw err;
  }
}

// retrieve a single company by ID
async function getCompanyById(companyId) {
  try {
    const query = `
      SELECT id, name, description, logo, website, location, created_at, updated_at
      FROM companies
      WHERE id = $1
    `;
    const result = await pool.query(query, [companyId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getCompanyById query error:', err);
    throw err;
  }
}

// retrieve company by name (for uniqueness check)
async function getCompanyByName(name) {
  try {
    const query = `
      SELECT id, name, description, logo, website, location, created_at, updated_at
      FROM companies
      WHERE name = $1
    `;
    const result = await pool.query(query, [name]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getCompanyByName query error:', err);
    throw err;
  }
}

// create a new company
async function createCompany(name, description, logo, website, location) {
  try {
    const query = `
      INSERT INTO companies (name, description, logo, website, location, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, description, logo, website, location, created_at, updated_at
    `;
    const result = await pool.query(query, [name, description, logo, website, location]);
    return result.rows[0];
  } catch (err) {
    console.error('createCompany query error:', err);
    throw err;
  }
}

// update a company by ID
async function updateCompany(companyId, updates) {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(companyId);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // add updated_at to the SET clause
    fields.push('updated_at');
    values.splice(values.length - 1, 0, new Date());

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE companies
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING id, name, description, logo, website, location, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updateCompany query error:', err);
    throw err;
  }
}

// delete a company by ID
async function deleteCompany(companyId) {
  try {
    const query = 'DELETE FROM companies WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [companyId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteCompany query error:', err);
    throw err;
  }
}

export default {
  getAllCompanies,
  getCompanyById,
  getCompanyByName,
  createCompany,
  updateCompany,
  deleteCompany,
};
