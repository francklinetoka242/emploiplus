import jwt from 'jsonwebtoken';

// Middleware to verify JWT token (for both admin and user tokens)
// Extracts token from Authorization header (Bearer scheme)
// Sets req.user with decoded token data
// Does NOT enforce admin/user distinction (use requireAdmin or requireUser for that)
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT verification failed', err);
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
  }
}

// Middleware to verify JWT token AND enforce admin-only access
// Use this on routes that should only be accessible by admins
// SECURITY: Checks that token type is 'admin' to prevent user tokens from accessing admin routes
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // SECURITY: Verify this is an admin token (type='admin' or has role field)
    if (payload.type !== 'admin' && !payload.role) {
      return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
    }
    
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT verification failed', err);
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
  }
}

// Middleware generator to require specific admin roles
// Usage: router.post('/', requireAdmin, requireRoles('super_admin','admin_offres'), handler)
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    // req.user should already be set by authenticateJWT/requireAdmin
    const payload = req.user;
    if (!payload) {
      return res.status(401).json({ success: false, message: 'Unauthorized: token missing' });
    }

    let roles = [];
    if (payload.role) {
      if (Array.isArray(payload.role)) roles = payload.role;
      else roles = [payload.role];
    } else if (payload.roles) {
      roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
    }

    const permitted = allowedRoles.some(r => roles.includes(r));
    if (!permitted) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// Convenience middleware for highest-level admin (super_admin only)
function requireSuperAdmin(req, res, next) {
  // ensure they are an admin first
  requireAdmin(req, res, () => {
    const payload = req.user || {};
    const role = payload.role || payload.roles;
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes('super_admin')) {
      return res.status(403).json({ success: false, message: 'Forbidden: super_admin access required' });
    }
    next();
  });
}

// Middleware to verify JWT token AND enforce user-only access
// Use this on routes that should only be accessible by regular users
// SECURITY: Checks that token type is 'user' to prevent admin tokens from accessing user routes
function requireUser(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // SECURITY: Verify this is a user token (type='user' with user_type field)
    if (payload.type !== 'user' || !payload.user_type) {
      return res.status(403).json({ success: false, message: 'Forbidden: user access required' });
    }
    
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT verification failed', err);
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
  }
}

export {
  authenticateJWT,  // Generic token validation (accepts both admin and user tokens)
  requireAdmin,     // Admin-only routes
  requireUser,      // User-only routes
  requireRoles,     // Role-based admin access
  requireSuperAdmin // Super-admin only convenience helper
};
