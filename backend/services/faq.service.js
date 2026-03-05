import FAQModel from '../models/faq.model.js';

// retrieve all FAQ entries with optional category filtering
async function getFAQ(query = {}) {
  try {
    const limit = parseInt(query.limit) || 50;
    const offset = parseInt(query.offset) || 0;
    // const category = query.category || null; // Disabled since category column doesn't exist

    if (limit < 1 || limit > 200) {
      throw new Error('Limit must be between 1 and 200');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    // fetch FAQ entries (category filtering disabled)
    const faqEntries = await FAQModel.getAllFAQ(null, limit, offset);
    return faqEntries;
  } catch (err) {
    console.error('getFAQ service error:', err);
    throw err;
  }
}

// retrieve all available FAQ categories
async function getFAQCategories() {
  try {
    const categories = await FAQModel.getFAQCategories();
    return categories;
  } catch (err) {
    console.error('getFAQCategories service error:', err);
    throw err;
  }
}

// retrieve a single FAQ entry by ID
async function getFAQById(faqId) {
  try {
    // Check for valid numeric ID (0 is technically valid, but we accept any integer >= 0)
    if (faqId === null || faqId === undefined || isNaN(faqId)) {
      throw new Error('Valid FAQ ID is required');
    }

    const entry = await FAQModel.getFAQById(faqId);
    if (!entry) {
      throw new Error('FAQ entry not found');
    }

    return entry;
  } catch (err) {
    console.error('getFAQById service error:', err);
    throw err;
  }
}

// create a new FAQ entry
async function createFAQ(question, answer, category = null) {
  try {
    // Validate required fields
    if (!question || !answer) {
      throw new Error('Question and answer are required');
    }

    const newEntry = await FAQModel.createFAQ(question, answer, category);
    return newEntry;
  } catch (err) {
    console.error('createFAQ service error:', err);
    throw err;
  }
}

// update an existing FAQ entry
async function updateFAQ(faqId, updates) {
  try {
    if (!faqId) {
      throw new Error('FAQ ID is required');
    }

    const updated = await FAQModel.updateFAQ(faqId, updates);
    if (!updated) {
      throw new Error('FAQ entry not found');
    }

    return updated;
  } catch (err) {
    console.error('updateFAQ service error:', err);
    throw err;
  }
}

// delete an FAQ entry
async function deleteFAQ(faqId) {
  try {
    if (!faqId) {
      throw new Error('FAQ ID is required');
    }

    const deleted = await FAQModel.deleteFAQ(faqId);
    if (!deleted) {
      throw new Error('FAQ entry not found');
    }

    return true;
  } catch (err) {
    console.error('deleteFAQ service error:', err);
    throw err;
  }
}

// get FAQ statistics
async function getFAQStats() {
  try {
    const stats = await FAQModel.getFAQStats();
    return stats;
  } catch (err) {
    console.error('getFAQStats service error:', err);
    throw err;
  }
}

// reorder FAQ items
async function reorderFAQs(items) {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid items array');
    }

    const reordered = await FAQModel.reorderFAQs(items);
    return reordered;
  } catch (err) {
    console.error('reorderFAQs service error:', err);
    throw err;
  }
}

export default {
  getFAQ,
  getFAQCategories,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQStats,
  reorderFAQs,
};
