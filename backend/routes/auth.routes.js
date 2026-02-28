const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// ---------------------------------------------------------------------------
// Public authentication routes
// ---------------------------------------------------------------------------

// POST /register
// Accepts email and password in body. Delegates to auth.controller.register
// which handles validation, hashing, and user creation.
router.post('/register', register);

// POST /login
// Accepts email and password in body. Delegates to auth.controller.login
// which verifies credentials and returns a JWT + user info.
router.post('/login', login);

module.exports = router;
