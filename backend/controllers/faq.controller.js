import faqService from '../services/faq.service.js';

async function getFAQ(req, res) {
  try {
    const entries = await faqService.getFAQ(req.query);
    res.json({ data: entries });
  } catch (err) {
    console.error('getFAQ error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// get a single FAQ by ID
async function getFAQByIdHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Valid FAQ ID is required' });
    }
    const entry = await faqService.getFAQById(parseInt(id));
    res.json({ data: entry });
  } catch (err) {
    console.error('getFAQByIdHandler error', err);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

// admin handlers -------------------------------------------------------
async function createFAQEntry(req, res, next) {
  try {
    const { question, answer, category } = req.body;
    const entry = await faqService.createFAQ(question, answer, category);
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

async function updateFAQEntry(req, res, next) {
  try {
    const faqId = parseInt(req.params.id);
    const updates = req.body;
    const updated = await faqService.updateFAQ(faqId, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteFAQEntry(req, res, next) {
  try {
    const faqId = parseInt(req.params.id);
    await faqService.deleteFAQ(faqId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// get FAQ statistics
async function getFAQStats(req, res, next) {
  try {
    const stats = await faqService.getFAQStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
}

// reorder FAQ items
async function reorderFAQItems(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }
    const result = await faqService.reorderFAQs(items);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export { getFAQ, getFAQByIdHandler, createFAQEntry, updateFAQEntry, deleteFAQEntry, getFAQStats, reorderFAQItems };
