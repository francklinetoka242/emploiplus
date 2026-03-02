import loginHistoryService from '../services/login-history.service.js';

// GET /api/admin/login-history
async function getHistory(req, res, next) {
  try {
    const history = await loginHistoryService.fetchHistory(req.query);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export { getHistory };
