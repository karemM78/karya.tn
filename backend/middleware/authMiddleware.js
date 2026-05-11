const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      try {
        const user = await userRepository.findById(decoded.id);

        if (user) {
          // Map Oracle fields to expected format
          req.user = {
            _id: user.ID,
            name: user.NAME,
            email: user.EMAIL,
            role: user.ROLE,
            isAdmin: user.IS_ADMIN === 1
          };
        } else {
          // If user not found in DB but token is valid, use token data as fallback
          req.user = {
            _id: decoded.id,
            role: decoded.role || 'client',
            isAdmin: decoded.isAdmin || false,
            name: decoded.name || '',
            email: decoded.email || ''
          };
        }
      } catch (dbError) {
        console.error('Database error in protect middleware, using token fallback:', dbError.message);
        // Fallback to token data if DB is down
        req.user = {
          _id: decoded.id,
          role: decoded.role || 'client',
          isAdmin: decoded.isAdmin || false,
          name: decoded.name || '',
          email: decoded.email || ''
        };
      }

      next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const owner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an owner' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin only' });
  }
};

module.exports = { protect, owner, admin };
