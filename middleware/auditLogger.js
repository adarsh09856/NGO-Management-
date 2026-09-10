const crypto = require('crypto');
const { pool } = require('../config/db');

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// Calculate deterministic cryptographic record hash
function calculateRecordHash({ prevHash, userId, ipAddress, userAgent, module, action, recordId, detailsJson, timestamp }) {
  const payload = [
    prevHash || GENESIS_HASH,
    userId || 'ANON',
    ipAddress || '127.0.0.1',
    userAgent || 'System',
    module || '',
    action || '',
    String(recordId || ''),
    detailsJson || '{}',
    timestamp ? new Date(timestamp).toISOString() : ''
  ].join('|');

  return crypto.createHash('sha256').update(payload).digest('hex');
}

// Helper to log audit events into the database with cryptographic hash chaining
async function logAudit({ userId, ipAddress, userAgent, module, action, recordId, details }) {
  try {
    const detailsJson = typeof details === 'object' ? JSON.stringify(details) : String(details || '{}');
    const now = new Date();
    const timestampStr = now.toISOString().slice(0, 19).replace('T', ' ');

    let prevHash = GENESIS_HASH;
    try {
      const [lastRows] = await pool.query(
        `SELECT record_hash FROM audit_logs ORDER BY id DESC LIMIT 1`
      );
      if (lastRows.length > 0 && lastRows[0].record_hash) {
        prevHash = lastRows[0].record_hash;
      }
    } catch (e) {
      // If table or column not yet migrated or offline, use GENESIS
    }

    const recordHash = calculateRecordHash({
      prevHash,
      userId,
      ipAddress,
      userAgent,
      module,
      action,
      recordId,
      detailsJson,
      timestamp: now
    });

    await pool.query(
      `INSERT INTO audit_logs (user_id, ip_address, user_agent, module, action, record_id, details, prev_hash, record_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, ipAddress || '127.0.0.1', userAgent || 'System', module, action, String(recordId || ''), detailsJson, prevHash, recordHash, timestampStr]
    );

    return { prevHash, recordHash };
  } catch (error) {
    console.error('[Audit Log Error] Failed to write audit entry:', error.message);
    return null;
  }
}

// Verify integrity of the audit log hash chain
async function verifyAuditLogChain() {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, ip_address, user_agent, module, action, record_id, details, prev_hash, record_hash, created_at
       FROM audit_logs ORDER BY id ASC`
    );

    let expectedPrevHash = GENESIS_HASH;
    let tamperedRecords = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.prev_hash && row.prev_hash !== expectedPrevHash) {
        tamperedRecords.push({
          id: row.id,
          error: 'PREV_HASH_MISMATCH',
          expectedPrevHash,
          actualPrevHash: row.prev_hash
        });
      }

      if (row.record_hash) {
        const calculated = calculateRecordHash({
          prevHash: row.prev_hash || expectedPrevHash,
          userId: row.user_id,
          ipAddress: row.ip_address,
          userAgent: row.user_agent,
          module: row.module,
          action: row.action,
          recordId: row.record_id,
          detailsJson: typeof row.details === 'object' ? JSON.stringify(row.details) : String(row.details || '{}'),
          timestamp: row.created_at
        });

        if (calculated !== row.record_hash) {
          tamperedRecords.push({
            id: row.id,
            error: 'RECORD_HASH_MISMATCH',
            expectedRecordHash: calculated,
            actualRecordHash: row.record_hash
          });
        }
        expectedPrevHash = row.record_hash;
      } else {
        expectedPrevHash = row.prev_hash || expectedPrevHash;
      }
    }

    return {
      isValid: tamperedRecords.length === 0,
      totalEntries: rows.length,
      tamperedCount: tamperedRecords.length,
      tamperedRecords
    };
  } catch (error) {
    console.error('[Audit Verification Error]:', error.message);
    return { isValid: false, error: error.message };
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
  GENESIS_HASH,
  calculateRecordHash,
  logAudit,
  verifyAuditLogChain,
  auditMiddleware
};
