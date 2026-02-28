const pool = require('../config/db');

// retrieve all FAQ entries with optional category filter
async function getAllFAQ(category = null, limit = 50, offset = 0) {
  try {
    let query = `
      SELECT id, question, answer, category, created_at, updated_at
      FROM faq
    `;
    const params = [];

    if (category) {
      query += ` WHERE category = $1`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('getAllFAQ query error:', err);
    throw err;
  }
}

// retrieve a single FAQ entry by ID
async function getFAQById(faqId) {
  try {
    const query = `
      SELECT id, question, answer, category, created_at, updated_at
      FROM faq
      WHERE id = $1
    `;
    const result = await pool.query(query, [faqId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('getFAQById query error:', err);
    throw err;
  }
}

// retrieve all available FAQ categories
async function getFAQCategories() {
  try {
    const query = `
      SELECT DISTINCT category FROM faq WHERE category IS NOT NULL
      ORDER BY category
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  } catch (err) {
    console.error('getFAQCategories query error:', err);
    throw err;
  }
}

// create a new FAQ entry
async function createFAQ(question, answer, category = null) {
  try {
    const query = `
      INSERT INTO faq (question, answer, category, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, question, answer, category, created_at, updated_at
    `;
    const result = await pool.query(query, [question, answer, category]);
    return result.rows[0];
  } catch (err) {
    console.error('createFAQ query error:', err);
    throw err;
  }
}

// update a FAQ entry by ID
async function updateFAQ(faqId, updates) {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(faqId);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at');
    values.splice(values.length - 1, 0, new Date());

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE faq
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING id, question, answer, category, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('updateFAQ query error:', err);
    throw err;
  }
}

// delete a FAQ entry by ID
async function deleteFAQ(faqId) {
  try {
    const query = 'DELETE FROM faq WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [faqId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteFAQ query error:', err);
    throw err;
  }
}

module.exports = {
  getAllFAQ,
  getFAQById,
  getFAQCategories,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};
