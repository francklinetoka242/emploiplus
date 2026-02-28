const authService = require('../services/auth.service');
const AppError = require('../utils/AppError');

// Controller for admin registration
// expects { email, password } in request body
// returns 201 with the created user data
async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.registerAdmin(email, password);
    return res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

// Controller for admin login
// expects { email, password } in request body
// returns 200 with token and user information
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginAdmin(email, password);
    return res.status(200).json({ token, user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};
