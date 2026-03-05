import * as LoginHistoryModel from '../models/login-history.model.js';

async function record(event) {
  // wrap model call but hide errors if necessary
  try {
    return await LoginHistoryModel.recordLoginEvent(event);
  } catch (err) {
    console.error('login-history service error:', err);
    // don't propagate to avoid crashing login flow
  }
}

async function fetchHistory(query = {}) {
  const limit = parseInt(query.limit) || 50;
  const offset = parseInt(query.offset) || 0;
  const filters = {
    admin_id: query.admin_id ? parseInt(query.admin_id) : undefined,
    success: query.success !== undefined ? query.success : undefined,
    date_from: query.date_from,
    date_to: query.date_to,
    role: query.role,
    email: query.email,
  };
  return await LoginHistoryModel.getLoginHistory(filters, limit, offset);
}

export default {
  record,
  fetchHistory,
};
