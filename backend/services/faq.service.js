import FAQModel from '../models/faq.model.js';

// retrieve all FAQ entries with optional category filtering
async function getFAQ(query = {}) {
  try {
    const limit = parseInt(query.limit) || 50;
    const offset = parseInt(query.offset) || 0;
    const category = query.category || null;

    if (limit < 1 || limit > 200) {
      throw new Error('Limit must be between 1 and 200');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    // fetch FAQ entries, optionally filtered by category
    const faqEntries = await FAQModel.getAllFAQ(category, limit, offset);
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
    if (!faqId) {
      throw new Error('FAQ ID is required');
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

export default {
  getFAQ,
  getFAQCategories,
  getFAQById,
};
