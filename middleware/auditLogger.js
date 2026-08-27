const { pool } = require('../config/db');

// Helper to log audit events into the database
async function logAudit({ userId, ipAddress, userAgent, module, action, recordId, details }) {
  try {
    const detailsJson = typeof details === 'object' ? JSON.stringify(details) : details;
    await pool.query(
      `INSERT INTO audit_logs (user_id, ip_address, user_agent, module, action, record_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, ipAddress || '127.0.0.1', userAgent || 'System', module, action, String(recordId || ''), detailsJson]
    );
  } catch (error) {
    console.error('[Audit Log Error] Failed to write audit entry:', error.message);
  }
}

// Middleware to automatically capture IP and user agent
function auditMiddleware(moduleName, actionName) {
  return async (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user.id : null;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const recordId = req.params.id || (data && data.data && data.data.id) || (data && data.id) || null;

        logAudit({
          userId,
          ipAddress,
          userAgent,
          module: moduleName,
          action: actionName,
          recordId,
          details: {
            method: req.method,
            path: req.originalUrl,
            params: req.params,
            bodySummary: req.body ? Object.keys(req.body) : []
          }
        });
      }
      return originalJson.apply(res, arguments);
    };
    next();
  };
}

module.exports = {
  logAudit,
  auditMiddleware
};
