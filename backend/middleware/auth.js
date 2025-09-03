const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
    const user = await User.findById(decoded.userId).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Only require email verification for regular users
    if (user.role === 'user' && !user.isVerified) {
      return res.status(401).json({ error: 'User not verified. Please complete phone verification.' });
    }

    // For staff and admin, check if password is set
    if ((user.role === 'staff' || user.role === 'admin') && !user.password) {
      return res.status(401).json({ error: 'Account not properly set up.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Middleware to check if user has admin role
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user has staff role
const staffAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Staff or admin privileges required.' });
  }
};

module.exports = {
  auth,
  adminAuth,
  staffAuth
};
