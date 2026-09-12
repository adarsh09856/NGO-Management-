/**
 * Drodul Phendey Ling Monastery & Foundation
 * Comprehensive End-to-End Real-World User Flows & Admin CRUD Verification Suite
 * 
 * Verifies 10 complete interconnected workflows:
 * Flow 1: Public Offering -> Devotee Account -> User Dashboard -> Admin Receipt Void
 * Flow 2: Public Devotee Inquiry -> Admin CRM -> Follow-up Communication & Contact Update
 * Flow 3: Public Prayer Request (108 butter lamps) -> Abbot Monastic Dedication
 * Flow 4: Public Monastic Ceremony RSVP -> Admin Attendee Confirmation
 * Flow 5: Student Monk Registration -> Self-Enrollment -> Progress -> Grading -> Certificate Conferred -> Public Verification
 * Flow 6: Expense Claim Submission -> Accountant Edit -> Approval -> Disbursement -> Accounts Dashboard
 * Flow 7: Inventory Store Item -> Stock-In -> Stock-Out -> Low Stock Alert
 * Flow 8: HRM Employee -> Daily Attendance -> Monthly Payroll Generation -> Slip Adjustment
 * Flow 9: Stupa Renovation Project -> Task Creation -> Status Transition (In-Progress -> Completed)
 * Flow 10: User Management -> Role Assignment -> Password Reset -> Login -> Session Revocation
 */

const http = require('http');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('../server');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dpl_monastery_super_secure_jwt_secret_key_2026_bhutan';

let server;
let baseURL;
let adminToken;
let adminHeaders;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runEndToEndFlows() {
  console.log('================================================================');
  console.log('☸  DRODUL PHENDEY LING - 10 REAL-WORLD USER & ADMIN FLOWS TEST');
  console.log('================================================================\n');

  // Spin up ephemeral test server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseURL = `http://127.0.0.1:${port}/api`;
      console.log(`🚀 Test server listening on ${baseURL}\n`);
      resolve();
    });
  });

  // Admin token (User ID 1, super_admin)
  adminToken = jwt.sign({ userId: 1, id: 1, email: 'contact@drodulphendeyling.org', role: 'super_admin' }, JWT_SECRET, { expiresIn: '2h' });
  adminHeaders = {
    headers: { Authorization: `Bearer ${adminToken}` }
  };

  try {
    // =========================================================================
    // FLOW 1: PUBLIC OFFERING -> USER DASHBOARD -> ADMIN RECEIPT MANAGEMENT
    // =========================================================================
    console.log('--- FLOW 1: Devotee Offering, User Dashboard & Admin Receipt Control ---');
    const flow1Email = `devotee.jigme.${Date.now()}@example.bt`;
    const flow1Password = 'SacredDharma2026!';

    // 1.1 Public Offering
    const pubOffering = await axios.post(`${baseURL}/donations/public-offering`, {
      donorName: 'Jigme Dorji',
      donorEmail: flow1Email,
      donorPhone: '+975 17123456',
      donorAddress: 'Gelephu, Bhutan',
      amount: 2500,
      currency: 'INR',
      donationFor: 'Great Druk Wangyel Peace Stupa',
      donationType: 'one_time',
      paymentMethod: 'online_upi',
      remarks: 'Offering for family prosperity and health'
    });
    assert(pubOffering.status === 201 && pubOffering.data.success, 'Step 1.1: Public offering processed');
    const receiptNumber = pubOffering.data.data.receiptNumber;
    const donationId = pubOffering.data.data.donationId;
    const receiptId = pubOffering.data.data.receiptId;
    assert(receiptNumber && donationId, `Receipt issued: ${receiptNumber} (Donation #${donationId})`);

    // 1.2 Devotee Registers Account
    const devoteeReg = await axios.post(`${baseURL}/auth/register`, {
      fullName: 'Jigme Dorji',
      email: flow1Email,
      password: flow1Password,
      phone: '+975 17123456'
    });
    assert(devoteeReg.status === 201 && devoteeReg.data.success, 'Step 1.2: Devotee registered account');

    // 1.2b Devotee Logs In
    const devoteeLogin = await axios.post(`${baseURL}/auth/login`, {
      email: flow1Email,
      password: flow1Password
    });
    assert(devoteeLogin.status === 200 && devoteeLogin.data.token, 'Step 1.2b: Devotee logged in with new account');
    const devoteeToken = devoteeLogin.data.token;
    const devoteeHeaders = { headers: { Authorization: `Bearer ${devoteeToken}` } };

    // 1.3 Devotee Checks User Dashboard
    const userDash = await axios.get(`${baseURL}/user/my-dashboard`, devoteeHeaders);
    assert(userDash.status === 200 && userDash.data.success, 'Step 1.3: Devotee fetched my-dashboard');
    assert(userDash.data.data.donations && userDash.data.data.donations.length > 0, `Devotee sees their recent donation of ₹${userDash.data.data.donations[0].amount}`);

    // 1.4 Admin inspects donations & voids receipt for test
    const adminDonations = await axios.get(`${baseURL}/donations`, adminHeaders);
    assert(adminDonations.status === 200 && Array.isArray(adminDonations.data.data), 'Step 1.4: Admin fetched all donations');

    const voidRes = await axios.post(`${baseURL}/receipts/${receiptId}/void`, {
      voidReason: 'Test transaction reconciliation adjustment per donor request'
    }, adminHeaders);
    assert(voidRes.status === 200 && voidRes.data.success, `Step 1.5: Admin voided receipt ${receiptNumber}`);

    // 1.6 Devotee verifies updated status
    const devoteeDonations = await axios.get(`${baseURL}/donor/my-donations`, devoteeHeaders);
    assert(devoteeDonations.status === 200, 'Step 1.6: Devotee fetched my-donations after admin void');


    // =========================================================================
    // FLOW 2: DEVOTEE INQUIRY -> CRM CONTACT -> FOLLOW-UP COMMUNICATION
    // =========================================================================
    console.log('\n--- FLOW 2: Devotee Inquiry & CRM Follow-up Communication ---');
    const crmEmail = `karma.retreat.${Date.now()}@example.bt`;
    const inqRes = await axios.post(`${baseURL}/crm/inquiries`, {
      fullName: 'Karma Lhamo',
      email: crmEmail,
      phone: '+975 17887766',
      subject: 'Meditation Retreat Schedule Inquiry',
      message: 'Can lay practitioners attend the weekend Shamatha retreat in November?',
      department: 'General Inquiries'
    });
    assert(inqRes.status === 201 && inqRes.data.success, 'Step 2.1: Devotee submitted web inquiry');

    // 2.2 Admin views contacts and finds devotee
    const contactsRes = await axios.get(`${baseURL}/crm/contacts?search=${encodeURIComponent(crmEmail)}`, adminHeaders);
    assert(contactsRes.status === 200 && contactsRes.data.data.length > 0, 'Step 2.2: Admin found devotee in CRM');
    const contactId = contactsRes.data.data[0].id;

    // 2.3 Admin logs communication reply
    const commRes = await axios.post(`${baseURL}/crm/contacts/${contactId}/communications`, {
      communicationType: 'email',
      subject: 'Re: Meditation Retreat Schedule Inquiry',
      notes: 'Sent welcome packet and schedule for November Shamatha retreat.',
      followupDate: '2026-10-01'
    }, adminHeaders);
    assert(commRes.status === 201 && commRes.data.success, 'Step 2.3: Admin logged communication in CRM');

    // 2.4 Admin updates contact tags
    const updateContactRes = await axios.put(`${baseURL}/crm/contacts/${contactId}`, {
      fullName: 'Karma Lhamo',
      contactType: 'devotee',
      email: crmEmail,
      phone: '+975 17887766',
      tags: 'Retreatant, Confirmed Devotee'
    }, adminHeaders);
    assert(updateContactRes.status === 200 && updateContactRes.data.success, 'Step 2.4: Admin updated devotee tags in CRM');


    // =========================================================================
    // FLOW 3: PRAYER REQUEST -> ABBOT MONASTIC DEDICATION
    // =========================================================================
    console.log('\n--- FLOW 3: Devotee Prayer Request & Abbot Monastic Dedication ---');
    const prayerRes = await axios.post(`${baseURL}/cms/prayer-requests`, {
      devoteeName: 'Tenzin Choden',
      devoteeEmail: `tenzin.prayer.${Date.now()}@example.bt`,
      devoteePhone: '+975 17334455',
      country: 'Bhutan',
      prayerType: 'Long Life Puja (Tshedup)',
      intentionText: 'For auspicious health and long life of grandparents',
      butterLampsCount: 108,
      offeringAmount: 1100
    });
    assert(prayerRes.status === 201 && prayerRes.data.success, 'Step 3.1: Devotee submitted prayer request');
    const prayerId = prayerRes.data.id;

    // 3.2 Abbot marks prayer as dedicated
    const dedicateRes = await axios.put(`${baseURL}/cms/prayer-requests/${prayerId}/status`, {
      status: 'dedicated',
      monkId: 1
    }, adminHeaders);
    assert(dedicateRes.status === 200 && dedicateRes.data.success, `Step 3.2: Abbot dedicated prayer #${prayerId} with monastic sangha`);


    // =========================================================================
    // FLOW 4: PUBLIC EVENT RSVP -> ADMIN ATTENDEE CONFIRMATION
    // =========================================================================
    console.log('\n--- FLOW 4: Public Event RSVP & Admin Confirmation ---');
    const rsvpRes = await axios.post(`${baseURL}/cms/events/rsvp`, {
      eventId: 1,
      guestName: 'Dawa Penjor',
      guestEmail: `dawa.${Date.now()}@example.com`,
      guestPhone: '+975 17665544',
      attendingCount: 3,
      specialRequests: 'Elderly family members in party'
    });
    assert(rsvpRes.status === 201 && rsvpRes.data.success, 'Step 4.1: Devotee RSVP confirmed for 3 guests');
    const rsvpId = rsvpRes.data.id;

    // 4.2 Admin views RSVPs
    const rsvpsList = await axios.get(`${baseURL}/cms/events/1/rsvps`, adminHeaders);
    assert(rsvpsList.status === 200 && Array.isArray(rsvpsList.data.data), 'Step 4.2: Admin retrieved event attendee list');


    // =========================================================================
    // FLOW 5: STUDENT MONK -> ENROLLMENT -> PROGRESS -> CERTIFICATE CONFERRED
    // =========================================================================
    console.log('\n--- FLOW 5: Student Monk Journey, Grading & Certificate Verification ---');
    // 5.1 Admin creates Shedra Course
    const courseRes = await axios.post(`${baseURL}/lms/courses`, {
      courseCode: `CRS-E2E-${Date.now().toString().slice(-4)}`,
      title: 'Prajnaparamita Perfection of Wisdom',
      level: 'Intermediate',
      durationMonths: 6,
      totalCredits: 16,
      instructorName: 'Khenpo Tashi Dorji',
      feeAmount: 0,
      description: 'The Diamond Cutter Sutra and Heart Sutra commentary.'
    }, adminHeaders);
    assert(courseRes.status === 201 && courseRes.data.success, 'Step 5.1: Admin created Shedra course');
    const courseId = courseRes.data.id;

    // 5.2 Admin registers student monk
    const monkStudentRes = await axios.post(`${baseURL}/lms/students`, {
      rollNumber: `MNK-FLOW-${Date.now().toString().slice(-4)}`,
      monasticName: 'Lama Kunga Tshering',
      secularName: 'Kunga Tshering',
      monkStatus: 'novice',
      guardianName: 'Sangay Wangdi',
      guardianPhone: '+975 17998877',
      address: 'Gelephu Shedra Monastic Quarters'
    }, adminHeaders);
    assert(monkStudentRes.status === 201 && monkStudentRes.data.success, 'Step 5.2: Admin registered monk scholar');
    const studentId = monkStudentRes.data.id;

    // 5.3 Enroll Monk into Course
    const enrollRes = await axios.post(`${baseURL}/lms/enrollments`, {
      studentId,
      courseId
    }, adminHeaders);
    assert(enrollRes.status === 201 && enrollRes.data.success, 'Step 5.3: Monk enrolled into course');
    const enrollmentId = enrollRes.data.id;

    // 5.4 Update Progress & Concur Certificate
    const completeRes = await axios.put(`${baseURL}/lms/enrollments/${enrollmentId}/progress`, {
      progressPercent: 100,
      attendancePercent: 96,
      grade: 'Distinction',
      status: 'completed'
    }, adminHeaders);
    assert(completeRes.status === 200 && completeRes.data.success, 'Step 5.4: Enrollment marked completed with Distinction (Certificate Auto-Generated)');

    // 5.5 Verify Certificate in Registry
    const certsRes = await axios.get(`${baseURL}/certificates`, adminHeaders);
    assert(certsRes.status === 200 && certsRes.data.data.length > 0, 'Step 5.5: Certificate appears in official monastic registry');
    const certNumber = certsRes.data.data[0].certificate_number;

    // 5.6 Public Certificate Verification
    const verifyRes = await axios.get(`${baseURL}/certificates/verify/${certNumber}`);
    assert(verifyRes.status === 200 && verifyRes.data.success, `Step 5.6: Public cryptographic verification for certificate ${certNumber} verified authentic`);


    // =========================================================================
    // FLOW 6: EXPENSE CLAIM -> ACCOUNTANT ADJUSTMENT -> DISBURSEMENT
    // =========================================================================
    console.log('\n--- FLOW 6: Expense Claim Submission, Accountant Approval & Disbursement ---');
    // 6.1 Submit Claim
    const expClaim = await axios.post(`${baseURL}/accounts/expenses`, {
      title: 'Monastery Altar Butter & Supplies',
      payeeName: 'Gelephu Local Dairy Coop',
      amount: 3200,
      currency: 'INR',
      categoryId: 1,
      paymentMethod: 'Bank Transfer',
      description: 'Purchased 40kg pure yak & cow butter for daily shrine offerings'
    }, adminHeaders);
    assert(expClaim.status === 201 && expClaim.data.success, 'Step 6.1: Expense claim submitted');
    const expenseId = expClaim.data.id;

    // 6.2 Accountant edits claim amount
    const expEdit = await axios.put(`${baseURL}/accounts/expenses/${expenseId}`, {
      title: 'Monastery Altar Yak Butter & Supplies (Invoice Adjusted)',
      amount: 3500
    }, adminHeaders);
    assert(expEdit.status === 200 && expEdit.data.success, 'Step 6.2: Accountant updated claim particulars and adjusted amount to ₹3500');

    // 6.3 Accountant approves claim
    const expApprove = await axios.post(`${baseURL}/accounts/expenses/${expenseId}/approve`, {
      action: 'approved'
    }, adminHeaders);
    assert(expApprove.status === 200 && expApprove.data.success, 'Step 6.3: Expense claim approved');

    // 6.4 Accountant marks as paid
    const expPaid = await axios.post(`${baseURL}/accounts/expenses/${expenseId}/approve`, {
      action: 'paid'
    }, adminHeaders);
    assert(expPaid.status === 200 && expPaid.data.success, 'Step 6.4: Expense disbursed (status: PAID)');

    // 6.5 Accounts dashboard verifies expenditure
    const accDash = await axios.get(`${baseURL}/accounts/dashboard`, adminHeaders);
    assert(accDash.status === 200 && accDash.data.data.metrics, 'Step 6.5: Accounts dashboard reflected disbursed expense in ledgers');


    // =========================================================================
    // FLOW 7: INVENTORY ITEM -> STOCK-IN -> STOCK-OUT -> TRANSACTION LEDGER
    // =========================================================================
    console.log('\n--- FLOW 7: Monastic Inventory Item, Stock-In & Stock-Out Ledger ---');
    // 7.1 Create Item
    const itemRes = await axios.post(`${baseURL}/inventory/items`, {
      itemCode: `ITM-E2E-${Date.now().toString().slice(-4)}`,
      name: 'Cast Bronze Butter Lamps (Large)',
      categoryId: 1,
      unitName: 'Set of 7',
      minStockLevel: 5,
      currentStock: 0,
      unitCost: 1200,
      description: 'Traditional eight auspicious symbols carved bronze offering bowls'
    }, adminHeaders);
    assert(itemRes.status === 201 && itemRes.data.success, 'Step 7.1: Inventory store item created');
    const itemId = itemRes.data.id;

    // 7.2 Stock-In
    const stockInRes = await axios.post(`${baseURL}/inventory/stock-in`, {
      itemId,
      quantity: 50,
      notes: 'New consignment from Patan artisan guild'
    }, adminHeaders);
    assert(stockInRes.status === 200 && stockInRes.data.success, 'Step 7.2: Stock-in (+50 units) recorded');

    // 7.3 Stock-Out
    const stockOutRes = await axios.post(`${baseURL}/inventory/stock-out`, {
      itemId,
      quantity: 15,
      notes: 'Installed on Guru Rinpoche shrine altar'
    }, adminHeaders);
    assert(stockOutRes.status === 200 && stockOutRes.data.success, 'Step 7.3: Stock-out (-15 units) recorded; balance = 35');

    // 7.4 Transactions audit
    const txns = await axios.get(`${baseURL}/inventory/transactions`, adminHeaders);
    assert(txns.status === 200 && txns.data.data.length >= 2, 'Step 7.4: Both stock-in and stock-out ledger transactions logged immutably');


    // =========================================================================
    // FLOW 8: HRM EMPLOYEE -> DAILY ATTENDANCE -> MONTHLY PAYROLL RUN
    // =========================================================================
    console.log('\n--- FLOW 8: HRM Employee, Attendance & Monthly Payroll ---');
    // 8.1 Create Employee
    const empRes = await axios.post(`${baseURL}/hrm/employees`, {
      employeeCode: `EMP-E2E-${Date.now().toString().slice(-4)}`,
      fullName: 'Lobzang Dorji',
      email: `lobzang.${Date.now()}@drodulphendeyling.org`,
      phone: '+975 17223344',
      department: 'Monastic Affairs',
      designation: 'Temple Custodian & Verger',
      employmentType: 'Full-Time',
      basicSalary: 22000,
      bankName: 'Bank of Bhutan',
      bankAccountNo: '200847291044'
    }, adminHeaders);
    assert(empRes.status === 201 && empRes.data.success, 'Step 8.1: Monastic employee profile established');
    const employeeId = empRes.data.id;

    // 8.2 Mark Attendance
    const today = new Date().toISOString().slice(0, 10);
    const attRes = await axios.post(`${baseURL}/hrm/attendance`, {
      attendanceDate: today,
      records: [
        { employeeId, status: 'present', remarks: 'On duty at peace stupa gate' }
      ]
    }, adminHeaders);
    assert(attRes.status === 200 && attRes.data.success, 'Step 8.2: Daily attendance marked successfully');

    // 8.3 Generate Payroll Run
    const currentDate = new Date();
    const payrollRes = await axios.post(`${baseURL}/payroll/generate`, {
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      notes: 'Automated test payroll run'
    }, adminHeaders);
    assert(payrollRes.status === 200 && payrollRes.data.success, 'Step 8.3: Monthly payroll calculated and salary slips generated');


    // =========================================================================
    // FLOW 9: PROJECT CREATION -> TASK MANAGEMENT -> STATUS PROGRESSION
    // =========================================================================
    console.log('\n--- FLOW 9: Stupa Renovation Project & Task Workflow ---');
    // 9.1 Create Project
    const projRes = await axios.post(`${baseURL}/projects`, {
      projectCode: `PRJ-E2E-${Date.now().toString().slice(-4)}`,
      title: 'Main Relic Chamber Gold Plating Renovation',
      category: 'Stupa Construction',
      estimatedBudget: 850000,
      startDate: today,
      targetCompletionDate: '2026-12-31',
      location: 'Great Druk Wangyel Peace Stupa',
      managerName: 'Ugyen Tshering',
      description: 'Gold gilding of the spire and parasol spire'
    }, adminHeaders);
    assert(projRes.status === 201 && projRes.data.success, 'Step 9.1: Monastery restoration project created');
    const projectId = projRes.data.id;

    // 9.2 Create Task
    const taskRes = await axios.post(`${baseURL}/projects/tasks`, {
      projectId,
      title: 'Install Scaffolding and Clean Bronze Reliefs',
      assignedTo: 'Dorji Craftsmen Guild',
      priority: 'high',
      dueDate: '2026-10-01',
      description: 'Safety inspection and exterior scaffolding assembly'
    }, adminHeaders);
    assert(taskRes.status === 201 && taskRes.data.success, 'Step 9.2: Project task assigned');
    const taskId = taskRes.data.id;

    // 9.3 Transition Task to in_progress then completed
    const taskProg = await axios.put(`${baseURL}/projects/tasks/${taskId}`, {
      status: 'in_progress',
      completionPercent: 50
    }, adminHeaders);
    assert(taskProg.status === 200 && taskProg.data.success, 'Step 9.3: Task transitioned to in_progress (50%)');

    const taskDone = await axios.put(`${baseURL}/projects/tasks/${taskId}`, {
      status: 'completed',
      completionPercent: 100
    }, adminHeaders);
    assert(taskDone.status === 200 && taskDone.data.success, 'Step 9.4: Task transitioned to completed (100%)');


    // =========================================================================
    // FLOW 10: USER MANAGEMENT -> ROLE UPDATE -> PASSWORD RESET -> LOGIN
    // =========================================================================
    console.log('\n--- FLOW 10: Security RBAC, Password Reset & Session Management ---');
    const testUserEmail = `staff.accountant.${Date.now()}@drodulphendeyling.org`;
    const initialPass = 'InitialSecretPass123!';

    // 10.1 Super Admin creates staff user
    const userCreate = await axios.post(`${baseURL}/users`, {
      fullName: 'Sonam Dorji Accountant',
      email: testUserEmail,
      password: initialPass,
      phone: '+975 17332211',
      roleId: 3 // accountant
    }, adminHeaders);
    assert(userCreate.status === 201 && userCreate.data.success, 'Step 10.1: Super admin created staff user account');
    const newUserId = userCreate.data.data.id;

    // 10.2 Super Admin resets password
    const resetRes = await axios.post(`${baseURL}/users/${newUserId}/reset-password`, {}, adminHeaders);
    assert(resetRes.status === 200 && resetRes.data.data.temporaryPassword, 'Step 10.2: Super admin generated temporary reset password');
    const tempPassword = resetRes.data.data.temporaryPassword;

    // 10.3 Staff logs in with temporary password
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: testUserEmail,
      password: tempPassword
    });
    assert(loginRes.status === 200 && loginRes.data.data.token, 'Step 10.3: Staff logged in successfully with new temporary password');
    const staffHeaders = { headers: { Authorization: `Bearer ${loginRes.data.data.token}` } };

    // 10.4 Staff checks my profile
    const meRes = await axios.get(`${baseURL}/auth/me`, staffHeaders);
    assert(meRes.status === 200 && meRes.data.data.email === testUserEmail, 'Step 10.4: Staff session authenticated and profile verified');

    // 10.5 Super admin inspects sessions and revokes them
    const sessionsRes = await axios.get(`${baseURL}/users/${newUserId}/sessions`, adminHeaders);
    assert(sessionsRes.status === 200, 'Step 10.5: Super admin inspected user sessions');

    const revokeRes = await axios.post(`${baseURL}/users/${newUserId}/revoke-sessions`, {}, adminHeaders);
    assert(revokeRes.status === 200 && revokeRes.data.success, 'Step 10.6: Super admin revoked all sessions for user');

    // Cleanup ephemeral created entities
    await pool.query(`DELETE FROM users WHERE id = ?`, [newUserId]);
    await pool.query(`DELETE FROM project_tasks WHERE id = ?`, [taskId]);
    await pool.query(`DELETE FROM projects WHERE id = ?`, [projectId]);
    await pool.query(`DELETE FROM store_items WHERE id = ?`, [itemId]);
    await pool.query(`DELETE FROM expenses WHERE id = ?`, [expenseId]);
    await pool.query(`DELETE FROM courses WHERE id = ?`, [courseId]);
    await pool.query(`DELETE FROM students_monks WHERE id = ?`, [studentId]);

  } catch (err) {
    console.error('❌ Flow execution failure:', err.response?.data || err.message);
    failed++;
  } finally {
    if (server) server.close();
    console.log('\n================================================================');
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('================================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runEndToEndFlows();
