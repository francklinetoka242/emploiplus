const bcrypt = require('bcryptjs');

// hash a plain text password using bcryptjs
// uses salt rounds to increase computation time and security
async function hashPassword(password) {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    // number of salt rounds (higher = more secure but slower)
    const saltRounds = 10;

    // generate salt and hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return hashedPassword;
  } catch (err) {
    console.error('hashPassword error:', err);
    throw err;
  }
}

// compare a plain text password with a hashed password
// returns true if passwords match, false otherwise
async function comparePassword(password, hashedPassword) {
  try {
    if (!password || !hashedPassword) {
      throw new Error('Password and hashed password are required');
    }

    // bcrypt.compare handles salt extraction internally
    const isMatch = await bcrypt.compare(password, hashedPassword);

    return isMatch;
  } catch (err) {
    console.error('comparePassword error:', err);
    throw err;
  }
}

module.exports = {
  hashPassword,
  comparePassword,
};
