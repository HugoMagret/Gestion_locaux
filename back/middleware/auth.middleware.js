const jwt = require('jsonwebtoken');

// A secret key should normally be in environment variables (process.env.JWT_SECRET)
// For this project, we'll use a hardcoded fallback to ensure it works immediately
const JWT_SECRET = process.env.JWT_SECRET || 'locaux-super-secret-key-2024';

const verifyToken = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space (Bearer <token>)
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    
    // Verify the token
    jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
      }
      
      // Add user to request
      req.user = decoded;
      next();
    });
  } else {
    // Unauthorized
    res.status(401).json({ success: false, message: 'Authentification requise. Token manquant.' });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Action réservée aux administrateurs' });
    }
    next();
  });
};

module.exports = { verifyToken, verifyAdmin, JWT_SECRET };
