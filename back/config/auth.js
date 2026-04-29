const crypto = require('crypto');

/**
 * Hash a password using Node.js built-in crypto module (scrypt)
 */
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

/**
 * Verify a password against a hash
 */
const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');
  const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return derivedHash === hash;
};

module.exports = {
  hashPassword,
  verifyPassword
};
