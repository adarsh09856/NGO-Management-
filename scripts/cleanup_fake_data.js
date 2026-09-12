const { pool } = require('../config/db');

async function cleanup() {
  console.log('--- PURGING TEST & FAKE DATA FROM DRODUL_DB ---');

  // 1. Receipts & Donations
  await pool.query(`DELETE FROM money_receipts WHERE id > 0`);
  await pool.query(`DELETE FROM donations WHERE id > 0`);
  await pool.query(`ALTER TABLE donations AUTO_INCREMENT = 1`);
  await pool.query(`ALTER TABLE money_receipts AUTO_INCREMENT = 1`);
  console.log('✅ Cleared all test donations and receipts.');

  // 2. Donors (Keep authentic IDs 1 to 6)
  await pool.query(`DELETE FROM donors WHERE id > 6`);
  await pool.query(`ALTER TABLE donors AUTO_INCREMENT = 7`);
  console.log('✅ Retained authentic donors (IDs 1-6), purged test donors.');

  // 3. Prayer Requests
  await pool.query(`DELETE FROM prayer_requests WHERE id > 0`);
  await pool.query(`ALTER TABLE prayer_requests AUTO_INCREMENT = 1`);
  console.log('✅ Cleared test prayer requests.');

  // 4. Contacts (Purge test emails)
  await pool.query(`DELETE FROM contacts WHERE email LIKE '%example.%' OR email LIKE '%devotee.pilgrim.%' OR email LIKE '%1789%'`);
  console.log('✅ Purged test contacts.');

  // 5. Payment Idempotency Logs
  await pool.query(`DELETE FROM payment_idempotency_log WHERE id > 0`);
  await pool.query(`ALTER TABLE payment_idempotency_log AUTO_INCREMENT = 1`);
  console.log('✅ Cleared payment idempotency logs.');

  // 6. Newsletter Subscribers (Purge test emails)
  await pool.query(`DELETE FROM newsletter_subscribers WHERE email LIKE '%example%' OR email LIKE '%1789%' OR email LIKE '%test%'`);
  console.log('✅ Purged test newsletter subscribers.');

  // 7. Event RSVPs (Purge test rsvps)
  await pool.query(`DELETE FROM event_rsvps WHERE guest_email LIKE '%example%' OR guest_email LIKE '%1789%' OR guest_name LIKE '%Test%'`);
  console.log('✅ Purged test event RSVPs.');

  console.log('\n🎉 ALL FAKE / TEST DATA CLEANED OUT SUCCESSFULLY.');
  process.exit(0);
}

cleanup().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
