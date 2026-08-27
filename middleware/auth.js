const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dpl_monastery_super_secure_jwt_secret_key_2026_bhutan';

// Authenticate JWT token and attach user + role info to request
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Please log in.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch fresh user record and role
    const [users] = await pool.query(
      `SELECT u.id, u.role_id, u.full_name, u.email, u.phone, u.avatar_url, u.status,
              r.name as role_name, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.status = 'active'`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User session invalid or account inactive.'
      });
    }

    const user = users[0];

    // Fetch user permissions
    const [permissions] = await pool.query(
      `SELECT p.module, p.action
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`,
      [user.role_id]
    );

    user.permissions = permissions.map(p => `${p.module}:${p.action}`);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
}

// Optional Auth (for endpoints that can be accessed publicly but attach user if logged in)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.query.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query(
      `SELECT u.id, u.role_id, u.full_name, u.email, u.phone, u.avatar_url, u.status,
              r.name as role_name, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.status = 'active'`,
      [decoded.userId]
    );
    if (users.length > 0) {
      req.user = users[0];
    }
  } catch (e) {
    req.user = null;
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  JWT_SECRET
};
