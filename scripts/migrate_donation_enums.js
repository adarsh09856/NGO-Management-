/**
 * DB Migration: Extend donations table enum columns to support
 * - payment_status: 'pending_verification', 'partially_refunded'
 * - payment_method: 'upi_qr'
 */
const { pool } = require('../config/db');

async function migrate() {
  console.log('[Migration] Extending donations table enums...');

  await pool.query(`
    ALTER TABLE donations 
    MODIFY COLUMN payment_status ENUM(
      'pending',
      'pending_verification',
      'completed',
      'failed',
      'refunded',
      'partially_refunded'
    ) NOT NULL DEFAULT 'pending'
  `);
  console.log('[Migration] payment_status enum updated');

  await pool.query(`
    ALTER TABLE donations 
    MODIFY COLUMN payment_method ENUM(
      'online_gateway',
      'upi_qr',
      'bank_transfer',
      'cash',
      'cheque_dd',
      'other'
    ) NOT NULL DEFAULT 'online_gateway'
  `);
  console.log('[Migration] payment_method enum updated');

  console.log('[Migration] Done. DB schema is production-ready.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[Migration Error]:', err.message);
  process.exit(1);
});
