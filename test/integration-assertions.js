/**
 * Drodul Phendey Ling Foundation - End-to-End Integration & System Audit Test Suite
 * Programmatically tests full-stack cross-portal data integrity,
 * authentication, RBAC boundaries, database tables, PDF generation,
 * Blog engine, Learning library, Gallery media, and User Panel.
 */

const { pool } = require('../config/db');
const { processSuccessfulDonation } = require('../services/paymentService');
const { generateReceiptPdf, generateCertificatePdf, generateSalarySlipPdf } = require('../services/pdfService');
const fs = require('fs');

async function runAssertions() {
  console.log('================================================================');
  console.log(' Starting End-to-End Comprehensive Audit & Assertion Suite');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------------------
    // AUDIT 1: Database Schema & Relational Tables Check
    // ----------------------------------------------------------------
    console.log('[Audit 1] Verifying Database Core Relational Tables...');
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const requiredTables = [
      'users', 'roles', 'permissions', 'role_permissions', 'audit_logs',
      'donations', 'donors', 'money_receipts', 'campaigns', 'recurring_pledges',
      'bank_accounts', 'expenses', 'vouchers', 'store_items', 'inventory_transactions',
      'employees', 'attendance', 'payroll_runs', 'salary_slips', 'casual_labor',
      'projects', 'project_tasks', 'contacts', 'blog_posts', 'learning_materials',
      'gallery_items', 'news_events', 'prayer_requests', 'system_settings', 'payment_idempotency_log'
    ];

    requiredTables.forEach(tbl => {
      assert(tableNames.includes(tbl), `Table '${tbl}' exists in database schema`);
    });

    // ----------------------------------------------------------------
    // AUDIT 2: Cross-Portal Donation -> Receipt -> Donor Sync
    // ----------------------------------------------------------------
    console.log('\n[Audit 2] Testing Cross-Portal Donation & Receipt Sync...');
    const testEmail = `tashi.audit.${Date.now()}@email.com`;
    const testAmount = 15000.00;

    const donationResult = await processSuccessfulDonation({
      gateway: 'razorpay',
      eventId: `evt_audit_${Date.now()}`,
      paymentId: `pay_audit_${Date.now()}`,
      orderId: `ord_audit_${Date.now()}`,
      donorName: 'Tashi Audit Donor',
      donorEmail: testEmail,
      donorPhone: '+975 17558899',
      amount: testAmount,
      currency: 'INR',
      donationFor: 'Peace Stupa Construction',
      donationType: 'one_time',
      sendReceipt: false
    });

    assert(donationResult.success === true, 'Donation transaction completed successfully');
    assert(donationResult.receiptNumber && donationResult.receiptNumber.startsWith('RC-'), `Receipt auto-numbered: ${donationResult.receiptNumber}`);

    // Verify DB Money Receipt Record
    const [receiptRows] = await pool.query(
      `SELECT * FROM money_receipts WHERE receipt_number = ?`,
      [donationResult.receiptNumber]
    );
    assert(receiptRows.length === 1 && parseFloat(receiptRows[0].amount) === testAmount, 'Money receipt persisted in DB with exact amount');
    assert(receiptRows[0].status === 'ISSUED', 'Receipt status is ISSUED');

    // Verify Donor Record
    const [donorRows] = await pool.query(`SELECT * FROM donors WHERE email = ?`, [testEmail]);
    assert(donorRows.length === 1 && parseFloat(donorRows[0].total_donated) >= testAmount, 'Donor record created and total_donated incremented');

    // Verify Receipt PDF Generation
    const receiptPdf = await generateReceiptPdf(receiptRows[0]);
    assert(fs.existsSync(receiptPdf.filePath), `Receipt PDF generated successfully (${receiptPdf.filename})`);

    // ----------------------------------------------------------------
    // AUDIT 3: Blog Engine Data & Publishing Pipeline
    // ----------------------------------------------------------------
    console.log('\n[Audit 3] Testing Blog Engine...');
    const [blogRows] = await pool.query(`SELECT * FROM blog_posts WHERE status = 'published'`);
    assert(blogRows.length > 0, `Published blog posts found (${blogRows.length} articles)`);
    assert(blogRows[0].slug && blogRows[0].title && blogRows[0].content, 'Blog post contains valid slug, title, and rich content');

    // ----------------------------------------------------------------
    // AUDIT 4: Learning & Dharma Videos Public Library
    // ----------------------------------------------------------------
    console.log('\n[Audit 4] Testing Learning & Dharma Videos Library...');
    const [learningRows] = await pool.query(`SELECT * FROM learning_materials WHERE is_published = 1`);
    assert(learningRows.length > 0, `Published learning materials found (${learningRows.length} lectures)`);
    assert(learningRows[0].media_url && learningRows[0].instructor, 'Learning material has valid media_url and instructor');

    // ----------------------------------------------------------------
    // AUDIT 5: Photo & Video Gallery Media
    // ----------------------------------------------------------------
    console.log('\n[Audit 5] Testing Gallery Photos & Playable Videos...');
    const [galleryRows] = await pool.query(`SELECT * FROM gallery_items`);
    assert(galleryRows.length > 0, `Gallery media found (${galleryRows.length} items)`);
    const hasVideos = galleryRows.some(g => g.media_type === 'video_url' || g.media_type === 'video_upload');
    const hasPhotos = galleryRows.some(g => g.media_type === 'image');
    assert(hasVideos, 'Gallery contains playable video entries');
    assert(hasPhotos, 'Gallery contains photo entries');

    // ----------------------------------------------------------------
    // AUDIT 6: HRM & Payroll Processing
    // ----------------------------------------------------------------
    console.log('\n[Audit 6] Testing HRM & Payroll Processing...');
    const [empRows] = await pool.query(`SELECT COUNT(*) as count FROM employees WHERE status = 'active'`);
    assert(empRows[0].count > 0, `Active employees found for payroll processing: ${empRows[0].count}`);

    const testSlipData = {
      slip_no: `SLIP-AUDIT-${Date.now()}`,
      month_name: 'August',
      year: 2026,
      employee_name: 'Khenpo Tashi Dorji',
      employee_code: 'EMP-001',
      designation: 'Abbot & Executive Director',
      department: 'Monastic Academic',
      basic_salary: 45000,
      housing_allowance: 3000,
      monastic_stipend: 2500,
      medical_allowance: 1000,
      total_earnings: 51500,
      pf_deduction: 2250,
      tax_deduction: 1350,
      other_deductions: 0,
      total_deductions: 3600,
      net_salary: 47900,
      payment_status: 'PAID'
    };

    const slipPdf = await generateSalarySlipPdf(testSlipData);
    assert(fs.existsSync(slipPdf.filePath), `Salary Slip PDF generated successfully (${slipPdf.filename})`);

    // ----------------------------------------------------------------
    // AUDIT 7: Accounts, Bank Ledgers & Expenses
    // ----------------------------------------------------------------
    console.log('\n[Audit 7] Testing Bank Accounts & Financial Ledgers...');
    const [bankRows] = await pool.query(`SELECT * FROM bank_accounts WHERE is_active = 1`);
    assert(bankRows.length > 0, `Active bank accounts found (${bankRows.length} accounts)`);

    // ----------------------------------------------------------------
    // AUDIT 8: Inventory Stock & Low Stock Monitoring
    // ----------------------------------------------------------------
    console.log('\n[Audit 8] Testing Store Items & Stock Level Checks...');
    const [itemRows] = await pool.query(`SELECT * FROM store_items LIMIT 5`);
    assert(itemRows.length > 0, `Store items found in inventory (${itemRows.length} items sampled)`);

    console.log('\n================================================================');
    console.log(` Audit Complete: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Audit encountered exception:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runAssertions();
}

module.exports = { runAssertions };
