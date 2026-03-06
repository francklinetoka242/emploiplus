/**
 * Audit Logging Middleware
 * Automatically logs certain admin actions to the audit_logs table
 */

import { createAuditLog } from '../models/audit-log.model.js';

// Map of route patterns to audit configuration
const auditConfig = {
  // Jobs management
  'POST:/api/admin/jobs': {
    action: 'CREATE_JOB',
    module: 'Offres d\'emploi',
    details: (req) => `A créé une nouvelle offre d'emploi: ${req.body?.title || 'Sans titre'}`,
  },
  'PUT:/api/admin/jobs/:id': {
    action: 'UPDATE_JOB',
    module: 'Offres d\'emploi',
    details: (req) => `A modifié l'offre d'emploi #${req.params?.id}`,
  },
  'DELETE:/api/admin/jobs/:id': {
    action: 'DELETE_JOB',
    module: 'Offres d\'emploi',
    details: (req) => `A supprimé l'offre d'emploi #${req.params?.id}`,
  },

  // Formations management
  'POST:/api/admin/formations': {
    action: 'CREATE_FORMATION',
    module: 'Formations',
    details: (req) => `A créé une nouvelle formation: ${req.body?.title || 'Sans titre'}`,
  },
  'PUT:/api/admin/formations/:id': {
    action: 'UPDATE_FORMATION',
    module: 'Formations',
    details: (req) => `A modifié la formation #${req.params?.id}`,
  },
  'DELETE:/api/admin/formations/:id': {
    action: 'DELETE_FORMATION',
    module: 'Formations',
    details: (req) => `A supprimé la formation #${req.params?.id}`,
  },

  // User management
  'POST:/api/admin/users/:id/block': {
    action: 'BLOCK_USER',
    module: 'Utilisateurs',
    details: (req) => `A bloqué l'utilisateur #${req.params?.id}`,
  },
  'POST:/api/admin/users/:id/unblock': {
    action: 'UNBLOCK_USER',
    module: 'Utilisateurs',
    details: (req) => `A débloqué l'utilisateur #${req.params?.id}`,
  },
  'DELETE:/api/admin/users/:id': {
    action: 'DELETE_USER',
    module: 'Utilisateurs',
    details: (req) => `A supprimé l'utilisateur #${req.params?.id}`,
  },

  // Admin management
  'POST:/api/admin/management/admins': {
    action: 'CREATE_ADMIN',
    module: 'Administrateurs',
    details: (req) => `A créé un nouvel administrateur: ${req.body?.email}`,
  },
  'PUT:/api/admin/management/admins/:id': {
    action: 'UPDATE_ADMIN',
    module: 'Administrateurs',
    details: (req) => `A modifié l'administrateur #${req.params?.id}`,
  },
  'DELETE:/api/admin/management/admins/:id': {
    action: 'DELETE_ADMIN',
    module: 'Administrateurs',
    details: (req) => `A supprimé l'administrateur #${req.params?.id}`,
  },
  'POST:/api/admin/management/admins/:id/block': {
    action: 'BLOCK_ADMIN',
    module: 'Administrateurs',
    details: (req) => `A bloqué l'administrateur #${req.params?.id}`,
  },
  'POST:/api/admin/management/admins/:id/unblock': {
    action: 'UNBLOCK_ADMIN',
    module: 'Administrateurs',
    details: (req) => `A débloqué l'administrateur #${req.params?.id}`,
  },

  // FAQ management
  'POST:/api/admin/faq': {
    action: 'CREATE_FAQ',
    module: 'FAQ',
    details: (req) => `A créé une nouvelle FAQ: ${req.body?.question || 'Sans question'}`,
  },
  'PUT:/api/admin/faq/:id': {
    action: 'UPDATE_FAQ',
    module: 'FAQ',
    details: (req) => `A modifié la FAQ #${req.params?.id}`,
  },
  'DELETE:/api/admin/faq/:id': {
    action: 'DELETE_FAQ',
    module: 'FAQ',
    details: (req) => `A supprimé la FAQ #${req.params?.id}`,
  },

  // Services management
  'POST:/api/admin/services': {
    action: 'CREATE_SERVICE',
    module: 'Services',
    details: (req) => `A créé un nouveau service: ${req.body?.name || 'Sans nom'}`,
  },
  'PUT:/api/admin/services/:id': {
    action: 'UPDATE_SERVICE',
    module: 'Services',
    details: (req) => `A modifié le service #${req.params?.id}`,
  },
  'DELETE:/api/admin/services/:id': {
    action: 'DELETE_SERVICE',
    module: 'Services',
    details: (req) => `A supprimé le service #${req.params?.id}`,
  },

  // Documentations management
  'POST:/api/admin/documentations': {
    action: 'CREATE_DOCUMENTATION',
    module: 'Documentations',
    details: (req) => `A créé une nouvelle documentation: ${req.body?.name}`,
  },
  'PUT:/api/admin/documentations/:id': {
    action: 'UPDATE_DOCUMENTATION',
    module: 'Documentations',
    details: (req) => `A modifié la documentation #${req.params?.id}`,
  },
  'DELETE:/api/admin/documentations/:id': {
    action: 'DELETE_DOCUMENTATION',
    module: 'Documentations',
    details: (req) => `A supprimé la documentation #${req.params?.id}`,
  },

  // Notifications management
  'POST:/api/admin/site-notifications': {
    action: 'CREATE_NOTIFICATION',
    module: 'Notifications',
    details: (req) => `A créé une nouvelle notification`,
  },
  'PUT:/api/admin/site-notifications/:id': {
    action: 'UPDATE_NOTIFICATION',
    module: 'Notifications',
    details: (req) => `A modifié la notification #${req.params?.id}`,
  },
  'DELETE:/api/admin/site-notifications/:id': {
    action: 'DELETE_NOTIFICATION',
    module: 'Notifications',
    details: (req) => `A supprimé la notification #${req.params?.id}`,
  },
};

/**
 * Get client IP address from request
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'Unknown'
  );
}

/**
 * Get matching audit config for the current request
 */
function getAuditConfig(req) {
  const key = `${req.method}:${req.path.split('?')[0]}`; // Remove query params
  return auditConfig[key];
}

/**
 * Check if route is a write operation (not a GET/HEAD)
 */
function isWriteOperation(req) {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
}

/**
 * Audit logging middleware
 * Should be placed AFTER the response is sent
 */
export async function auditLoggingMiddleware(req, res, next) {
  // Store original json to capture status code
  const originalJson = res.json;

  res.json = function (data) {
    // Only log write operations that were successful
    if (isWriteOperation(req) && res.statusCode < 400) {
      const config = getAuditConfig(req);

      if (config) {
        const adminData = req.admin || req.user;

        if (adminData) {
          // Schedule async logging without blocking response
          setImmediate(async () => {
            try {
              await createAuditLog({
                adminId: adminData.id,
                adminName: adminData.first_name
                  ? `${adminData.first_name} ${adminData.last_name || ''}`
                  : adminData.email,
                action: config.action,
                module: config.module,
                details: typeof config.details === 'function'
                  ? config.details(req)
                  : config.details,
                ipAddress: getClientIp(req),
              });
            } catch (error) {
              console.error('Error logging audit:', error);
              // Don't throw - we don't want logging errors to affect the response
            }
          });
        }
      }
    }

    // Call original json method
    return originalJson.call(this, data);
  };

  next();
}

export default auditLoggingMiddleware;
