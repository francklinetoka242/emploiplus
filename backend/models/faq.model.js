import pool from '../config/db.js';

// retrieve all FAQ entries with optional category filter
async function getAllFAQ(category = null, limit = 50, offset = 0) {
  try {
    let query = `
      SELECT id, question, answer, is_published, order_index, category, 
             created_by, updated_by, created_at, updated_at
      FROM faqs
    `;
    const params = [];

    if (category) {
      query += ` WHERE category = $1`;
      params.push(category);
    }

    query += ` ORDER BY order_index ASC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    console.log('Executing FAQ query:', query.replace(/\s+/g,' '), 'params', params);
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
      SELECT id, question, answer, is_published, order_index, category, 
             created_by, updated_by, created_at, updated_at
      FROM faqs
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
      SELECT DISTINCT category FROM faqs WHERE category IS NOT NULL
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
      INSERT INTO faqs (question, answer, category, is_published, order_index, created_at, updated_at)
      VALUES ($1, $2, $3, true, 0, NOW(), NOW())
      RETURNING id, question, answer, is_published, order_index, category, 
                created_by, updated_by, created_at, updated_at
    `;
    const result = await pool.query(query, [question, answer, category || 'Général']);
    return result.rows[0];
  } catch (err) {
    console.error('createFAQ query error:', err);
    throw err;
  }
}

// update a FAQ entry by ID
async function updateFAQ(faqId, updates) {
  try {
    const cleanUpdates = { ...updates };
    // Always set updated_at to current timestamp
    cleanUpdates.updated_at = new Date();
    
    const fields = Object.keys(cleanUpdates);
    const values = Object.values(cleanUpdates);
    values.push(faqId);

    if (fields.length === 1 && fields[0] === 'updated_at') {
      throw new Error('No fields to update');
    }

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE faqs
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING id, question, answer, is_published, order_index, category, 
                created_by, updated_by, created_at, updated_at
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
    const query = 'DELETE FROM faqs WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [faqId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteFAQ query error:', err);
    throw err;
  }
}

// get FAQ statistics
async function getFAQStats() {
  try {
    const totalQuery = 'SELECT COUNT(*) as count FROM faqs';
    const publishedQuery = 'SELECT COUNT(*) as count FROM faqs WHERE is_published = true';
    const draftQuery = 'SELECT COUNT(*) as count FROM faqs WHERE is_published = false';
    const categoriesQuery = 'SELECT COUNT(DISTINCT category) as count FROM faqs WHERE category IS NOT NULL';

    const [totalResult, publishedResult, draftResult, categoriesResult] = await Promise.all([
      pool.query(totalQuery),
      pool.query(publishedQuery),
      pool.query(draftQuery),
      pool.query(categoriesQuery),
    ]);

    return {
      total_faqs: parseInt(totalResult.rows[0]?.count || 0),
      published_count: parseInt(publishedResult.rows[0]?.count || 0),
      draft_count: parseInt(draftResult.rows[0]?.count || 0),
      categories_count: parseInt(categoriesResult.rows[0]?.count || 0),
      last_updated: new Date().toISOString(),
    };
  } catch (err) {
    console.error('getFAQStats query error:', err);
    throw err;
  }
}

// reorder FAQ items
async function reorderFAQs(items) {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid items array');
    }

    // Use a transaction to update all items atomically
    const updateQueries = items.map(
      (item, index) => ({
        id: item.id,
        order_index: item.order_index !== undefined ? item.order_index : index,
      })
    );

    // Execute all updates
    const promises = updateQueries.map((item) => {
      const query = `
        UPDATE faqs
        SET order_index = $1
        WHERE id = $2
        RETURNING id, question, answer, is_published, order_index, created_at
      `;
      return pool.query(query, [item.order_index, item.id]);
    });

    const results = await Promise.all(promises);
    return results.flatMap((r) => r.rows);
  } catch (err) {
    console.error('reorderFAQs query error:', err);
    throw err;
  }
}

export default {
  getAllFAQ,
  getFAQById,
  getFAQCategories,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQStats,
  reorderFAQs,
};
