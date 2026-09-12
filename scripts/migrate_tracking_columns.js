const { pool } = require('../config/db');

async function migrateTracking() {
  console.log('[Migration] Checking tracking columns...');

  const [dCols] = await pool.query("SHOW COLUMNS FROM donations LIKE 'tracking_id'");
  if (dCols.length === 0) {
    await pool.query("ALTER TABLE donations ADD COLUMN tracking_id VARCHAR(60) NULL UNIQUE AFTER receipt_number");
    console.log('[Migration] Added tracking_id to donations');
  } else {
    console.log('[Migration] tracking_id already in donations');
  }

  const [pCols] = await pool.query("SHOW COLUMNS FROM prayer_requests LIKE 'tracking_id'");
  if (pCols.length === 0) {
    await pool.query("ALTER TABLE prayer_requests ADD COLUMN tracking_id VARCHAR(60) NULL UNIQUE AFTER id");
    console.log('[Migration] Added tracking_id to prayer_requests');
  } else {
    console.log('[Migration] tracking_id already in prayer_requests');
  }

  const [pDonCols] = await pool.query("SHOW COLUMNS FROM prayer_requests LIKE 'donation_id'");
  if (pDonCols.length === 0) {
    await pool.query("ALTER TABLE prayer_requests ADD COLUMN donation_id INT(11) NULL AFTER receipt_id");
    console.log('[Migration] Added donation_id to prayer_requests');
  } else {
    console.log('[Migration] donation_id already in prayer_requests');
  }

  const [pUtrCols] = await pool.query("SHOW COLUMNS FROM prayer_requests LIKE 'transaction_ref'");
  if (pUtrCols.length === 0) {
    await pool.query("ALTER TABLE prayer_requests ADD COLUMN transaction_ref VARCHAR(100) NULL AFTER offering_currency");
    console.log('[Migration] Added transaction_ref to prayer_requests');
  } else {
    console.log('[Migration] transaction_ref already in prayer_requests');
  }

  // Update prayer_requests payment_status enum to support pending_verification
  await pool.query(`
    ALTER TABLE prayer_requests 
    MODIFY COLUMN payment_status ENUM('unpaid','pending_verification','paid') 
    DEFAULT 'pending_verification'
  `);
  console.log('[Migration] Updated prayer_requests payment_status enum');

  console.log('[Migration] Tracking columns migration complete.');
  process.exit(0);
}

migrateTracking().catch(err => {
  console.error('[Migration Error]:', err.message);
  process.exit(1);
});
