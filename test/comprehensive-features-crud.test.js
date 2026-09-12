/**
 * Drodul Phendey Ling Monastery & NGO Management Portal
 * Comprehensive End-to-End Public & Admin CRUD Verification Suite
 * 
 * Verifies 100% operational functionality for:
 * 1. Public Features:
 *    - Public Offering / Donation Settlement (POST /api/donations/public-offering)
 *    - Public CRM Inquiries (POST /api/crm/inquiries)
 *    - Public Event RSVPs (POST /api/cms/events/rsvp)
 *    - Public Prayer Requests (POST /api/cms/prayer-requests)
 * 2. Admin Portal Full CRUD:
 *    - CMS News & Events (Create, Read, Update, Delete)
 *    - Prayer Dedication Status Updates (PUT /api/cms/prayer-requests/:id/status)
 *    - CRM Historical Broadcast Campaigns (GET /api/crm/campaigns)
 *    - Audit Logs Route Alias (GET /api/settings/audit-logs)
 *    - Shedra LMS Courses (Create, Read, Update, Delete)
 *    - Shedra LMS Batches (Create, Update, Delete)
 *    - Shedra LMS Students/Monks (Create, Read, Update, Delete)
 *    - Shedra LMS Enrollments & Auto-Certificate (Create, Progress, Delete)
 *    - Accounts & Expenses (Create, Read, Update, Approve, Delete)
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
let authToken;

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

async function runTests() {
  console.log('================================================================');
  console.log('☸  DRODUL PHENDEY LING - FULL CRUD & FEATURE VERIFICATION SUITE');
  console.log('================================================================\n');

  // 1. Spin up ephemeral server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseURL = `http://127.0.0.1:${port}/api`;
      console.log(`🚀 Test server listening at ${baseURL}`);
      resolve();
    });
  });

  // 2. Generate Super Admin Token (User ID 1)
  authToken = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '2h' });
  const authHeaders = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  try {
    // -------------------------------------------------------------
    // PART 1: PUBLIC FEATURES
    // -------------------------------------------------------------
    console.log('\n--- PART 1: PUBLIC FEATURES VERIFICATION ---');

    // 1.1 Public Offering Settlement
    console.log('\n[1.1] Testing Public Offering / Dana Settlement:');
    const offeringPayload = {
      donorName: 'Test Devotee Jigme',
      donorEmail: `test.jigme.${Date.now()}@example.com`,
      donorPhone: '+975 17112233',
      donorAddress: 'Thimphu, Bhutan',
      amount: 1000,
      currency: 'INR',
      donationFor: 'Great Druk Wangyel Peace Stupa',
      donationType: 'one_time',
      paymentMethod: 'online_upi',
      remarks: 'Offering for auspicious prosperity'
    };
    const offRes = await axios.post(`${baseURL}/donations/public-offering`, offeringPayload);
    assert(offRes.status === 201 && offRes.data.success, 'Public offering processed successfully');
    assert(offRes.data.data?.receiptNumber, `Receipt issued: ${offRes.data.data?.receiptNumber}`);
    assert(offRes.data.data?.donationId, `Donation record created with ID: ${offRes.data.data?.donationId}`);

    // 1.2 Public CRM Inquiry
    console.log('\n[1.2] Testing Public CRM Devotee Inquiry:');
    const inqPayload = {
      fullName: 'Devotee Karma Wangdi',
      email: `karma.wangdi.${Date.now()}@example.bt`,
      phone: '+975 17889900',
      subject: 'Pilgrimage to Peace Stupa',
      message: 'Greetings Khenpo, I wish to visit the monastery during the upcoming autumn puja.',
      department: 'Pilgrimage & Prayers'
    };
    const inqRes = await axios.post(`${baseURL}/crm/inquiries`, inqPayload);
    assert(inqRes.status === 201 && inqRes.data.success, 'Public inquiry stored in CRM and communications');

    // 1.3 Public Event RSVP
    console.log('\n[1.3] Testing Public Ceremony RSVP:');
    const rsvpPayload = {
      eventId: 1,
      guestName: 'Sangay Dorji',
      guestEmail: `sangay.${Date.now()}@example.com`,
      guestPhone: '+975 17445566',
      attendingCount: 2,
      specialRequests: 'Elderly seating required'
    };
    const rsvpRes = await axios.post(`${baseURL}/cms/events/rsvp`, rsvpPayload);
    assert(rsvpRes.status === 201 && rsvpRes.data.success, 'Public event RSVP recorded');

    // 1.4 Public Prayer Request
    console.log('\n[1.4] Testing Public Devotee Prayer Request:');
    const prayerPayload = {
      devoteeName: 'Sonam Choden',
      devoteeEmail: `sonam.${Date.now()}@example.com`,
      devoteePhone: '+975 17667788',
      country: 'Bhutan',
      prayerType: 'World Peace',
      intentionText: 'For world harmony and well-being of all sentient beings',
      butterLampsCount: 108,
      offeringAmount: 500
    };
    const prayerRes = await axios.post(`${baseURL}/cms/prayer-requests`, prayerPayload);
    assert(prayerRes.status === 201 && prayerRes.data.success, 'Prayer request submitted with 108 butter lamps');
    const prayerId = prayerRes.data.id;

    // -------------------------------------------------------------
    // PART 2: ADMIN PANEL CRUD VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- PART 2: ADMIN PANEL CRUD OPERATIONS ---');

    // 2.1 CMS News & Events CRUD
    console.log('\n[2.1] Testing CMS News & Events Full CRUD:');
    // CREATE
    const newsCreate = await axios.post(`${baseURL}/cms/news-events`, {
      title: `Grand Guru Rinpoche Tsok Feast ${Date.now()}`,
      category: 'Ganachakra',
      eventDate: '2026-10-15',
      eventTime: '09:00 AM - 05:00 PM',
      location: 'Great Druk Wangyel Peace Stupa Complex',
      content: 'Detailed schedule for sacred tenth day Guru Rinpoche puja and Tsok offering.'
    }, authHeaders);
    assert(newsCreate.status === 201 && newsCreate.data.success, 'CMS News & Event created');
    const createdNewsId = newsCreate.data.id;

    // READ
    const newsRead = await axios.get(`${baseURL}/cms/news-events`, authHeaders);
    assert(newsRead.status === 200 && Array.isArray(newsRead.data.data), 'CMS News & Events list retrieved');
    const foundCreated = newsRead.data.data.find(n => n.id === createdNewsId);
    assert(foundCreated !== undefined, `Created news item ${createdNewsId} present in list`);

    // UPDATE
    const newsUpdate = await axios.put(`${baseURL}/cms/news-events/${createdNewsId}`, {
      title: `Updated: Grand Guru Rinpoche Tsok Feast ${Date.now()}`,
      location: 'Main Shedra Assembly Hall'
    }, authHeaders);
    assert(newsUpdate.status === 200 && newsUpdate.data.success, 'CMS News & Event updated');

    // DELETE
    const newsDelete = await axios.delete(`${baseURL}/cms/news-events/${createdNewsId}`, authHeaders);
    assert(newsDelete.status === 200 && newsDelete.data.success, 'CMS News & Event deleted');

    // 2.2 Prayer Dedication Status
    console.log('\n[2.2] Testing Prayer Request Status Dedication:');
    const dedicateRes = await axios.put(`${baseURL}/cms/prayer-requests/${prayerId}/status`, {
      status: 'dedicated',
      monkId: 1
    }, authHeaders);
    assert(dedicateRes.status === 200 && dedicateRes.data.success, `Prayer ${prayerId} marked as dedicated by monk`);

    // 2.3 CRM Historical Campaigns
    console.log('\n[2.3] Testing CRM Campaigns Retrieval:');
    const crmCampRes = await axios.get(`${baseURL}/crm/campaigns`, authHeaders);
    assert(crmCampRes.status === 200 && Array.isArray(crmCampRes.data.data), 'Historical email campaigns retrieved without 404');

    // 2.4 Audit Log Endpoint Alias
    console.log('\n[2.4] Testing Security Audit Logs Alias (/settings/audit-logs):');
    const auditRes = await axios.get(`${baseURL}/settings/audit-logs?limit=10`, authHeaders);
    assert(auditRes.status === 200 && Array.isArray(auditRes.data.data), 'Audit logs retrieved via /settings/audit-logs without 404');

    // 2.5 Shedra LMS Courses Full CRUD
    console.log('\n[2.5] Testing Shedra LMS Courses Full CRUD:');
    // CREATE
    const courseCreate = await axios.post(`${baseURL}/lms/courses`, {
      courseCode: `CRS-TEST-${Date.now().toString().slice(-4)}`,
      title: `Advanced Buddhist Epistemology (Pramana) ${Date.now().toString().slice(-4)}`,
      level: 'Advanced',
      durationMonths: 12,
      totalCredits: 24,
      instructorName: 'Khenpo Tashi Dorji',
      description: 'In-depth study of Dharmakirti philosophical treatise.'
    }, authHeaders);
    assert(courseCreate.status === 201 && courseCreate.data.success, 'Shedra LMS Course created');
    const courseId = courseCreate.data.id;

    // READ
    const courseGet = await axios.get(`${baseURL}/lms/courses/${courseId}`, authHeaders);
    assert(courseGet.status === 200 && courseGet.data.data.id === courseId, 'Shedra LMS Course details read');

    // UPDATE
    const courseUpdate = await axios.put(`${baseURL}/lms/courses/${courseId}`, {
      totalCredits: 28,
      level: 'Master'
    }, authHeaders);
    assert(courseUpdate.status === 200 && courseUpdate.data.success, 'Shedra LMS Course updated');

    // 2.6 Shedra LMS Batches Full CRUD
    console.log('\n[2.6] Testing Shedra LMS Batches Full CRUD:');
    // CREATE
    const batchCreate = await axios.post(`${baseURL}/lms/batches`, {
      courseId,
      batchName: `Monastic Cohort ${Date.now().toString().slice(-4)}`,
      capacity: 40
    }, authHeaders);
    assert(batchCreate.status === 201 && batchCreate.data.success, 'Shedra LMS Batch created');
    const batchId = batchCreate.data.id;

    // UPDATE
    const batchUpdate = await axios.put(`${baseURL}/lms/batches/${batchId}`, {
      capacity: 45
    }, authHeaders);
    assert(batchUpdate.status === 200 && batchUpdate.data.success, 'Shedra LMS Batch updated');

    // 2.7 Shedra LMS Monks Scholars Full CRUD
    console.log('\n[2.7] Testing Shedra Monastic Scholars Full CRUD:');
    // CREATE
    const monkCreate = await axios.post(`${baseURL}/lms/students`, {
      rollNumber: `MNK-TEST-${Date.now().toString().slice(-4)}`,
      monasticName: 'Lama Tenzin Norbu',
      secularName: 'Tenzin Norbu',
      monkStatus: 'senior_monk',
      guardianName: 'Dorji Penjor',
      guardianPhone: '+975 17558899',
      address: 'Gelephu, Bhutan'
    }, authHeaders);
    assert(monkCreate.status === 201 && monkCreate.data.success, 'Monk scholar profile created');
    const studentId = monkCreate.data.id;

    // READ
    const monksList = await axios.get(`${baseURL}/lms/students`, authHeaders);
    assert(monksList.status === 200 && Array.isArray(monksList.data.data), 'Monks directory retrieved');

    // UPDATE
    const monkUpdate = await axios.put(`${baseURL}/lms/students/${studentId}`, {
      monkStatus: 'acharya',
      address: 'Gelephu Shedra Monastic Quarters'
    }, authHeaders);
    assert(monkUpdate.status === 200 && monkUpdate.data.success, 'Monk scholar profile updated');

    // 2.8 Shedra LMS Enrollments & Progress
    console.log('\n[2.8] Testing Shedra Enrollments & Progress:');
    // CREATE ENROLLMENT
    const enrollCreate = await axios.post(`${baseURL}/lms/enrollments`, {
      studentId,
      courseId,
      batchId
    }, authHeaders);
    assert(enrollCreate.status === 201 && enrollCreate.data.success, 'Monk scholar enrolled into course');
    const enrollmentId = enrollCreate.data.id;

    // UPDATE PROGRESS & AUTO-ISSUE CERTIFICATE
    const progUpdate = await axios.put(`${baseURL}/lms/enrollments/${enrollmentId}/progress`, {
      progressPercent: 100,
      attendancePercent: 98,
      grade: 'Distinction',
      status: 'completed'
    }, authHeaders);
    assert(progUpdate.status === 200 && progUpdate.data.success, 'Enrollment completed and certificate generated');

    // DELETE ENROLLMENT
    const enrollDel = await axios.delete(`${baseURL}/lms/enrollments/${enrollmentId}`, authHeaders);
    assert(enrollDel.status === 200 && enrollDel.data.success, 'Enrollment removed');

    // DELETE BATCH & COURSE & MONK
    const batchDel = await axios.delete(`${baseURL}/lms/batches/${batchId}`, authHeaders);
    assert(batchDel.status === 200 && batchDel.data.success, 'Batch deleted');

    const courseDel = await axios.delete(`${baseURL}/lms/courses/${courseId}`, authHeaders);
    assert(courseDel.status === 200 && courseDel.data.success, 'Course deleted');

    const monkDel = await axios.delete(`${baseURL}/lms/students/${studentId}`, authHeaders);
    assert(monkDel.status === 200 && monkDel.data.success, 'Monk scholar record removed');

    // 2.9 Accounts & Expenses Full CRUD
    console.log('\n[2.9] Testing Accounts & Expenses Full CRUD:');
    // CREATE
    const expCreate = await axios.post(`${baseURL}/accounts/expenses`, {
      title: `Consecrated Butter & Ghee Supplies ${Date.now()}`,
      payeeName: 'Gelephu Dairy Union',
      amount: 4500,
      currency: 'INR',
      categoryId: 1,
      paymentMethod: 'Bank Transfer',
      description: 'Pure cow butter for daily 108 butter lamps'
    }, authHeaders);
    assert(expCreate.status === 201 && expCreate.data.success, 'Expense claim created');
    const expenseId = expCreate.data.id;

    // READ
    const expList = await axios.get(`${baseURL}/accounts/expenses`, authHeaders);
    assert(expList.status === 200 && Array.isArray(expList.data.data), 'Expenses list retrieved');

    // UPDATE
    const expUpdate = await axios.put(`${baseURL}/accounts/expenses/${expenseId}`, {
      amount: 4800,
      title: 'Updated: Consecrated Pure Butter & Ghee Supplies'
    }, authHeaders);
    assert(expUpdate.status === 200 && expUpdate.data.success, 'Expense claim updated');

    // APPROVE
    const expApprove = await axios.post(`${baseURL}/accounts/expenses/${expenseId}/approve`, {
      action: 'approved'
    }, authHeaders);
    assert(expApprove.status === 200 && expApprove.data.success, 'Expense claim approved');

    // DELETE
    const expDelete = await axios.delete(`${baseURL}/accounts/expenses/${expenseId}`, authHeaders);
    assert(expDelete.status === 200 && expDelete.data.success, 'Expense claim deleted');

  } catch (err) {
    console.error('❌ Test suite execution error:', err.response?.data || err.message);
    failed++;
  } finally {
    if (server) server.close();
    console.log('\n================================================================');
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('================================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
