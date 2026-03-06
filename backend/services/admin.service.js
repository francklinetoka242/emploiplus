import AdminModel from '../models/admin.model.js';
import AppError from '../utils/AppError.js';

// list admins with filters and pagination
async function listAdmins(query = {}) {
  try {
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    if (limit < 1 || limit > 200) {
      throw new AppError('Limit must be between 1 and 200', 400);
    }
    if (offset < 0) {
      throw new AppError('Offset must be non-negative', 400);
    }

    const filters = {
      status: query.status,
      role: query.role ? parseInt(query.role) : undefined,
      search: query.search,
      admin_id: query.admin_id ? parseInt(query.admin_id) : undefined,
      admin_level: query.admin_level ? parseInt(query.admin_level) : undefined,
      date_from: query.date_from,
      date_to: query.date_to,
    };

    const admins = await AdminModel.getAllAdmins(filters, limit, offset);
    return admins;
  } catch (err) {
    console.error('listAdmins service error:', err);
    throw err;
  }
}

// block or unblock admin
async function setAdminStatus(adminId, status) {
  try {
    if (!adminId) {
      throw new AppError('Admin ID is required', 400);
    }
    if (!['active', 'blocked', 'pending'].includes(status)) {
      throw new AppError('Invalid status value', 400);
    }
    const updated = await AdminModel.updateAdmin(adminId, { status });
    if (!updated) {
      throw new AppError('Admin not found', 404);
    }
    return updated;
  } catch (err) {
    console.error('setAdminStatus service error:', err);
    throw err;
  }
}

// change admin role level
async function changeAdminRole(adminId, roleLevel) {
  try {
    if (!adminId) {
      throw new AppError('Admin ID is required', 400);
    }
    roleLevel = parseInt(roleLevel);
    if (isNaN(roleLevel) || roleLevel < 1 || roleLevel > 5) {
      throw new AppError('Invalid role level', 400);
    }
    const updated = await AdminModel.updateAdmin(adminId, { role_level: roleLevel });
    if (!updated) {
      throw new AppError('Admin not found', 404);
    }
    return updated;
  } catch (err) {
    console.error('changeAdminRole service error:', err);
    throw err;
  }
}

// delete an admin account
async function deleteAdmin(adminId) {
  try {
    if (!adminId) {
      throw new AppError('Admin ID is required', 400);
    }
    const result = await AdminModel.deleteAdmin(adminId);
    if (!result) {
      throw new AppError('Admin not found', 404);
    }
    return result;
  } catch (err) {
    console.error('deleteAdmin service error:', err);
    throw err;
  }
}

// verify invitation / verification status
async function getVerificationStatus(adminId) {
  try {
    if (!adminId) {
      throw new AppError('Admin ID is required', 400);
    }
    const admin = await AdminModel.getAdminById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    const now = new Date();
    const tokenExpires = admin.token_expires_at ? new Date(admin.token_expires_at) : null;
    const isExpired = tokenExpires ? tokenExpires < now : false;
    return {
      id: admin.id,
      status: admin.status,
      token_expires_at: admin.token_expires_at,
      is_expired: isExpired,
      expires_in_hours: tokenExpires ? Math.max(0, Math.round((tokenExpires - now) / (1000 * 60 * 60))) : null,
      requires_resend: isExpired && admin.status === 'pending'
    };
  } catch (err) {
    console.error('getVerificationStatus service error:', err);
    throw err;
  }
}

// stub for resend invitation (would normally send email & refresh token)
async function resendInvitation(adminId) {
  try {
    if (!adminId) {
      throw new AppError('Admin ID is required', 400);
    }
    const admin = await AdminModel.getAdminById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    // in a real system we'd generate a new activation_token and email it
    // here we simply update token_expires_at + return success
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await AdminModel.updateAdmin(adminId, { token_expires_at: newExpiry });
    return true;
  } catch (err) {
    console.error('resendInvitation service error:', err);
    throw err;
  }
}

// statistics for export page
async function getAdminStatistics() {
  try {
    const stats = await AdminModel.getAdminCounts();
    return stats;
  } catch (err) {
    console.error('getAdminStatistics service error:', err);
    throw err;
  }
}

// get admin by ID
async function getAdminById(adminId) {
  try {
    if (!adminId) {
      throw new AppError('Admin ID is required', 400);
    }
    const admin = await AdminModel.getAdminById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    return admin;
  } catch (err) {
    console.error('getAdminById service error:', err);
    throw err;
  }
}

// update admin details
async function updateAdmin(adminId, updates) {
  try {
    if (!adminId) {
      throw new AppError('Admin ID is required', 400);
    }
    const admin = await AdminModel.getAdminById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    const updated = await AdminModel.updateAdmin(adminId, updates);
    return updated;
  } catch (err) {
    console.error('updateAdmin service error:', err);
    throw err;
  }
}

// update admin permissions
async function updateAdminPermissions(adminId, permissions) {
  try {
    if (!adminId) {
      throw new AppError('Admin ID is required', 400);
    }
    const admin = await AdminModel.getAdminById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    // permissions should be a JSON object or array
    const updated = await AdminModel.updateAdmin(adminId, { permissions: JSON.stringify(permissions) });
    return updated;
  } catch (err) {
    console.error('updateAdminPermissions service error:', err);
    throw err;
  }
}

export default {
  listAdmins,
  setAdminStatus,
  changeAdminRole,
  deleteAdmin,
  getVerificationStatus,
  resendInvitation,
  getAdminStatistics,
  getAdminById,
  updateAdmin,
  updateAdminPermissions,
};
