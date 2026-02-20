/**
 * Admin Routes with RBAC Protection
 * All routes require admin authentication and appropriate permissions
 */

import { Router } from 'express';
import { verifyAdminToken, checkPermission, requireSuperAdmin } from '../middleware/adminAuth.js';

// Import controllers
import * as adminController from '../controllers/admin.controller.js';
import * as dashboardController from '../controllers/admin-dashboard.controller.js';
import * as usersController from '../controllers/admin-users.controller.js';
import * as uploadsController from '../controllers/admin-uploads.controller.js';
import * as healthController from '../controllers/admin-health.controller.js';

const router = Router();

// ============================================================================
// AUTHENTICATION & PERMISSIONS VERIFICATION
// ============================================================================

// Apply authentication middleware to all admin routes
router.use(verifyAdminToken);

// ============================================================================
// DASHBOARD MANAGEMENT
// ============================================================================

// Tableau de Bord - Access point, requires perm_dashboard
router.get('/dashboard', 
  checkPermission('perm_dashboard'),
  healthController.getSystemHealth
);

router.get('/dashboard/services', 
  checkPermission('perm_dashboard'),
  healthController.getServiceStatus
);

router.get('/dashboard/metrics', 
  checkPermission('perm_dashboard'),
  healthController.getApplicationMetrics
);

router.get('/dashboard/database', 
  checkPermission('perm_dashboard'),
  healthController.getDatabaseStats
);

// Health check for external probes
router.get('/health', healthController.getSystemHealth);
router.get('/health/live', healthController.livenessProbe);
router.get('/health/ready', healthController.readinessProbe);

// ============================================================================
// ADMIN MANAGEMENT (Super Admin only)
// ============================================================================

router.get('/admins', 
  requireSuperAdmin,
  adminController.listAdmins
);

router.get('/admins/:id', 
  requireSuperAdmin,
  adminController.getAdmin
);

router.post('/admins', 
  requireSuperAdmin,
  adminController.createAdmin
);

router.patch('/admins/:id', 
  requireSuperAdmin,
  adminController.updateAdmin
);

router.delete('/admins/:id', 
  requireSuperAdmin,
  adminController.deleteAdmin
);

router.put('/admins/:id/permissions', 
  requireSuperAdmin,
  adminController.updateAdminPermissions
);

// Get roles and permissions
router.get('/roles', 
  requireSuperAdmin,
  adminController.getRoles
);

router.get('/permissions', 
  checkPermission('perm_admin_management'),
  adminController.getPermissions
);

// Audit logs
router.get('/audit-logs', 
  checkPermission('perm_admin_management'),
  adminController.getAuditLogs
);

// ============================================================================
// JOBS MANAGEMENT
// ============================================================================

router.get('/jobs', 
  checkPermission('perm_jobs'),
  dashboardController.listJobs
);

router.post('/jobs', 
  checkPermission('perm_jobs'),
  dashboardController.createJob
);

router.patch('/jobs/:id', 
  checkPermission('perm_jobs'),
  dashboardController.updateJob
);

router.delete('/jobs/:id', 
  checkPermission('perm_jobs'),
  dashboardController.deleteJob
);

// ============================================================================
// TRAININGS MANAGEMENT
// ============================================================================

router.get('/trainings', 
  checkPermission('perm_trainings'),
  dashboardController.listTrainings
);

router.post('/trainings', 
  checkPermission('perm_trainings'),
  dashboardController.createTraining
);

router.patch('/trainings/:id', 
  checkPermission('perm_trainings'),
  dashboardController.updateTraining
);

router.delete('/trainings/:id', 
  checkPermission('perm_trainings'),
  dashboardController.deleteTraining
);

// ============================================================================
// FAQ MANAGEMENT
// ============================================================================

router.get('/faqs', 
  checkPermission('perm_faq'),
  dashboardController.listFAQs
);

router.post('/faqs', 
  checkPermission('perm_faq'),
  dashboardController.createFAQ
);

router.patch('/faqs/:id', 
  checkPermission('perm_faq'),
  dashboardController.updateFAQ
);

router.delete('/faqs/:id', 
  checkPermission('perm_faq'),
  dashboardController.deleteFAQ
);

// ============================================================================
// STATIC PAGES (GESTION ÉDITORIALE)
// ============================================================================

router.get('/pages', 
  checkPermission('perm_editoriale'),
  dashboardController.listStaticPages
);

router.get('/pages/:slug', 
  dashboardController.getStaticPage // Public access for reading
);

router.patch('/pages/:slug', 
  checkPermission('perm_editoriale'),
  dashboardController.updateStaticPage
);

// ============================================================================
// USERS MANAGEMENT
// ============================================================================

router.get('/users', 
  checkPermission('perm_users'),
  usersController.listUsers
);

router.get('/users/:id', 
  checkPermission('perm_users'),
  usersController.getUser
);

router.patch('/users/:id/block', 
  checkPermission('perm_users'),
  usersController.blockUser
);

router.patch('/users/:id/unblock', 
  checkPermission('perm_users'),
  usersController.unblockUser
);

router.delete('/users/:id', 
  checkPermission('perm_users'),
  usersController.deleteUser
);

// ============================================================================
// SERVICE CATALOGS & SERVICES MANAGEMENT
// ============================================================================

router.get('/service-catalogs', 
  checkPermission('perm_services'),
  usersController.listServiceCatalogs
);

router.post('/service-catalogs', 
  checkPermission('perm_services'),
  usersController.createServiceCatalog
);

router.patch('/service-catalogs/:id', 
  checkPermission('perm_services'),
  usersController.updateServiceCatalog
);

router.delete('/service-catalogs/:id', 
  checkPermission('perm_services'),
  usersController.deleteServiceCatalog
);

// Services
router.get('/services', 
  checkPermission('perm_services'),
  usersController.listServices
);

router.post('/services', 
  checkPermission('perm_services'),
  usersController.createService
);

router.patch('/services/:id', 
  checkPermission('perm_services'),
  usersController.updateService
);

router.delete('/services/:id', 
  checkPermission('perm_services'),
  usersController.deleteService
);

// Service Ratings
router.patch('/services/:service_id/rating', 
  checkPermission('perm_services'),
  usersController.updateServiceRating
);

// Promotion Badges
router.post('/badges', 
  checkPermission('perm_services'),
  usersController.createPromotionBadge
);

router.patch('/badges/:id', 
  checkPermission('perm_services'),
  usersController.updatePromotionBadge
);

router.delete('/badges/:id', 
  checkPermission('perm_services'),
  usersController.deletePromotionBadge
);

// ============================================================================
// FILE UPLOADS (Multer + Sharp)
// ============================================================================

router.post('/upload', 
  uploadsController.upload.single('file'),
  uploadsController.uploadFile
);

router.post('/upload-multiple', 
  uploadsController.upload.array('files', 10),
  uploadsController.uploadMultipleFiles
);

router.post('/thumbnail', 
  checkPermission('perm_jobs') || checkPermission('perm_trainings'),
  uploadsController.createThumbnail
);

router.delete('/upload/:filePath', 
  uploadsController.deleteFile
);

router.get('/upload-stats', 
  requireSuperAdmin,
  uploadsController.getUploadStats
);

export default router;
