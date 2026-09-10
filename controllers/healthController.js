const { pool } = require('../config/db');

/**
 * Health & Operational Diagnostics Controller
 * Provides uptime, memory usage, database connectivity & latency check
 */
async function getHealth(req, res) {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = null;
  let dbError = null;

  try {
    const dbPingStart = Date.now();
    await pool.query('SELECT 1');
    dbLatencyMs = Date.now() - dbPingStart;
  } catch (err) {
    dbStatus = 'unreachable';
    dbError = err.message;
  }

  const memoryUsage = process.memoryUsage();
  const isHealthy = dbStatus === 'healthy';

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100
      }
    },
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      error: dbError
    },
    responseTimeMs: Date.now() - startTime
  };

  return res.status(isHealthy ? 200 : 503).json(healthData);
}

module.exports = {
  getHealth
};
