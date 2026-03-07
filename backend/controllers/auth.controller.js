import authService from '../services/auth.service.js';
import AppError from '../utils/AppError.js';

// Controller for admin registration
// expects { email, password, first_name, last_name, role } in request body
// returns 201 with the created user data
async function register(req, res, next) {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    // Default to super_admin if no role specified
    const adminRole = role || 'super_admin';
    const user = await authService.registerAdmin(email, password, first_name, last_name, adminRole);
    return res.status(201).json({ success: true, data: { admin: user } });
  } catch (error) {
    next(error);
  }
}

// Controller for admin login
// expects { email, password } in request body
// returns 200 with token and user information
// additionally records each attempt in login history
async function loginAdmin(req, res, next) {
  const { email, password } = req.body;
  try {
    const { token, user } = await authService.loginAdmin(email, password);

    // record successful login event (fire and forget)
    import('../services/login-history.service.js').then(mod => {
      mod.default.record({
        admin_id: user.id,
        admin_email: email,
        success: true,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || '',
        details: null
      });
    }).catch(()=>{});

    return res.status(200).json({ success: true, data: { token, admin: user }, userType: 'admin' });
  } catch (error) {
    // record failed login attempt
    import('../services/login-history.service.js').then(mod => {
      mod.default.record({
        admin_id: null,
        admin_email: email,
        success: false,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || '',
        details: { message: error.message }
      });
    }).catch(()=>{});

    next(error);
  }
}

// Controller for user login (candidates and companies)
async function loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.loginUser(email, password);
      return res.status(200).json({ success: true, data: { token, user }, userType: 'user' });
    } catch (error) {
      next(error);
    }
  }

// Controller for session verification
// Verifies that an admin's session is still valid after a page refresh
// Takes admin ID from the JWT token in the request
// Returns updated admin data from the database
async function verifySession(req, res, next) {
  try {
    // req.user should be set by the requireAdmin middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
    }

    const admin = await authService.verifyAdminSession(req.user.id);
    return res.status(200).json({ success: true, data: { admin } });
  } catch (error) {
    next(error);
  }
}

export {
    register,
    loginAdmin,
    loginUser,
    verifySession
};
