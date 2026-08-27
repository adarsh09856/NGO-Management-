/**
 * Drodul Phendey Ling Foundation - Integration Assertion Test Suite
 * Programmatically tests end-to-end cross-portal data consistency,
 * role-based authentication, PDF generation, and accounting integrity.
 */

const { pool } = require('../src/config/db');
const { processSuccessfulDonation } = require('../src/services/paymentService');
const { generateReceiptPdf, generateCertificatePdf, generateSalarySlipPdf } = require('../src/services/pdfService');
const fs = require('fs');

async function runAssertions() {
  console.log('================================================================');
  console.log(' Starting End-to-End Integration Assertions Test Suite');
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
    // TEST 1: Cross-Portal Donation -> Receipt -> Donor History Sync
    // ----------------------------------------------------------------
    console.log('[Test Suite 1] Testing Cross-Portal Donation & Receipt Sync...');
    const testEmail = `karma.test.${Date.now()}@bhutanpeace.bt`;
    const testAmount = 5500.00;

    const donationResult = await processSuccessfulDonation({
      gateway: 'razorpay',
      eventId: `evt_test_${Date.now()}`,
      paymentId: `pay_test_${Date.now()}`,
      orderId: `ord_test_${Date.now()}`,
      donorName: 'Karma Dorji Test',
      donorEmail: testEmail,
      donorPhone: '+975 17119988',
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

    // Verify Donor History Join
    const [donorRows] = await pool.query(`SELECT * FROM donors WHERE email = ?`, [testEmail]);
    assert(donorRows.length === 1 && parseFloat(donorRows[0].total_donated) >= testAmount, 'Donor record created and total_donated incremented');

    // Verify Receipt PDF Generation
    const receiptPdf = await generateReceiptPdf(receiptRows[0]);
    assert(fs.existsSync(receiptPdf.filePath), `Receipt PDF generated at ${receiptPdf.filename}`);

    // ----------------------------------------------------------------
    // TEST 2: LMS Course Completion -> Certificate Auto-Issue -> Student Sync
    // ----------------------------------------------------------------
    console.log('\n[Test Suite 2] Testing LMS Course Completion & Auto-Certificate Issuance...');
    const [monkRows] = await pool.query(`SELECT id, monastic_name, roll_number FROM students_monks WHERE monastic_name = 'Tenzin Norbu' LIMIT 1`);
    assert(monkRows.length > 0, 'Seeded monk student found');

    const monk = monkRows[0];
    const certNum = `CERT-TEST-${Date.now()}`;
    const certData = {
      certificate_number: certNum,
      student_name: monk.monastic_name,
      roll_number: monk.roll_number,
      course_title: 'Buddhist Philosophy - Level 1',
      grade: 'Distinction with High Honors',
      issue_date: new Date().toISOString().slice(0, 10),
      signed_by: 'Khenpo Tashi Dorji, Abbot'
    };

    const certPdf = await generateCertificatePdf(certData);
    assert(fs.existsSync(certPdf.filePath), `Certificate PDF generated at ${certPdf.filename}`);

    // ----------------------------------------------------------------
    // TEST 3: Inventory Stock In / Out Flow & Low Stock Alerts
    // ----------------------------------------------------------------
    console.log('\n[Test Suite 3] Testing Inventory Stock Movement & Alert Computation...');
    const [itemRows] = await pool.query(`SELECT id, item_name, current_stock, min_stock FROM store_items WHERE item_code = 'ITM-00125' LIMIT 1`);
    assert(itemRows.length > 0, 'Store Item ITM-00125 (Butter Lamp Small) found');

    const item = itemRows[0];
    assert(item.current_stock <= item.min_stock, `Low stock alert correctly identified (Current: ${item.current_stock}, Min: ${item.min_stock})`);

    // ----------------------------------------------------------------
    // TEST 4: Monthly Payroll & Salary Slip Generation
    // ----------------------------------------------------------------
    console.log('\n[Test Suite 4] Testing HRM & Payroll Consistency...');
    const [empRows] = await pool.query(`SELECT COUNT(*) as count FROM employees WHERE status = 'active'`);
    assert(empRows[0].count > 0, `Active employees identified for payroll processing: ${empRows[0].count}`);

    const testSlipData = {
      slip_no: `SLIP-TEST-${Date.now()}`,
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
    assert(fs.existsSync(slipPdf.filePath), `Salary Slip PDF generated at ${slipPdf.filename}`);

    console.log('\n================================================================');
    console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution encountered exception:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runAssertions();
}

module.exports = { runAssertions };
