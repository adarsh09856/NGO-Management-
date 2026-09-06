/**
 * Drodul Phendey Ling Monastery & NGO Management System
 * Comprehensive Integration & Security Assertions Test Suite
 * 
 * Verifies:
 * 1. Cryptographic Razorpay Signature verification (tamper rejection with 400)
 * 2. Webhook HMAC timing-safe verification (tamper rejection with 400)
 * 3. RBAC requirePermissionOrRole security logic
 * 4. Zero-corruption financial guards (donor & campaign deletion blocks)
 * 5. Root super-admin and self-deletion prevention
 * 6. Database schema and void status support
 */

const assert = require('assert');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { pool } = require('../config/db');
const { requirePermissionOrRole } = require('../middleware/rbac');
const paymentController = require('../controllers/paymentController');

// Helper to construct mock Express req/res
function createMockContext(body = {}, headers = {}, rawBody = null, params = {}, user = null) {
  let statusCode = 200;
  let jsonResponse = null;
  let nextCalled = false;

  const req = {
    body,
    headers: { ...headers },
    rawBody: rawBody || Buffer.from(JSON.stringify(body)),
    params,
    user,
    ip: '127.0.0.1'
  };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
    getStatusCode: () => statusCode,
    getBody: () => jsonResponse
  };

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, isNextCalled: () => nextCalled };
}

async function runAllAssertions() {
  console.log('===============================================================');
  console.log('  DRODUL PHENDEY LING — INTEGRATION & SECURITY ASSERTION SUITE ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Error: ${err.message}\n`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // SECTION 1: PAYMENT GATEWAY CRYPTOGRAPHIC INTEGRITY
  // -------------------------------------------------------------
  console.log('[1/4] Testing Payment Gateway Security & HMAC Validation...');

  await test('verifyPayment rejects invalid or tampered Razorpay signature with 400', async () => {
    const { req, res } = createMockContext({
      razorpay_order_id: 'order_test_998877',
      razorpay_payment_id: 'pay_test_112233',
      razorpay_signature: 'tampered_malicious_signature_hash_value',
      donorName: 'Karma Wangchuk',
      donorEmail: 'karma@example.bt',
      amount: 1000
    });

    await paymentController.verifyPayment(req, res);

    assert.strictEqual(res.getStatusCode(), 400, 'Expected HTTP 400 on tampered signature');
    const body = res.getBody();
    assert.strictEqual(body.success, false, 'Expected success to be false');
    assert.match(body.message, /Invalid payment signature/i);
  });

  await test('verifyPayment rejects missing required payment parameters with 400', async () => {
    const { req, res } = createMockContext({
      razorpay_order_id: 'order_test_998877'
      // missing payment_id and signature
    });

    await paymentController.verifyPayment(req, res);

    assert.strictEqual(res.getStatusCode(), 400, 'Expected HTTP 400 on missing payment fields');
    assert.strictEqual(res.getBody().success, false);
  });

  await test('handleWebhook rejects request when x-razorpay-signature header is missing', async () => {
    const payload = JSON.stringify({ event: 'payment.captured', payload: {} });
    const { req, res } = createMockContext(JSON.parse(payload), {}, Buffer.from(payload));

    await paymentController.handleWebhook(req, res);

    assert.strictEqual(res.getStatusCode(), 400, 'Expected HTTP 400 on missing webhook signature');
    assert.match(res.getBody().message, /Missing.*signature/i);
  });

  await test('handleWebhook rejects request when HMAC signature is forged/tampered', async () => {
    const payload = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_fake' } } } });
    const fakeSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const { req, res } = createMockContext(
      JSON.parse(payload),
      { 'x-razorpay-signature': fakeSignature },
      Buffer.from(payload)
    );

    await paymentController.handleWebhook(req, res);

    assert.strictEqual(res.getStatusCode(), 400, 'Expected HTTP 400 on forged webhook signature');
    assert.match(res.getBody().message, /Invalid webhook signature/i);
  });

  // -------------------------------------------------------------
  // SECTION 2: RBAC PERMISSIONS & ROLE SECURITY
  // -------------------------------------------------------------
  console.log('\n[2/4] Testing RBAC requirePermissionOrRole Security Middleware...');

  await test('requirePermissionOrRole allows request if user has permitted role', () => {
    const middleware = requirePermissionOrRole('donations:create', 'super_admin', 'accountant');
    const { req, res, next, isNextCalled } = createMockContext(
      {}, {}, null, {},
      { id: 2, role_slug: 'accountant', permissions: [] }
    );

    middleware(req, res, next);

    assert.strictEqual(isNextCalled(), true, 'Expected next() to be called for allowed role');
    assert.strictEqual(res.getStatusCode(), 200);
  });

  await test('requirePermissionOrRole allows request if user has explicit permission string', () => {
    const middleware = requirePermissionOrRole('donations:create', 'super_admin');
    const { req, res, next, isNextCalled } = createMockContext(
      {}, {}, null, {},
      { id: 5, role_slug: 'coordinator', permissions: ['donations:create', 'donations:read'] }
    );

    middleware(req, res, next);

    assert.strictEqual(isNextCalled(), true, 'Expected next() to be called for user with explicit permission');
  });

  await test('requirePermissionOrRole blocks unauthorized role and missing permission with 403', () => {
    const middleware = requirePermissionOrRole('payroll:manage', 'super_admin', 'accountant');
    const { req, res, next, isNextCalled } = createMockContext(
      {}, {}, null, {},
      { id: 9, role_slug: 'volunteer', permissions: ['cms:read'] }
    );

    middleware(req, res, next);

    assert.strictEqual(isNextCalled(), false, 'Expected next() NOT to be called');
    assert.strictEqual(res.getStatusCode(), 403, 'Expected HTTP 403 Forbidden');
    assert.strictEqual(res.getBody().success, false);
  });

  await test('requirePermissionOrRole blocks unauthenticated request with 401', () => {
    const middleware = requirePermissionOrRole('payroll:manage', 'super_admin');
    const { req, res, next, isNextCalled } = createMockContext({}, {}, null, {}, null);

    middleware(req, res, next);

    assert.strictEqual(isNextCalled(), false, 'Expected next() NOT to be called');
    assert.strictEqual(res.getStatusCode(), 401, 'Expected HTTP 401 Unauthorized');
  });

  // -------------------------------------------------------------
  // SECTION 3: DATABASE SCHEMA & FINANCIAL INTEGRITY GUARDS
  // -------------------------------------------------------------
  console.log('\n[3/4] Testing Database Schema & Financial Protection Constraints...');

  await test('payroll_runs table supports status ENUM with void', async () => {
    const [cols] = await pool.query('DESCRIBE payroll_runs');
    const statusCol = cols.find(c => c.Field === 'status');
    assert.ok(statusCol, 'payroll_runs status column must exist');
    assert.ok(statusCol.Type.includes('void'), `payroll_runs status enum must include 'void', found: ${statusCol.Type}`);
  });

  await test('Database contains root super administrator (ID 1)', async () => {
    const [rows] = await pool.query('SELECT id, email, role_id FROM users WHERE id = 1');
    assert.strictEqual(rows.length, 1, 'Root user with ID 1 must exist');
    assert.ok(rows[0].email, 'Root user must have a valid email address');
  });

  await test('Active campaigns and donors exist in seed database', async () => {
    const [campaigns] = await pool.query('SELECT COUNT(*) as count FROM campaigns');
    const [donors] = await pool.query('SELECT COUNT(*) as count FROM donors');
    const [donations] = await pool.query('SELECT COUNT(*) as count FROM donations');

    assert.ok(campaigns[0].count > 0, 'Campaigns table should be populated');
    assert.ok(donors[0].count > 0, 'Donors table should be populated');
    assert.ok(donations[0].count > 0, 'Donations table should be populated');
    console.log(`    (Found: ${campaigns[0].count} campaigns, ${donors[0].count} donors, ${donations[0].count} donations)`);
  });

  await test('Donors with linked donations cannot be hard-deleted (Zero Corruption Policy)', async () => {
    // Find donor with donations
    const [donorWithDonation] = await pool.query(
      `SELECT d.id, d.full_name, COUNT(dn.id) as donation_count 
       FROM donors d 
       JOIN donations dn ON d.id = dn.donor_id 
       GROUP BY d.id 
       HAVING donation_count > 0 
       LIMIT 1`
    );

    if (donorWithDonation.length > 0) {
      const donor = donorWithDonation[0];
      const donorController = require('../controllers/donorController');
      const { req, res } = createMockContext({}, {}, null, { id: donor.id }, { id: 1, role_slug: 'super_admin' });

      await donorController.deleteDonor(req, res);

      assert.strictEqual(res.getStatusCode(), 400, 'Expected HTTP 400 when attempting to delete donor with donations');
      assert.match(res.getBody().message, /Cannot delete donor with.*donation/i);
    }
  });

  await test('Campaigns with linked donations cannot be hard-deleted (Zero Corruption Policy)', async () => {
    const [campaignWithDonations] = await pool.query(
      `SELECT c.id, c.title, COUNT(dn.id) as donation_count 
       FROM campaigns c 
       JOIN donations dn ON c.id = dn.campaign_id 
       GROUP BY c.id 
       HAVING donation_count > 0 
       LIMIT 1`
    );

    if (campaignWithDonations.length > 0) {
      const camp = campaignWithDonations[0];
      const donationController = require('../controllers/donationController');
      const { req, res } = createMockContext({}, {}, null, { id: camp.id }, { id: 1, role_slug: 'super_admin' });

      await donationController.deleteCampaign(req, res);

      assert.strictEqual(res.getStatusCode(), 400, 'Expected HTTP 400 when attempting to delete campaign with donations');
      assert.match(res.getBody().message, /Cannot delete campaign with.*donation/i);
    }
  });

  await test('Super administrator accounts guard against root self-deletion', async () => {
    const settingsController = require('../controllers/settingsController');
    const { req, res } = createMockContext({}, {}, null, { id: 1 }, { id: 1, role: 'super_admin' });

    await settingsController.deleteUser(req, res);

    assert.strictEqual(res.getStatusCode(), 400, 'Expected HTTP 400 when attempting to delete root admin');
    assert.match(res.getBody().message, /Cannot delete the root super administrator/i);
  });

  // -------------------------------------------------------------
  // SECTION 4: PAYROLL LIFECYCLE & SUMMARY SYNCHRONIZATION
  // -------------------------------------------------------------
  console.log('\n[4/4] Testing Payroll Run Lifecycle & Slip Updates...');

  await test('Salary slip updates recalculate net salary and parent payroll run totals', async () => {
    const [runs] = await pool.query('SELECT id FROM payroll_runs ORDER BY id DESC LIMIT 1');
    if (runs.length > 0) {
      const runId = runs[0].id;
      const [slips] = await pool.query('SELECT id, basic_salary FROM salary_slips WHERE payroll_run_id = ? LIMIT 1', [runId]);
      if (slips.length > 0) {
        const slipId = slips[0].id;
        const payrollController = require('../controllers/payrollController');

        const { req, res } = createMockContext(
          { basicSalary: 45000, housingAllowance: 3000, pfDeduction: 2250, taxDeduction: 1350 },
          {},
          null,
          { id: slipId },
          { id: 1, role: 'super_admin' }
        );

        await payrollController.updateSalarySlip(req, res);

        assert.strictEqual(res.getStatusCode(), 200, 'Expected HTTP 200 on salary slip adjustment');
        const updated = res.getBody();
        assert.strictEqual(updated.success, true);
        assert.strictEqual(updated.data.totalEarnings, 48000);
        assert.strictEqual(updated.data.totalDeductions, 3600);
        assert.strictEqual(updated.data.netSalary, 44400);
      }
    }
  });

  // -------------------------------------------------------------
  // TEST SUMMARY
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`  ASSERTIONS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  await pool.end();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllAssertions().catch((err) => {
  console.error('Fatal assertion runner error:', err);
  process.exit(1);
});
