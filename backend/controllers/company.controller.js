const companyService = require('../services/company.service');

async function getCompanies(req, res) {
  try {
    const list = await companyService.getCompanies(req.query);
    res.json({ data: list });
  } catch (err) {
    console.error('getCompanies error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function getCompanyById(req, res) {
  try {
    const item = await companyService.getCompanyById(req.params.id);
    res.json({ data: item });
  } catch (err) {
    console.error('getCompanyById error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = {
  getCompanies,
  getCompanyById,
};
