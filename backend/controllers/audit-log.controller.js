import {
  getAuditLogs as getAuditLogsModel,
  getAuditModules as getAuditModulesModel,
  createAuditLog as createAuditLogModel,
} from '../models/audit-log.model.js';

/**
 * GET /api/admin/audit-logs
 * Get all audit logs with optional filters
 * Filter by: startDate, endDate, adminId, module, action
 */
export async function getAuditLogs(req, res, next) {
  try {
    const {
      startDate,
      endDate,
      adminId,
      module,
      action,
      limit = 100,
      offset = 0,
    } = req.query;

    const filters = {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(adminId && { adminId }),
      ...(module && { module }),
      ...(action && { action }),
    };

    const logs = await getAuditLogsModel(
      filters,
      parseInt(limit, 10),
      parseInt(offset, 10)
    );

    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (err) {
    console.error('Error in getAuditLogs:', err);
    next(err);
  }
}

/**
 * GET /api/admin/audit-logs/modules
 * Get distinct modules for filtering
 */
export async function getAuditModules(req, res, next) {
  try {
    const modules = await getAuditModulesModel();

    res.json({
      success: true,
      data: modules,
    });
  } catch (err) {
    console.error('Error in getAuditModules:', err);
    next(err);
  }
}

/**
 * POST /api/admin/audit-logs
 * Create a new audit log entry (internal use)
 */
export async function createAuditLog(req, res, next) {
  try {
    const { adminId, adminName, action, module, details, ipAddress } =
      req.body;

    // Validate required fields
    if (!adminId || !action || !module) {
      return res.status(400).json({
        success: false,
        message:
          'adminId, action, and module are required fields',
      });
    }

    const log = await createAuditLogModel({
      adminId,
      adminName,
      action,
      module,
      details,
      ipAddress,
    });

    res.json({
      success: true,
      data: log,
    });
  } catch (err) {
    console.error('Error in createAuditLog:', err);
    next(err);
  }
}

export default {
  getAuditLogs,
  getAuditModules,
  createAuditLog,
};
