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

export { getFAQ, createFAQEntry, updateFAQEntry, deleteFAQEntry };
