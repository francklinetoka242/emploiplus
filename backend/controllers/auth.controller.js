import authService from '../services/auth.service.js';
import AppError from '../utils/AppError.js';

// Controller for admin registration
// expects { email, password } in request body
// returns 201 with the created user data
async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.registerAdmin(email, password);
    return res.status(201).json({ success: true, data: { admin: user } });
  } catch (error) {
    next(error);
  }
}

// Controller for admin login
// expects { email, password } in request body
// returns 200 with token and user information
async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginAdmin(email, password);
    return res.status(200).json({ success: true, data: { token, admin: user }, userType: 'admin' });
  } catch (error) {
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

export {
    register,
    loginAdmin,
    loginUser
};
