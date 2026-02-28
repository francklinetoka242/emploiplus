const faqService = require('../services/faq.service');

async function getFAQ(req, res) {
  try {
    const entries = await faqService.getFAQ(req.query);
    res.json({ data: entries });
  } catch (err) {
    console.error('getFAQ error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = { getFAQ };
