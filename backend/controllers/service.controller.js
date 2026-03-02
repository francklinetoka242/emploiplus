import serviceService from '../services/service.service.js';

async function getServices(req, res) {
  try {
    const list = await serviceService.getServices(req.query);
    res.json({ data: list });
  } catch (err) {
    console.error('getServices error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

export { getServices };
