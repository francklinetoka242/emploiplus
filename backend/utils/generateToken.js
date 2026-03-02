import jwt from 'jsonwebtoken';

// generate a JWT token for a user
function generateToken(userId) {
  // payload contains user info to encode in token
  const payload = {
    id: userId,
    iat: Math.floor(Date.now() / 1000), // issued at timestamp
  };

  // get JWT secret and expiration from environment variables
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // sign token with secret and expiration
  const token = jwt.sign(payload, secret, { expiresIn });

  return token;
}

// verify a JWT token
function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // verify and decode token
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (err) {
    console.error('Token verification failed:', err.message);
    throw err;
  }
}

export { generateToken, verifyToken };
