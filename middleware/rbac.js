// Role-Based Access Control (RBAC) Middleware

// Require specific role slug(s)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Super Admin has universal bypass
    if (req.user.role_slug === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role_slug)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

// Require specific permission (e.g., 'donations:create', 'receipts:void')
function requirePermission(moduleAction) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Super Admin bypass
    if (req.user.role_slug === 'super_admin') {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(moduleAction)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Missing required permission: ${moduleAction}`
      });
    }

    next();
  };
}

// Combinator: Require specific permission OR one of allowed roles
function requirePermissionOrRole(permission, ...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Super Admin has universal bypass
    if (req.user.role_slug === 'super_admin') {
      return next();
    }

    // Role check
    if (roles.includes(req.user.role_slug)) {
      return next();
    }

    // Specific permission check
    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires permission '${permission}' or role: ${roles.join(', ')}`
    });
  };
}

module.exports = {
  requireRole,
  requirePermission,
  requirePermissionOrRole
};
