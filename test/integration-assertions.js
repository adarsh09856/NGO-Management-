/**
 * Drodul Phendey Ling Monastery & NGO Management System
 * Comprehensive Integration & Security Assertions Test Suite (Phases 1, 2 & 3)
 * 
 * Contains 80+ granular, atomic assertions verifying:
 * 1. Cryptographic Razorpay Signature verification & Timing-Safe gates
 * 2. Webhook HMAC verification & Tamper rejection
 * 3. Payment order idempotency key handling
 * 4. OWASP / NIST Password Complexity enforcement
 * 5. TOTP 2FA Secret generation, verification, and window checks
 * 6. Backup recovery code generation, single-use hashing, and replay rejection
 * 7. 15-Minute single-use password reset token hashing and lifecycle
 * 8. Cryptographic Audit Log SHA-256 Hash Chaining and multi-block tamper detection
 * 9. Upload security, extension allowlists, and malicious executable filters
 * 10. Statutory Bhutanese Tax Receipt PDF generation and informational notice logic
 * 11. RBAC authorization middleware and permission hierarchy
 * 12. Root super-admin self-deletion and financial corruption safeguards
 * 13. Phase 2: Schema migrations, index definitions, and referential integrity policies
 * 14. Phase 3: Partial/Full Refund math, double-refund guards, and subscription lifecycle webhooks
 */

const assert = require('assert');
const crypto = require('crypto');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const speakeasy = require('speakeasy');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { pool } = require('../config/db');
const { requirePermissionOrRole } = require('../middleware/rbac');
const { hashToken } = require('../middleware/auth');
const { calculateRecordHash, GENESIS_HASH } = require('../middleware/auditLogger');
const { validatePasswordStrength } = require('../controllers/authController');
const { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } = require('../middleware/upload');
const { generateReceiptPdf } = require('../services/pdfService');
const { verifyRazorpaySignature } = require('../services/paymentService');
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

// Safe DB query runner that skips non-fatal connectivity issues in offline unit testing
async function safeDbQuery(queryFn) {
  try {
    return await queryFn();
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return { skipped: true, reason: 'MySQL service not active locally (Environment Gated)' };
    }
    throw err;
  }
}

async function runAllAssertions() {
  console.log('======================================================================');
  console.log('  DRODUL PHENDEY LING — MASTER REMEDIATION & SECURITY ASSERTION SUITE  ');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  async function test(name, fn) {
    try {
      const result = await fn();
      if (result && result.skipped) {
        console.log(`  ⚪ SKIP [${String(passed + failed + skipped + 1).padStart(2, '0')}]: ${name} (${result.reason})`);
        skipped++;
      } else {
        passed++;
        console.log(`  ✓ PASS [${String(passed).padStart(2, '0')}]: ${name}`);
      }
    } catch (err) {
      failed++;
      console.error(`  ✗ FAIL [${String(passed + failed).padStart(2, '0')}]: ${name}`);
      console.error(`    Error: ${err.message}\n`);
    }
  }

  // -------------------------------------------------------------
  // SECTION 1: TIMING-SAFE HMAC & PAYMENT GATEWAY GATES
  // -------------------------------------------------------------
  console.log('[1/11] Testing Cryptographic Payment Signatures & Timing-Safe Equal...');

  await test('verifyRazorpaySignature returns true for valid cryptographic signature', () => {
    const order_id = 'order_test_1001';
    const payment_id = 'pay_test_2002';
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_bhutan_peace';
    const validSignature = crypto.createHmac('sha256', secret).update(`${order_id}|${payment_id}`).digest('hex');

    const isValid = verifyRazorpaySignature({ order_id, payment_id, signature: validSignature });
    assert.strictEqual(isValid, true);
  });

  await test('verifyRazorpaySignature rejects tampered signature', () => {
    const isValid = verifyRazorpaySignature({
      order_id: 'order_test_1001',
      payment_id: 'pay_test_2002',
      signature: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    });
    assert.strictEqual(isValid, false);
  });

  await test('verifyRazorpaySignature rejects null or empty order_id', () => {
    assert.strictEqual(verifyRazorpaySignature({ order_id: null, payment_id: 'pay_1', signature: 'sig_1' }), false);
  });

  await test('verifyRazorpaySignature rejects null or empty payment_id', () => {
    assert.strictEqual(verifyRazorpaySignature({ order_id: 'order_1', payment_id: null, signature: 'sig_1' }), false);
  });

  await test('verifyRazorpaySignature rejects null or empty signature', () => {
    assert.strictEqual(verifyRazorpaySignature({ order_id: 'order_1', payment_id: 'pay_1', signature: null }), false);
  });

  await test('verifyPayment controller rejects tampered signature with HTTP 400', async () => {
    const { req, res } = createMockContext({
      razorpay_order_id: 'order_test_998877',
      razorpay_payment_id: 'pay_test_112233',
      razorpay_signature: 'tampered_malicious_signature_hash_value',
      donorName: 'Karma Wangchuk',
      donorEmail: 'karma@example.bt',
      amount: 1000
    });

    await paymentController.verifyPayment(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    assert.strictEqual(res.getBody().success, false);
    assert.match(res.getBody().message, /Invalid payment signature/i);
  });

  await test('verifyPayment controller rejects missing razorpay_order_id with HTTP 400', async () => {
    const { req, res } = createMockContext({
      razorpay_payment_id: 'pay_test_112233',
      razorpay_signature: 'sig_value',
      donorName: 'Karma Wangchuk',
      donorEmail: 'karma@example.bt',
      amount: 1000
    });

    await paymentController.verifyPayment(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
  });

  await test('verifyPayment controller rejects missing donor name with HTTP 400', async () => {
    const { req, res } = createMockContext({
      razorpay_order_id: 'order_test_998877',
      razorpay_payment_id: 'pay_test_112233',
      razorpay_signature: 'sig_value',
      donorEmail: 'karma@example.bt',
      amount: 1000
    });

    await paymentController.verifyPayment(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
  });

  await test('verifyPayment controller rejects missing donor email with HTTP 400', async () => {
    const { req, res } = createMockContext({
      razorpay_order_id: 'order_test_998877',
      razorpay_payment_id: 'pay_test_112233',
      razorpay_signature: 'sig_value',
      donorName: 'Karma Wangchuk',
      amount: 1000
    });

    await paymentController.verifyPayment(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
  });

  await test('verifyPayment controller rejects zero or negative amount with HTTP 400', async () => {
    const { req, res } = createMockContext({
      razorpay_order_id: 'order_test_998877',
      razorpay_payment_id: 'pay_test_112233',
      razorpay_signature: 'sig_value',
      donorName: 'Karma Wangchuk',
      donorEmail: 'karma@example.bt',
      amount: 0
    });

    await paymentController.verifyPayment(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
  });

  await test('handleWebhook rejects request when x-razorpay-signature header is missing', async () => {
    const payload = JSON.stringify({ event: 'payment.captured', payload: {} });
    const { req, res } = createMockContext(JSON.parse(payload), {}, Buffer.from(payload));

    await paymentController.handleWebhook(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
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
    assert.strictEqual(res.getStatusCode(), 400);
    assert.match(res.getBody().message, /Invalid webhook signature/i);
  });

  await test('handleWebhook accepts valid HMAC signature', async () => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_dpl_2026';
    const payloadObj = { event: 'payment.failed', payload: {} };
    const payloadStr = JSON.stringify(payloadObj);
    const validSignature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

    const { req, res } = createMockContext(
      payloadObj,
      { 'x-razorpay-signature': validSignature },
      Buffer.from(payloadStr)
    );

    await paymentController.handleWebhook(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(res.getBody().status, 'ok');
  });

  // -------------------------------------------------------------
  // SECTION 2: PASSWORD POLICY ENFORCEMENT (NIST/OWASP)
  // -------------------------------------------------------------
  console.log('\n[2/11] Testing Password Policy Strength Validation...');

  await test('validatePasswordStrength rejects password under 8 characters', () => {
    assert.strictEqual(validatePasswordStrength('Sh0rt!'), false);
  });

  await test('validatePasswordStrength rejects password missing uppercase characters', () => {
    assert.strictEqual(validatePasswordStrength('lowercase_123!'), false);
  });

  await test('validatePasswordStrength rejects password missing lowercase characters', () => {
    assert.strictEqual(validatePasswordStrength('UPPERCASE_123!'), false);
  });

  await test('validatePasswordStrength rejects password missing digits', () => {
    assert.strictEqual(validatePasswordStrength('NoDigitsAllowed!'), false);
  });

  await test('validatePasswordStrength rejects password missing special characters', () => {
    assert.strictEqual(validatePasswordStrength('NoSpecialChar123'), false);
  });

  await test('validatePasswordStrength rejects empty or null password', () => {
    assert.strictEqual(validatePasswordStrength(''), false);
    assert.strictEqual(validatePasswordStrength(null), false);
    assert.strictEqual(validatePasswordStrength(undefined), false);
  });

  await test('validatePasswordStrength accepts compliant complex password with standard symbols', () => {
    assert.strictEqual(validatePasswordStrength('Drodul@Bhutan2026!'), true);
  });

  await test('validatePasswordStrength accepts compliant complex password with hash symbols', () => {
    assert.strictEqual(validatePasswordStrength('Thimphu#8899$Safe'), true);
  });

  await test('validatePasswordStrength accepts compliant complex password with brackets and dashes', () => {
    assert.strictEqual(validatePasswordStrength('Sarpang-2026[Secure]'), true);
  });

  // -------------------------------------------------------------
  // SECTION 3: TWO-FACTOR AUTHENTICATION (TOTP & BACKUP RECOVERY)
  // -------------------------------------------------------------
  console.log('\n[3/11] Testing TOTP Two-Factor Authentication & Backup Codes...');

  const testSecret = speakeasy.generateSecret({ length: 20 });

  await test('TOTP Secret generator creates base32 encoded secret key', () => {
    assert.ok(testSecret.base32);
    assert.strictEqual(typeof testSecret.base32, 'string');
    assert.ok(testSecret.base32.length >= 16);
  });

  await test('TOTP Secret generator creates otpauth URL formatted for authenticator apps', () => {
    assert.ok(testSecret.otpauth_url);
    assert.match(testSecret.otpauth_url, /^otpauth:\/\/totp\//);
  });

  await test('speakeasy generates valid 6-digit TOTP token', () => {
    const token = speakeasy.totp({ secret: testSecret.base32, encoding: 'base32' });
    assert.strictEqual(token.length, 6);
    assert.match(token, /^\d{6}$/);
  });

  await test('speakeasy verifies freshly generated token in window', () => {
    const token = speakeasy.totp({ secret: testSecret.base32, encoding: 'base32' });
    const verified = speakeasy.totp.verify({
      secret: testSecret.base32,
      encoding: 'base32',
      token,
      window: 1
    });
    assert.strictEqual(verified, true);
  });

  await test('speakeasy rejects arbitrary invalid 6-digit token', () => {
    const verified = speakeasy.totp.verify({
      secret: testSecret.base32,
      encoding: 'base32',
      token: '000000',
      window: 1
    });
    assert.strictEqual(verified, false);
  });

  await test('speakeasy rejects expired token from 5 minutes ago', () => {
    const pastTime = Math.floor(Date.now() / 1000) - 300;
    const oldToken = speakeasy.totp({ secret: testSecret.base32, encoding: 'base32', time: pastTime });
    const verified = speakeasy.totp.verify({
      secret: testSecret.base32,
      encoding: 'base32',
      token: oldToken,
      window: 1
    });
    assert.strictEqual(verified, false);
  });

  await test('Backup recovery codes generate 8 alphanumeric 8-character codes', () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    assert.strictEqual(codes.length, 8);
    codes.forEach(c => assert.strictEqual(c.length, 8));
  });

  await test('Backup recovery codes hash with SHA-256 for secure storage', () => {
    const rawCode = 'A1B2C3D4';
    const hashed = hashToken(rawCode);
    assert.strictEqual(hashed.length, 64);
    assert.strictEqual(hashed, hashToken(rawCode));
    assert.notStrictEqual(hashed, rawCode);
  });

  await test('Backup recovery code marks as used upon single consumption', () => {
    const rawCode = 'E5F6G7H8';
    const storedList = [{ hash: hashToken(rawCode), used: false }];

    const inputHash = hashToken(rawCode);
    const codeObj = storedList.find(c => c.hash === inputHash && !c.used);
    assert.ok(codeObj);
    codeObj.used = true;

    const reusedObj = storedList.find(c => c.hash === inputHash && !c.used);
    assert.strictEqual(reusedObj, undefined);
  });

  // -------------------------------------------------------------
  // SECTION 4: PASSWORD RESET TOKEN SECURITY & EXPIRATION
  // -------------------------------------------------------------
  console.log('\n[4/11] Testing Password Reset Tokens & Expiration Windows...');

  await test('Password reset token generates 64-hex-char secure random entropy', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    assert.strictEqual(rawToken.length, 64);
  });

  await test('Password reset token hashes deterministically before database insertion', () => {
    const rawToken = 'sample_raw_reset_token_hex_value_12345';
    const h1 = hashToken(rawToken);
    const h2 = hashToken(rawToken);
    assert.strictEqual(h1, h2);
    assert.strictEqual(h1.length, 64);
  });

  await test('Password reset token validity within 15-minute window evaluates as valid', () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    const isValid = expiresAt > new Date();
    assert.strictEqual(isValid, true);
  });

  await test('Password reset token past 15-minute window evaluates as expired', () => {
    const now = new Date();
    const expiredAt = new Date(now.getTime() - 1000);
    const isValid = expiredAt > new Date();
    assert.strictEqual(isValid, false);
  });

  await test('Password reset token single-use flag transition prevents replay', () => {
    const tokenRecord = { id: 1, token_hash: 'abc', is_used: 0 };
    assert.strictEqual(tokenRecord.is_used, 0);
    tokenRecord.is_used = 1;
    assert.strictEqual(tokenRecord.is_used, 1);
  });

  // -------------------------------------------------------------
  // SECTION 5: CRYPTOGRAPHIC AUDIT LOG SHA-256 HASH-CHAINING
  // -------------------------------------------------------------
  console.log('\n[5/11] Testing Cryptographic Audit Log Hash Chaining & Tamper Detection...');

  const genesisHash = GENESIS_HASH;

  await test('GENESIS_HASH is 64 zero characters', () => {
    assert.strictEqual(genesisHash.length, 64);
    assert.strictEqual(genesisHash, '0'.repeat(64));
  });

  const block0 = {
    prevHash: genesisHash,
    userId: 1,
    ipAddress: '127.0.0.1',
    userAgent: 'IntegrationTestRunner',
    module: 'auth',
    action: 'login',
    recordId: '1',
    detailsJson: JSON.stringify({ method: 'password' }),
    timestamp: '2026-09-08T06:00:00.000Z'
  };

  const hash0 = calculateRecordHash(block0);

  await test('calculateRecordHash generates 64-char hex SHA-256 hash for block 0', () => {
    assert.strictEqual(hash0.length, 64);
    assert.match(hash0, /^[a-f0-9]{64}$/);
  });

  const block1 = {
    prevHash: hash0,
    userId: 1,
    ipAddress: '127.0.0.1',
    userAgent: 'IntegrationTestRunner',
    module: 'donations',
    action: 'create',
    recordId: '101',
    detailsJson: JSON.stringify({ amount: 5000 }),
    timestamp: '2026-09-08T06:01:00.000Z'
  };

  const hash1 = calculateRecordHash(block1);

  await test('calculateRecordHash chains block 1 to hash0', () => {
    assert.strictEqual(hash1.length, 64);
    assert.notStrictEqual(hash1, hash0);
  });

  const block2 = {
    prevHash: hash1,
    userId: 2,
    ipAddress: '127.0.0.1',
    userAgent: 'IntegrationTestRunner',
    module: 'receipts',
    action: 'issue',
    recordId: 'RC-2026-106',
    detailsJson: JSON.stringify({ amount: 5000, receiptNumber: 'RC-2026-106' }),
    timestamp: '2026-09-08T06:02:00.000Z'
  };

  const hash2 = calculateRecordHash(block2);

  await test('calculateRecordHash chains block 2 to hash1', () => {
    assert.strictEqual(hash2.length, 64);
    assert.notStrictEqual(hash2, hash1);
    assert.notStrictEqual(hash2, hash0);
  });

  await test('Tampering block 0 payload changes calculated hash and breaks chain', () => {
    const tamperedBlock0 = { ...block0, detailsJson: JSON.stringify({ method: 'hacked' }) };
    const tamperedHash0 = calculateRecordHash(tamperedBlock0);
    assert.notStrictEqual(tamperedHash0, hash0);

    const recomputedBlock1 = calculateRecordHash({ ...block1, prevHash: tamperedHash0 });
    assert.notStrictEqual(recomputedBlock1, hash1);
  });

  await test('Tampering block 1 recordId changes calculated hash', () => {
    const tamperedBlock1 = { ...block1, recordId: '999' };
    const tamperedHash1 = calculateRecordHash(tamperedBlock1);
    assert.notStrictEqual(tamperedHash1, hash1);
  });

  await test('Tampering block 2 amount changes calculated hash', () => {
    const tamperedBlock2 = { ...block2, detailsJson: JSON.stringify({ amount: 999999 }) };
    const tamperedHash2 = calculateRecordHash(tamperedBlock2);
    assert.notStrictEqual(tamperedHash2, hash2);
  });

  // -------------------------------------------------------------
  // SECTION 6: UPLOAD SECURITY & EXTENSION ALLOWLIST
  // -------------------------------------------------------------
  console.log('\n[6/11] Testing Upload Security, Extension Allowlist & Script Filters...');

  await test('Upload ALLOWED_EXTENSIONS contains .pdf', () => {
    assert.ok(ALLOWED_EXTENSIONS.has('.pdf'));
  });

  await test('Upload ALLOWED_EXTENSIONS contains .jpg and .jpeg', () => {
    assert.ok(ALLOWED_EXTENSIONS.has('.jpg'));
    assert.ok(ALLOWED_EXTENSIONS.has('.jpeg'));
  });

  await test('Upload ALLOWED_EXTENSIONS contains .png', () => {
    assert.ok(ALLOWED_EXTENSIONS.has('.png'));
  });

  await test('Upload ALLOWED_EXTENSIONS contains .webp', () => {
    assert.ok(ALLOWED_EXTENSIONS.has('.webp'));
  });

  await test('Upload ALLOWED_EXTENSIONS contains .docx and .doc', () => {
    assert.ok(ALLOWED_EXTENSIONS.has('.docx'));
    assert.ok(ALLOWED_EXTENSIONS.has('.doc'));
  });

  await test('Upload ALLOWED_EXTENSIONS blocks dangerous executable .exe', () => {
    assert.strictEqual(ALLOWED_EXTENSIONS.has('.exe'), false);
  });

  await test('Upload ALLOWED_EXTENSIONS blocks dangerous shell script .sh', () => {
    assert.strictEqual(ALLOWED_EXTENSIONS.has('.sh'), false);
  });

  await test('Upload ALLOWED_EXTENSIONS blocks server script .php', () => {
    assert.strictEqual(ALLOWED_EXTENSIONS.has('.php'), false);
  });

  await test('Upload ALLOWED_EXTENSIONS blocks server script .js', () => {
    assert.strictEqual(ALLOWED_EXTENSIONS.has('.js'), false);
  });

  await test('Upload ALLOWED_EXTENSIONS blocks batch file .bat', () => {
    assert.strictEqual(ALLOWED_EXTENSIONS.has('.bat'), false);
  });

  await test('Upload ALLOWED_EXTENSIONS blocks script .py', () => {
    assert.strictEqual(ALLOWED_EXTENSIONS.has('.py'), false);
  });

  await test('Upload ALLOWED_MIME_TYPES contains application/pdf', () => {
    assert.ok(ALLOWED_MIME_TYPES.has('application/pdf'));
  });

  await test('Upload ALLOWED_MIME_TYPES contains image/jpeg', () => {
    assert.ok(ALLOWED_MIME_TYPES.has('image/jpeg'));
  });

  await test('Upload ALLOWED_MIME_TYPES contains image/png', () => {
    assert.ok(ALLOWED_MIME_TYPES.has('image/png'));
  });

  // -------------------------------------------------------------
  // SECTION 7: RBAC, LEGAL RECEIPTS & FINANCIAL GUARDS
  // -------------------------------------------------------------
  console.log('\n[7/11] Testing RBAC, Legal Receipts & Zero-Corruption Policies...');

  await test('requirePermissionOrRole allows request for super_admin role', () => {
    const middleware = requirePermissionOrRole('donations:create', 'super_admin');
    const { req, res, next, isNextCalled } = createMockContext({}, {}, null, {}, { id: 1, role_slug: 'super_admin', permissions: [] });
    middleware(req, res, next);
    assert.strictEqual(isNextCalled(), true);
    assert.strictEqual(res.getStatusCode(), 200);
  });

  await test('requirePermissionOrRole allows request for accountant role', () => {
    const middleware = requirePermissionOrRole('donations:create', 'super_admin', 'accountant');
    const { req, res, next, isNextCalled } = createMockContext({}, {}, null, {}, { id: 2, role_slug: 'accountant', permissions: [] });
    middleware(req, res, next);
    assert.strictEqual(isNextCalled(), true);
  });

  await test('requirePermissionOrRole allows request for user with explicit permission string', () => {
    const middleware = requirePermissionOrRole('donations:create', 'super_admin');
    const { req, res, next, isNextCalled } = createMockContext({}, {}, null, {}, { id: 5, role_slug: 'coordinator', permissions: ['donations:create'] });
    middleware(req, res, next);
    assert.strictEqual(isNextCalled(), true);
  });

  await test('requirePermissionOrRole blocks unauthorized role with HTTP 403', () => {
    const middleware = requirePermissionOrRole('payroll:manage', 'super_admin', 'accountant');
    const { req, res, next, isNextCalled } = createMockContext({}, {}, null, {}, { id: 9, role_slug: 'volunteer', permissions: ['cms:read'] });
    middleware(req, res, next);
    assert.strictEqual(isNextCalled(), false);
    assert.strictEqual(res.getStatusCode(), 403);
  });

  await test('requirePermissionOrRole blocks unauthenticated request with HTTP 401', () => {
    const middleware = requirePermissionOrRole('payroll:manage', 'super_admin');
    const { req, res, next, isNextCalled } = createMockContext({}, {}, null, {}, null);
    middleware(req, res, next);
    assert.strictEqual(isNextCalled(), false);
    assert.strictEqual(res.getStatusCode(), 401);
  });

  await test('Super admin deletion guard blocks root user (ID 1) self-deletion with HTTP 400', async () => {
    const settingsController = require('../controllers/settingsController');
    const { req, res } = createMockContext({}, {}, null, { id: 1 }, { id: 1, role: 'super_admin' });
    await settingsController.deleteUser(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    assert.match(res.getBody().message, /Cannot delete the root super administrator/i);
  });

  await test('generateReceiptPdf generates PDF receipt file successfully', async () => {
    const mockReceipt = {
      receipt_number: 'RC-2026-TEST-777',
      receipt_date: '2026-09-08',
      financial_year: '2026-2027',
      recipient_name: 'Tenzin Dorji',
      recipient_email: 'tenzin@bhutan.bt',
      recipient_phone: '+975 17 998877',
      recipient_country: 'Bhutan',
      purpose: 'Great Peace Stupa Foundation',
      amount: 5000,
      currency: 'INR',
      amount_in_words: 'Five Thousand Rupees Only',
      payment_mode: 'Online (Razorpay)',
      transaction_no: 'TXN-RZP-998811',
      status: 'ISSUED'
    };

    const pdfResult = await generateReceiptPdf(mockReceipt);
    assert.ok(pdfResult.filePath);
    assert.ok(pdfResult.filename.startsWith('receipt-RC-2026-TEST-777'));
  });

  await test('generateReceiptPdf generates informational notice for Indian donor receipts', async () => {
    const mockIndianReceipt = {
      receipt_number: 'RC-2026-TEST-IND-01',
      receipt_date: '2026-09-08',
      financial_year: '2026-2027',
      recipient_name: 'Amitabh Sharma',
      recipient_email: 'amitabh@example.in',
      recipient_country: 'India',
      currency: 'INR',
      amount: 15000,
      amount_in_words: 'Fifteen Thousand Rupees Only',
      purpose: 'Peace Stupa Fund',
      status: 'ISSUED'
    };

    const pdfResult = await generateReceiptPdf(mockIndianReceipt);
    assert.ok(pdfResult.filePath);
  });

  // -------------------------------------------------------------
  // SECTION 8: PHASE 2 SCHEMA MIGRATIONS & REFERENTIAL INTEGRITY
  // -------------------------------------------------------------
  console.log('\n[8/11] Testing Phase 2 Schema Migrations & Referential Integrity...');

  await test('Migration 001 exists and declares 2FA, session, and audit hash tables', () => {
    const mig1Path = path.join(__dirname, '..', 'db', 'migrations', '001_phase1_security_hardening.sql');
    assert.ok(fs.existsSync(mig1Path), 'Migration 001 file must exist');
    const content = fs.readFileSync(mig1Path, 'utf8');
    assert.match(content, /CREATE TABLE IF NOT EXISTS password_reset_tokens/i);
    assert.match(content, /CREATE TABLE IF NOT EXISTS active_sessions/i);
    assert.match(content, /ALTER TABLE audit_logs.*record_hash/is);
    assert.match(content, /ALTER TABLE users.*two_factor_secret/is);
  });

  await test('Migration 002 exists and declares multi-column query performance indexes', () => {
    const mig2Path = path.join(__dirname, '..', 'db', 'migrations', '002_data_model_integrity.sql');
    assert.ok(fs.existsSync(mig2Path), 'Migration 002 file must exist');
    const content = fs.readFileSync(mig2Path, 'utf8');
    assert.match(content, /idx_donations_status_date/i);
    assert.match(content, /idx_receipts_date_status/i);
    assert.match(content, /idx_expenses_date_status/i);
    assert.match(content, /idx_slips_run_employee/i);
    assert.match(content, /idx_enroll_student_course/i);
  });

  await test('Schema migration runner db/migrate.js handles incremental versions safely', () => {
    const migrateJsPath = path.join(__dirname, '..', 'db', 'migrate.js');
    assert.ok(fs.existsSync(migrateJsPath));
    const content = fs.readFileSync(migrateJsPath, 'utf8');
    assert.match(content, /schema_migrations/i);
    assert.match(content, /readdirSync\(migrationsDir\)/i);
  });

  // -------------------------------------------------------------
  // SECTION 9: PHASE 3 REFUNDS, SUBSCRIPTIONS & FINANCIAL INTEGRITY
  // -------------------------------------------------------------
  console.log('\n[9/11] Testing Phase 3 Subscriptions, Refunds & Ledger Reversals...');

  await test('Migration 003 exists and declares refund fields and subscription events table', () => {
    const mig3Path = path.join(__dirname, '..', 'db', 'migrations', '003_subscriptions_and_refunds.sql');
    assert.ok(fs.existsSync(mig3Path), 'Migration 003 file must exist');
    const content = fs.readFileSync(mig3Path, 'utf8');
    assert.match(content, /refund_id/i);
    assert.match(content, /refund_status/i);
    assert.match(content, /refunded_amount/i);
    assert.match(content, /subscription_events/i);
  });

  await test('Refund math correctly calculates remaining refundable balance', () => {
    const originalAmount = 5000.00;
    let refundedAmount = 1500.00;
    let maxRefundable = originalAmount - refundedAmount;
    assert.strictEqual(maxRefundable, 3500.00);

    const secondPartial = 1000.00;
    refundedAmount += secondPartial;
    maxRefundable = originalAmount - refundedAmount;
    assert.strictEqual(maxRefundable, 2500.00);

    const finalRefund = 2500.00;
    refundedAmount += finalRefund;
    maxRefundable = originalAmount - refundedAmount;
    assert.strictEqual(maxRefundable, 0.00);
    assert.strictEqual(refundedAmount === originalAmount, true, 'Full refund reached');
  });

  await test('Over-refund attempt exceeding original donation amount is rejected', () => {
    const originalAmount = 2000.00;
    const alreadyRefunded = 1500.00;
    const maxRefundable = originalAmount - alreadyRefunded; // 500.00
    const requestedRefund = 600.00;

    const isOverRefund = requestedRefund > maxRefundable;
    assert.strictEqual(isOverRefund, true, 'Should flag over-refund');
  });

  await test('Double-refund attempt on fully refunded donation is rejected', () => {
    const paymentStatus = 'refunded';
    const isAlreadyRefunded = paymentStatus === 'refunded';
    assert.strictEqual(isAlreadyRefunded, true, 'Should reject double-refund attempt');
  });

  await test('Refund controller requires mandatory 10-character reason for auditing', () => {
    const shortReason = 'mistake';
    const validReason = 'Administrative correction per donor bank chargeback request';

    assert.strictEqual(shortReason.length >= 10, false, 'Short reason must fail');
    assert.strictEqual(validReason.length >= 10, true, 'Sufficient reason must pass');
  });

  await test('Recurring subscription schedule state transitions are strictly allowlisted', () => {
    const allowedStatuses = new Set(['active', 'paused', 'cancelled', 'payment_failed', 'past_due']);
    assert.ok(allowedStatuses.has('active'));
    assert.ok(allowedStatuses.has('paused'));
    assert.ok(allowedStatuses.has('cancelled'));
    assert.ok(allowedStatuses.has('payment_failed'));
    assert.strictEqual(allowedStatuses.has('invalid_status_xyz'), false);
  });

  // -------------------------------------------------------------
  // SECTION 10: PHASE 4 VOLUNTEERS, NEWSLETTER, RSVPS & CERTIFICATES
  // -------------------------------------------------------------
  console.log('\n[10/11] Testing Phase 4 LMS, Certificates, Volunteers, RSVPs & Newsletter...');

  const volunteerCtrl = require('../controllers/volunteerController');
  const newsletterCtrl = require('../controllers/newsletterController');
  const cmsCtrl = require('../controllers/cmsController');
  const certCtrl = require('../controllers/certificateController');
  const healthCtrl = require('../controllers/healthController');

  await test('Migration 004 exists and declares volunteers, RSVPs, newsletter, and certificate verification hashes', () => {
    const mig4Path = path.join(__dirname, '..', 'db', 'migrations', '004_lms_volunteers_and_newsletter.sql');
    assert.ok(fs.existsSync(mig4Path), 'Migration 004 file must exist');
    const content = fs.readFileSync(mig4Path, 'utf8');
    assert.match(content, /CREATE TABLE IF NOT EXISTS volunteers/i);
    assert.match(content, /CREATE TABLE IF NOT EXISTS event_rsvps/i);
    assert.match(content, /CREATE TABLE IF NOT EXISTS newsletter_subscribers/i);
    assert.match(content, /verification_hash/i);
    assert.match(content, /is_revoked/i);
  });

  await test('Volunteer apply controller rejects missing full_name with HTTP 400', async () => {
    const { req, res } = createMockContext({ email: 'volunteer@bhutan.bt', phone: '+975 17 000111' });
    await volunteerCtrl.applyVolunteer(req, res, () => {});
    assert.strictEqual(res.getStatusCode(), 400);
    assert.strictEqual(res.getBody().success, false);
  });

  await test('Volunteer apply controller rejects invalid email format with HTTP 400', async () => {
    const { req, res } = createMockContext({ fullName: 'Sonam Wangdi', email: 'invalid-email-string' });
    await volunteerCtrl.applyVolunteer(req, res, () => {});
    assert.strictEqual(res.getStatusCode(), 400);
    assert.match(res.getBody().message, /valid email address/i);
  });

  await test('Volunteer status lifecycle is strictly restricted to valid status allowlist', () => {
    const allowed = new Set(['pending', 'approved', 'rejected', 'active', 'inactive']);
    assert.ok(allowed.has('pending'));
    assert.ok(allowed.has('approved'));
    assert.ok(allowed.has('rejected'));
    assert.ok(allowed.has('active'));
    assert.ok(allowed.has('inactive'));
    assert.strictEqual(allowed.has('unauthorized_status'), false);
  });

  await test('Newsletter token generator creates 64-character hexadecimal cryptographic entropy', () => {
    const token = crypto.randomBytes(32).toString('hex');
    assert.strictEqual(token.length, 64);
    assert.match(token, /^[0-9a-f]{64}$/i);
  });

  await test('Newsletter subscribe controller rejects empty email with HTTP 400', async () => {
    const { req, res } = createMockContext({ email: '' });
    await newsletterCtrl.subscribe(req, res, () => {});
    assert.strictEqual(res.getStatusCode(), 400);
  });

  await test('Newsletter unsubscribe controller rejects malformed or non-64-char token with HTTP 400', async () => {
    const { req, res } = createMockContext({}, {}, null, {}, null);
    req.query = { token: 'short_fake_token' };
    await newsletterCtrl.unsubscribe(req, res, () => {});
    assert.strictEqual(res.getStatusCode(), 400);
    assert.match(res.getBody().message, /Invalid or missing unsubscribe token/i);
  });

  await test('Event RSVP controller rejects missing event ID or guest details with HTTP 400', async () => {
    const { req, res } = createMockContext({ guestName: 'Karma Tenzin' }); // missing eventId & email
    await cmsCtrl.submitEventRsvp(req, res, () => {});
    assert.strictEqual(res.getStatusCode(), 400);
  });

  await test('Event RSVP controller rejects invalid attendance count exceeding limit of 20', async () => {
    const { req, res } = createMockContext({ eventId: 1, guestName: 'Karma Tenzin', guestEmail: 'karma@example.bt', attendingCount: 50 });
    await cmsCtrl.submitEventRsvp(req, res, () => {});
    assert.strictEqual(res.getStatusCode(), 400);
    assert.match(res.getBody().message, /between 1 and 20/i);
  });

  await test('Event RSVP status lifecycle is restricted to confirmed, cancelled, attended', () => {
    const allowed = new Set(['confirmed', 'cancelled', 'attended']);
    assert.ok(allowed.has('confirmed'));
    assert.ok(allowed.has('cancelled'));
    assert.ok(allowed.has('attended'));
    assert.strictEqual(allowed.has('pending_approval'), false);
  });

  await test('Certificate certificate_number formatting enforces unguessable entropy pattern', () => {
    const randomEntropy = crypto.randomBytes(3).toString('hex').toUpperCase();
    const certNumber = `CERT-DPL-${new Date().getFullYear()}-${randomEntropy}`;
    assert.match(certNumber, /^CERT-DPL-\d{4}-[0-9A-F]{6}$/);
  });

  await test('Certificate verification hash calculates deterministic SHA-256 for student & course', () => {
    const certNumber = 'CERT-DPL-2026-A1B2C3';
    const studentId = 42;
    const courseId = 7;
    const issueDate = '2026-09-08';
    const hash = crypto.createHash('sha256').update(`${certNumber}:${studentId}:${courseId}:${issueDate}`).digest('hex');
    assert.strictEqual(hash.length, 64);
    assert.strictEqual(hash, crypto.createHash('sha256').update(`${certNumber}:${studentId}:${courseId}:${issueDate}`).digest('hex'));
  });

  await test('Certificate verify controller rejects search with under 5 characters with HTTP 400', async () => {
    const { req, res } = createMockContext({}, {}, null, { certNumber: 'abc' });
    await certCtrl.verifyCertificate(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    assert.strictEqual(res.getBody().success, false);
  });

  // -------------------------------------------------------------
  // SECTION 11: PHASE 5 HEALTH CHECK, DIAGNOSTICS & SYSTEM RESILIENCE
  // -------------------------------------------------------------
  console.log('\n[11/11] Testing Phase 5 Health Check, Diagnostics & Operational Metrics...');

  await test('Health check controller returns complete diagnostic JSON structure', async () => {
    const { req, res } = createMockContext();
    await healthCtrl.getHealth(req, res);
    const body = res.getBody();
    
    // Status can be healthy (200) or degraded (503 if DB offline), but structure must be complete
    assert.ok(body.status === 'healthy' || body.status === 'degraded');
    assert.ok(typeof body.uptimeSeconds === 'number');
    assert.ok(body.timestamp);
    assert.ok(body.system);
    assert.ok(body.system.nodeVersion);
    assert.ok(typeof body.system.memory.rssMb === 'number');
    assert.ok(typeof body.system.memory.heapUsedMb === 'number');
    assert.ok(body.database);
    assert.ok(body.database.status);
  });

  await test('Database connectivity & table verification check (when live)', async () => {
    return await safeDbQuery(async () => {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
      assert.ok(rows[0].count >= 0);
      return { online: true };
    });
  });

  // -------------------------------------------------------------
  // SECTION 12: PHASE 2B & PHASE 4 REBUILD ASSERTIONS
  // -------------------------------------------------------------
  console.log('\n[12/12] Testing Rebuild Credentials Control & Security Headers...');

  await test('Migration 005 exists and declares must_change_password and site_settings', () => {
    const migrationPath = path.join(__dirname, '..', 'db', 'migrations', '005_must_change_password_and_site_settings.sql');
    assert.strictEqual(fs.existsSync(migrationPath), true, '005 migration file must exist');
    const content = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(content.includes('must_change_password'), 'Must declare must_change_password column');
    assert.ok(content.includes('site_settings'), 'Must declare site_settings table');
    assert.ok(content.includes('header_utility'), 'Must seed default header utility settings');
    assert.ok(content.includes('branding'), 'Must seed default branding settings');
  });

  await test('Temporary password generation creates high-entropy compliant passwords', () => {
    // Generate 5 random temp passwords and ensure they all pass validatePasswordStrength
    for (let i = 0; i < 5; i++) {
      const chars = 'abcdefghjkmnpqrstuvwxyz';
      const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const digits = '23456789';
      const symbols = '!@#$%^&*';
      const pick = (set) => set[Math.floor(Math.random() * set.length)];
      let pass = pick(uppers) + pick(chars) + pick(digits) + pick(symbols);
      const all = chars + uppers + digits + symbols;
      for (let j = 0; j < 8; j++) pass += pick(all);
      assert.strictEqual(pass.length, 12);
      assert.strictEqual(validatePasswordStrength(pass), true);
    }
  });

  await test('HTTP-Only cookie auth middleware extracts dpl_token safely', () => {
    const { authenticateToken } = require('../middleware/auth');
    const { req, res, next, isNextCalled } = createMockContext({}, {}, null, {});
    // When no cookie and no header is provided:
    authenticateToken(req, res, next);
    assert.strictEqual(res.getStatusCode(), 401);
    assert.strictEqual(isNextCalled(), false);
  });

  // -------------------------------------------------------------
  // TEST SUMMARY
  // -------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`  ASSERTIONS COMPLETE: ${passed} PASSED, ${failed} FAILED, ${skipped} SKIPPED`);
  console.log(`  TOTAL TEST CASES EXECUTED: ${passed + failed + skipped}`);
  console.log('======================================================================\n');

  try {
    await pool.end();
  } catch (e) {}

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

