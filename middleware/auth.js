const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dpl_monastery_super_secure_jwt_secret_key_2026_bhutan';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dpl_monastery_super_secure_refresh_secret_key_2026_bhutan';

// Hash token with SHA-256 for secure database storage
function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

// Authenticate JWT token and attach user + role info to request
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token && req.cookies) {
      token = req.cookies.dpl_token || req.cookies.token || req.cookies.accessToken;
    }

    if (!token && req.query) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Please log in.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Authentication token has expired. Please refresh token or log in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }

    // Fetch user record using SELECT u.* so missing optional columns never cause SQL errors
    let users;
    try {
      [users] = await pool.query(
        `SELECT u.*, r.name as role_name, r.slug as role_slug
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = ? AND u.status = 'active'`,
        [decoded.userId || decoded.id]
      );
    } catch (dbErr) {
      console.error('[Auth] Database query error in authenticateToken:', dbErr.message);
      return res.status(500).json({ success: false, message: 'Database error during authentication.' });
    }

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User session invalid or account inactive.'
      });
    }

    const user = { ...users[0] };
    user.two_factor_enabled = Boolean(user.two_factor_enabled);
    user.must_change_password = Boolean(user.must_change_password);

    // Fetch user permissions safely
    try {
      const [permissions] = await pool.query(
        `SELECT p.module, p.action
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?`,
        [user.role_id]
      );
      user.permissions = permissions.map(p => `${p.module}:${p.action}`);
    } catch (permErr) {
      user.permissions = [];
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth] Unexpected error in authenticateToken:', error);
    return res.status(500).json({ success: false, message: 'Internal authentication error.' });
  }
}

// Optional Auth (for endpoints that can be accessed publicly but attach user if logged in)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token && req.cookies) {
    token = req.cookies.dpl_token || req.cookies.token || req.cookies.accessToken;
  }

  if (!token && req.query) {
    token = req.query.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query(
      `SELECT u.*, r.name as role_name, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.status = 'active'`,
      [decoded.userId]
    );
    if (users.length > 0) {
      const user = { ...users[0] };
      user.two_factor_enabled = Boolean(user.two_factor_enabled);
      user.must_change_password = Boolean(user.must_change_password);
      req.user = user;
    }
  } catch (e) {
    req.user = null;
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  hashToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};
