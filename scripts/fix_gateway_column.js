const { pool } = require('../config/db');

async function migrate() {
  console.log('--- Altering payment_idempotency_log gateway column ---');
  try {
    await pool.query(`
      ALTER TABLE payment_idempotency_log 
      MODIFY COLUMN gateway VARCHAR(50) NOT NULL DEFAULT 'gateway'
    `);
    console.log('✅ payment_idempotency_log.gateway successfully altered to VARCHAR(50)');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
  process.exit(0);
}

migrate();
