import adminService from '../services/admin.service.js';
import auditService from '../services/audit.service.js';
import authService from '../services/auth.service.js';
import AppError from '../utils/AppError.js';

// GET /api/admin/management/admins
async function listAdmins(req, res, next) {
  try {
    const admins = await adminService.listAdmins(req.query);
    res.json({ success: true, admins });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/management/admins/:id/block
async function blockAdmin(req, res, next) {
  try {
    const adminId = parseInt(req.params.id);
    await adminService.setAdminStatus(adminId, 'blocked');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/management/admins/:id/unblock
async function unblockAdmin(req, res, next) {
  try {
    const adminId = parseInt(req.params.id);
    await adminService.setAdminStatus(adminId, 'active');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/management/admins/:id
async function deleteAdmin(req, res, next) {
  try {
    const adminId = parseInt(req.params.id);
    await adminService.deleteAdmin(adminId);
    // record audit
    await auditService.log({
      admin_id: req.user.id,
      admin_name: req.user.first_name + ' ' + req.user.last_name,
      action: 'delete_admin',
      resource_type: 'admin',
      resource_id: adminId,
      route: req.originalUrl,
      method: req.method,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || '',
      status_code: 200,
      response_time_ms: 0
    }).catch(e=>{});
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/management/admins/:id/role
async function updateAdminRole(req, res, next) {
  try {
    const adminId = parseInt(req.params.id);
    const { role_level } = req.body;
    await adminService.changeAdminRole(adminId, role_level);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/management/admins/:id/resend-invite
async function resendInvite(req, res, next) {
  try {
    const adminId = parseInt(req.params.id);
    await adminService.resendInvitation(adminId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/management/admins/:id/verify-status
async function verifyStatus(req, res, next) {
  try {
    const adminId = parseInt(req.params.id);
    const status = await adminService.getVerificationStatus(adminId);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

// POST /api/admins - Create a new admin account
// Public route could be used for first admin, but we still protect to require super_admin
async function createAdmin(req, res, next) {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    const adminRole = role || 'admin';
    const newAdmin = await authService.registerAdmin(email, password, first_name, last_name, adminRole);
    // note: registerAdmin returns limited fields (id,email,role,first_name,last_name)
    res.status(201).json({ success: true, admin: newAdmin });
  } catch (err) {
    next(err);
  }
}

// GET /api/admins/:id - Get single admin by ID
async function getAdminById(req, res, next) {
  try {
    const adminId = parseInt(req.params.id);
    const admin = await adminService.getAdminById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    next(err);
  }
}
// PUT /api/admins/:id - Update admin details (name, role, password)
async function updateAdmin(req, res, next) {
  try {
    const adminId = parseInt(req.params.id);
    const { first_name, last_name, role, password } = req.body;
    const updates = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (role !== undefined) updates.role = role;
    if (password) {
      // hash password before saving
      const bcrypt = await import('bcryptjs');
      updates.password = await bcrypt.hash(password, 10);
    }
    const updated = await adminService.updateAdmin(adminId, updates);
    res.json({ success: true, admin: updated });
  } catch (err) {
    next(err);
  }
}
// POST /api/admins/:id/permissions - Update admin permissions
async function updateAdminPermissions(req, res, next) {
  try {
    const adminId = parseInt(req.params.id);
    const { permissions } = req.body;
    const updated = await adminService.updateAdminPermissions(adminId, permissions);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/management/admins/export/stats
async function exportStats(req, res, next) {
  try {
    const stats = await adminService.getAdminStatistics();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/management/admins/export/json
async function exportJSON(req, res, next) {
  try {
    const admins = await adminService.listAdmins(req.query);
    res.json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
}

// helpers for simple text exports
function makeCSV(records) {
  if (!records || records.length === 0) return '';
  const keys = Object.keys(records[0]);
  const lines = [keys.join(',')];
  for (const r of records) {
    lines.push(keys.map(k => JSON.stringify(r[k] ?? '')).join(','));
  }
  return lines.join('\n');
}

// POST /api/admin/management/admins/export/pdf
async function exportPDF(req, res, next) {
  try {
    // as a placeholder we will send CSV with pdf header
    const admins = await adminService.listAdmins(req.query);
    const csv = makeCSV(admins);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="admins.pdf"');
    res.send(Buffer.from(csv));
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/management/admins/export/excel
async function exportExcel(req, res, next) {
  try {
    const admins = await adminService.listAdmins(req.query);
    const csv = makeCSV(admins);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="admins.xlsx"');
    res.send(Buffer.from(csv));
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/profile - Get current admin profile (me)
async function getCurrentAdminProfile(req, res, next) {
  try {
    const adminId = req.user.id;
    const admin = await adminService.getAdminById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/profile - Update current admin profile (me)
async function updateCurrentAdminProfile(req, res, next) {
  try {
    const adminId = req.user.id;
    const { first_name, last_name, phone, country, profile_photo, password } = req.body;
    const updates = {};
    
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (phone !== undefined) updates.phone = phone;
    if (country !== undefined) updates.country = country;
    if (profile_photo !== undefined) updates.profile_photo = profile_photo;
    
    if (password) {
      const bcrypt = await import('bcryptjs');
      updates.password = await bcrypt.hash(password, 10);
    }
    
    const updated = await adminService.updateAdmin(adminId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export {
  listAdmins,
  blockAdmin,
  unblockAdmin,
  deleteAdmin,
  updateAdminRole,
  resendInvite,
  verifyStatus,
  getAdminById,
  createAdmin,
  updateAdmin,
  updateAdminPermissions,
  exportStats,
  exportJSON,
  exportPDF,
  exportExcel,
  getCurrentAdminProfile,
  updateCurrentAdminProfile
};
