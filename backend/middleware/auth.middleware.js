const jwt = require('jsonwebtoken');

// middleware to authenticate incoming requests using a JWT in Authorization header
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // missing or malformed header
    return res.status(401).json({ success: false, message: 'Unauthorized: token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // verify token using secret from environment
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach user info to request object for downstream handlers
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT verification failed', err);
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
  }
}

module.exports = { authenticateJWT };
