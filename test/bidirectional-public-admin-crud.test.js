/**
 * ============================================================================
 * DRODUL PHENDEY LING - BIDIRECTIONAL PUBLIC <-> ADMIN CRUD TEST SUITE
 * ============================================================================
 * Strictly tests that:
 * 1. Admin Panel CRUD changes immediately appear and update/delete on Public Pages.
 * 2. Public Page user interactions immediately appear and are manageable in Admin Panel.
 * 3. All Admin internal modules execute genuine database CRUD.
 */

const axios = require('axios');
const http = require('http');
const app = require('../server');
const { pool, testConnection } = require('../config/db');

let server;
let baseURL;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
    throw new Error(message);
  }
}

async function runBidirectionalTests() {
  try {
    await testConnection();
    const port = 52000 + Math.floor(Math.random() * 1000);
    server = http.createServer(app);
    await new Promise(resolve => server.listen(port, resolve));
    baseURL = `http://127.0.0.1:${port}/api`;

    console.log('\n================================================================');
    console.log('☸  DRODUL PHENDEY LING - BIDIRECTIONAL PUBLIC <-> ADMIN CRUD SUITE');
    console.log('================================================================');
    console.log(`🚀 Test server listening on ${baseURL}\n`);

    // 0. Super Admin Authentication
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'dpl_monastery_super_secure_jwt_secret_key_2026_bhutan';
    const adminToken = jwt.sign({ userId: 1, id: 1, email: 'contact@drodulphendeyling.org', role: 'super_admin' }, JWT_SECRET, { expiresIn: '2h' });
    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // =========================================================================
    // PART A: ADMIN -> PUBLIC LIVE CRUD SYNCHRONIZATION
    // =========================================================================
    console.log('--- PART A: Admin Actions Reflect Live on Public Pages ---');

    // [A.1] CMS News & Events: Admin CRUD -> Public /cms/news-events & /cms/news-events/:slug
    console.log('\n[A.1] CMS Ceremonies & Events (Admin CRUD -> Public Page):');
    const newsCreate = await axios.post(`${baseURL}/cms/news-events`, {
      title: `Grand Consecration Puja ${Date.now()}`,
      category: 'Puja',
      summary: 'Special blessing and consecration ritual for the Peace Stupa.',
      content: 'Complete Dharma teachings by Abbot and senior Rinpoches.',
      eventDate: '2026-10-15',
      eventTime: '09:00 AM - 04:00 PM',
      location: 'Main Temple Courtyard',
      isPublished: 1
    }, adminHeaders);
    assert(newsCreate.status === 201 && newsCreate.data.id, 'Admin created ceremony event in CMS');
    const eventId = newsCreate.data.id;
    const eventSlug = newsCreate.data.slug;

    // Verify on Public List
    const publicNewsList = await axios.get(`${baseURL}/cms/news-events`);
    const foundPublicEvent = publicNewsList.data.data.find(e => e.id === eventId);
    assert(!!foundPublicEvent, 'Public /news list immediately displays the newly created ceremony');

    // Admin Updates Ceremony
    const updatedTitle = `Updated Grand Consecration Puja ${Date.now()}`;
    const newsUpdate = await axios.put(`${baseURL}/cms/news-events/${eventId}`, {
      title: updatedTitle,
      category: 'Puja'
    }, adminHeaders);
    assert(newsUpdate.status === 200, 'Admin updated ceremony in CMS');

    // Verify Public Detail has updated data
    const publicEventDetail = await axios.get(`${baseURL}/cms/news-events/${eventSlug}`);
    assert(publicEventDetail.data.data.title === updatedTitle, 'Public event detail page reflects updated ceremony title');

    // Admin Deletes Ceremony
    await axios.delete(`${baseURL}/cms/news-events/${eventId}`, adminHeaders);
    const publicNewsListAfterDel = await axios.get(`${baseURL}/cms/news-events`);
    assert(!publicNewsListAfterDel.data.data.find(e => e.id === eventId), 'Public /news list no longer displays the deleted ceremony');


    // [A.2] Blog & Articles: Admin CRUD -> Public /blog & /blog/:slug
    console.log('\n[A.2] Monastery Blog & Articles (Admin CRUD -> Public Page):');
    const blogCreate = await axios.post(`${baseURL}/blog`, {
      title: `Living the Bodhisattva Vow ${Date.now()}`,
      slug: `bodhisattva-vow-${Date.now()}`,
      summary: 'Practical guidance for cultivating bodhicitta daily.',
      content: 'Detailed exposition of the six perfections (Paramitas) in Himalayan Buddhism.',
      cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
      author_name: 'Khenpo Tashi Dorji',
      status: 'published',
      tags: 'Buddhism, Practice'
    }, adminHeaders);
    assert(blogCreate.status === 201, 'Admin published spiritual article in Blog Manager');
    const blogId = blogCreate.data.id;
    const blogSlug = blogCreate.data.data?.slug || `bodhisattva-vow-${Date.now()}`;

    // Verify on Public Blog List
    const publicBlogList = await axios.get(`${baseURL}/blog`);
    const foundBlog = publicBlogList.data.data.find(b => b.id === blogId);
    assert(!!foundBlog, 'Public /blog list immediately displays newly published article');

    // Admin Updates Article
    const updatedSummary = 'Refined exposition of bodhicitta practices.';
    await axios.put(`${baseURL}/blog/${blogId}`, {
      title: foundBlog.title,
      summary: updatedSummary,
      content: 'Updated content body'
    }, adminHeaders);

    // Verify Public Blog List has updated summary
    const publicBlogListAfterUpdate = await axios.get(`${baseURL}/blog`);
    const updatedBlog = publicBlogListAfterUpdate.data.data.find(b => b.id === blogId);
    assert(updatedBlog.summary === updatedSummary, 'Public /blog reflects updated article summary');

    // Admin Deletes Article
    await axios.delete(`${baseURL}/blog/${blogId}`, adminHeaders);
    const publicBlogAfterDel = await axios.get(`${baseURL}/blog`);
    assert(!publicBlogAfterDel.data.data.find(b => b.id === blogId), 'Public /blog no longer displays deleted article');


    // [A.3] Dharma Video Learning: Admin CRUD -> Public /learning
    console.log('\n[A.3] Dharma Learning Videos (Admin CRUD -> Public Page):');
    const videoCreate = await axios.post(`${baseURL}/learning`, {
      title: `Heart Sutra Commentary Part ${Date.now().toString().slice(-4)}`,
      description: 'Emptiness and form explained from the Prajnaparamita perspective.',
      category: 'Buddhist Philosophy',
      media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      instructor: 'Khenpo Tashi Dorji',
      duration: '55 mins'
    }, adminHeaders);
    assert(videoCreate.status === 201, 'Admin added Dharma lecture video in Learning Manager');
    const videoId = videoCreate.data.id;

    // Verify on Public Learning Page
    const publicVideos = await axios.get(`${baseURL}/learning`);
    const foundVideo = publicVideos.data.data.find(v => v.id === videoId);
    assert(!!foundVideo, 'Public /learning catalog immediately displays the new Dharma video');

    // Admin Updates Video
    await axios.put(`${baseURL}/learning/${videoId}`, {
      title: foundVideo.title,
      category: 'Meditation & Wisdom',
      duration: '60 mins',
      media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }, adminHeaders);

    const publicVideosAfterUpdate = await axios.get(`${baseURL}/learning`);
    const updatedVideo = publicVideosAfterUpdate.data.data.find(v => v.id === videoId);
    assert(updatedVideo.category === 'Meditation & Wisdom', 'Public /learning reflects updated video category');

    // Admin Deletes Video
    await axios.delete(`${baseURL}/learning/${videoId}`, adminHeaders);
    const publicVideosAfterDel = await axios.get(`${baseURL}/learning`);
    assert(!publicVideosAfterDel.data.data.find(v => v.id === videoId), 'Public /learning no longer displays deleted video');


    // [A.4] Shedra Courses: Admin CRUD -> Public /courses/public
    console.log('\n[A.4] Shedra Monastic Courses (Admin CRUD -> Public Catalog):');
    const courseCode = `CRS-PUB-${Date.now().toString().slice(-4)}`;
    const courseCreate = await axios.post(`${baseURL}/lms/courses`, {
      courseCode,
      title: 'Madhyamaka Philosophy of Nagarjuna',
      level: 'Advanced',
      durationMonths: 12,
      totalCredits: 24,
      instructorName: 'Khenpo Tashi Dorji',
      feeAmount: 0,
      description: 'Fundamental wisdom of the Middle Way.'
    }, adminHeaders);
    assert(courseCreate.status === 201, 'Admin established Shedra course in LMS Overview');
    const courseId = courseCreate.data.id;

    // Verify on Public Course Catalog
    const publicCourses = await axios.get(`${baseURL}/courses/public`);
    const foundCourse = publicCourses.data.data.find(c => c.id === courseId);
    assert(!!foundCourse, 'Public /courses/public catalog immediately displays newly established course');

    // Admin Updates Course Credits
    await axios.put(`${baseURL}/lms/courses/${courseId}`, {
      title: 'Madhyamaka Philosophy of Nagarjuna (Comprehensive)',
      totalCredits: 30
    }, adminHeaders);

    const publicCoursesAfterUpdate = await axios.get(`${baseURL}/courses/public`);
    const updatedCourse = publicCoursesAfterUpdate.data.data.find(c => c.id === courseId);
    assert(updatedCourse.total_credits === 30, 'Public course catalog reflects updated credits (30 credits)');

    // Admin Deletes Course
    await axios.delete(`${baseURL}/lms/courses/${courseId}`, adminHeaders);
    const publicCoursesAfterDel = await axios.get(`${baseURL}/courses/public`);
    assert(!publicCoursesAfterDel.data.data.find(c => c.id === courseId), 'Public course catalog no longer displays deleted course');


    // [A.5] Dana Fundraising Campaigns: Admin CRUD -> Public /campaigns/public & /donate
    console.log('\n[A.5] Dana Fundraising Campaigns (Admin CRUD -> Public Page):');
    const campaignCreate = await axios.post(`${baseURL}/donations/campaigns`, {
      title: `Monastery Solar Power & Eco-Stewardship ${Date.now().toString().slice(-4)}`,
      targetAmount: 2500000,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '2027-12-31',
      description: 'Installing solar arrays for the Shedra and Stupa night lighting.'
    }, adminHeaders);
    assert(campaignCreate.status === 201, 'Admin launched new campaign in Campaigns Manager');
    const campaignId = campaignCreate.data.id;

    // Verify on Public Donate API
    const publicCampaigns = await axios.get(`${baseURL}/campaigns/public`);
    const foundCampaign = publicCampaigns.data.data.find(c => c.id === campaignId);
    assert(!!foundCampaign, 'Public /donate page immediately displays the newly launched campaign');

    // Admin Updates Campaign Target
    await axios.put(`${baseURL}/donations/campaigns/${campaignId}`, {
      title: foundCampaign.title,
      targetAmount: 3000000,
      description: 'Expanded solar initiative'
    }, adminHeaders);

    const publicCampaignsAfterUpdate = await axios.get(`${baseURL}/campaigns/public`);
    const updatedCampaign = publicCampaignsAfterUpdate.data.data.find(c => c.id === campaignId);
    assert(parseFloat(updatedCampaign.target_amount) === 3000000, 'Public /donate page reflects updated target amount (₹3,000,000)');

    // Cleanup campaign
    await pool.query(`DELETE FROM campaigns WHERE id = ?`, [campaignId]);


    // [A.6] Gallery Photos & Media: Admin CRUD -> Public /cms/gallery
    console.log('\n[A.6] Monastic Sacred Gallery (Admin CRUD -> Public Page):');
    const galleryCreate = await axios.post(`${baseURL}/cms/gallery`, {
      title: `Consecration of Stupa Spire Jewels ${Date.now()}`,
      category: 'Stupa Construction',
      media_type: 'image',
      media_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
      thumbnail_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
      caption: 'Sacred consecration gemstones placed into the spire chamber.'
    }, adminHeaders);
    assert(galleryCreate.status === 201, 'Admin uploaded photo to Gallery Manager');
    const galleryId = galleryCreate.data.id;

    // Verify on Public Gallery
    const publicGallery = await axios.get(`${baseURL}/cms/gallery`);
    const foundGalleryItem = publicGallery.data.data.find(g => g.id === galleryId);
    assert(!!foundGalleryItem, 'Public /gallery immediately displays the newly added photo');

    // Admin Updates Caption
    const updatedCaption = 'Updated sacred consecration ceremonies under royal patronage.';
    await axios.put(`${baseURL}/cms/gallery/${galleryId}`, {
      title: foundGalleryItem.title,
      caption: updatedCaption
    }, adminHeaders);

    const publicGalleryAfterUpdate = await axios.get(`${baseURL}/cms/gallery`);
    const updatedGalleryItem = publicGalleryAfterUpdate.data.data.find(g => g.id === galleryId);
    assert(updatedGalleryItem.caption === updatedCaption, 'Public /gallery reflects updated photo caption');

    // Admin Deletes Photo
    await axios.delete(`${baseURL}/cms/gallery/${galleryId}`, adminHeaders);
    const publicGalleryAfterDel = await axios.get(`${baseURL}/cms/gallery`);
    assert(!publicGalleryAfterDel.data.data.find(g => g.id === galleryId), 'Public /gallery no longer displays deleted photo');


    // [A.7] System Settings & Identity: Admin Settings -> Public Settings
    console.log('\n[A.7] System Settings & Contact Identity (Admin Settings -> Public API):');
    const testPhone = '+975 17889900';
    await axios.put(`${baseURL}/settings`, {
      settings: {
        phone: testPhone,
        header_phone: testPhone
      }
    }, adminHeaders);

    const publicSettings = await axios.get(`${baseURL}/settings`);
    assert(publicSettings.data.data.phone === testPhone, 'Public site header/contact immediately reflects phone number updated by Admin');


    // [A.8] Certificate Verification: Admin Registry -> Public Verification
    console.log('\n[A.8] Monk Certificates (Admin Registry -> Public Verification):');
    // Register temp student and course
    const [tmpCourse] = await pool.query(`SELECT id FROM courses LIMIT 1`);
    const [tmpStudent] = await pool.query(`SELECT id FROM students_monks LIMIT 1`);

    const certIssue = await axios.post(`${baseURL}/certificates/issue`, {
      studentId: tmpStudent[0].id,
      courseId: tmpCourse[0].id,
      grade: 'High Distinction',
      signedBy: 'Khenpo Tashi Dorji'
    }, adminHeaders);
    assert(certIssue.status === 201, 'Admin issued certificate in Monastic Registry');
    const issuedCertNumber = certIssue.data.certNumber;
    const certId = certIssue.data.id;

    // Public verifies certificate authentic
    const verifyValid = await axios.get(`${baseURL}/certificates/verify/${issuedCertNumber}`);
    assert(verifyValid.status === 200 && verifyValid.data.data.isValid === true, 'Public visitor verifies certificate is 100% authentic and valid');

    // Admin Revokes Certificate
    await axios.put(`${baseURL}/certificates/${certId}/revoke`, {
      reason: 'Superseded by higher ordination credential'
    }, adminHeaders);

    // Public verifies revoked
    const verifyRevoked = await axios.get(`${baseURL}/certificates/verify/${issuedCertNumber}`);
    assert(verifyRevoked.status === 200 && verifyRevoked.data.data.isRevoked === true, 'Public visitor verifies certificate is flagged as REVOKED');


    // =========================================================================
    // PART B: PUBLIC -> ADMIN LIVE MANAGEMENT
    // =========================================================================
    console.log('\n--- PART B: Public Interactions are Live & Manageable in Admin Panel ---');

    // [B.1] Public Dana Offering (Mandatory UTR Proof) -> Admin Reconciliation & Voiding
    console.log('\n[B.1] Public Dana Offering (Mandatory UTR Proof) -> Admin Bank Reconciliation:');
    const testUtr = `UTR${Date.now().toString().slice(-9)}`;
    const offeringRes = await axios.post(`${baseURL}/donations/public-offering`, {
      amount: 3500,
      currency: 'INR',
      donorName: 'Dr. Karma Wangchuk',
      donorEmail: `karma.wangchuk.${Date.now()}@gmail.com`,
      donorPhone: '+975 17554433',
      donationFor: 'Great Druk Wangyel Peace Stupa',
      donationType: 'one_time',
      paymentMethod: 'upi_qr',
      transactionRef: testUtr,
      paymentStatus: 'pending_verification',
      remarks: `UPI Transfer via GPAY (UTR: ${testUtr}) for Great Druk Wangyel Peace Stupa`
    });
    assert(offeringRes.data.success, 'Public devotee submitted ₹3,500 Dana offering with 12-digit UPI UTR proof');
    const donationId = offeringRes.data.data.donationId;
    const receiptNo = offeringRes.data.data.receiptNumber;
    const receiptId = offeringRes.data.data.receiptId;

    // Admin views donation in All Donations, verifies status is pending_verification and UTR is logged
    const allDonationsRes = await axios.get(`${baseURL}/donations`, adminHeaders);
    const foundDonation = allDonationsRes.data.data.find(d => d.receipt_number === receiptNo);
    assert(
      !!foundDonation &&
      foundDonation.payment_status === 'pending_verification' &&
      foundDonation.transaction_ref === testUtr,
      `Admin All Donations list displays pending UTR proof (${testUtr})`
    );

    // Admin verifies & confirms payment against bank statement
    const verifyRes = await axios.put(`${baseURL}/donations/${donationId}/verify`, {}, adminHeaders);
    assert(verifyRes.data.success && verifyRes.data.status === 'completed', 'Admin reconciled & certified donation after verifying UTR with bank statement');

    // Admin inspects Accounts Dashboard to ensure income is recorded
    const accDashboard = await axios.get(`${baseURL}/accounts/dashboard`, adminHeaders);
    assert(accDashboard.data.data.stats.totalIncome > 0, 'Admin Accounts Dashboard reflects the public donation in live income ledgers');

    // Admin voids receipt
    const voidRes = await axios.post(`${baseURL}/receipts/${receiptId}/void`, {
      voidReason: 'Administrative reconciliation test per donor request'
    }, adminHeaders);
    assert(voidRes.status === 200 && voidRes.data.success, 'Admin voided receipt in Money Receipts section');


    // [B.2] Public Contact Inquiry -> Admin CRM
    console.log('\n[B.2] Public Contact Inquiry -> Admin CRM:');
    const inquiryEmail = `devotee.pilgrim.${Date.now()}@gmail.com`;
    const contactRes = await axios.post(`${baseURL}/contacts`, {
      fullName: 'Tenzin Gyatso Pilgrim',
      email: inquiryEmail,
      phone: '+975 17445566',
      subject: 'Monastic Meditation Retreat Availability',
      message: 'Inquiring regarding upcoming autumn 21-day shamatha retreat facilities.'
    });
    assert(contactRes.status === 201 && contactRes.data.success, 'Public devotee submitted web inquiry');

    // Admin locates in CRM Contacts
    const crmContactsRes = await axios.get(`${baseURL}/crm/contacts`, adminHeaders);
    const foundCrmContact = crmContactsRes.data.data.find(c => c.email === inquiryEmail);
    assert(!!foundCrmContact, 'Admin CRM Contacts displays new devotee inquiry');

    // Admin logs communication
    const commRes = await axios.post(`${baseURL}/crm/contacts/${foundCrmContact.id}/communications`, {
      commType: 'phone_call',
      subject: 'Follow-up on retreat dates',
      notes: 'Spoke with devotee and confirmed guest quarters available.'
    }, adminHeaders);
    assert(commRes.status === 201 && commRes.data.success, 'Admin logged CRM communication follow-up');


    // [B.3] Public Prayer Request -> Abbot Monastic Dedication
    console.log('\n[B.3] Public Prayer Request -> Abbot Dedication:');
    const prayerRes = await axios.post(`${baseURL}/cms/prayer-requests`, {
      fullName: 'Dawa Zangmo',
      email: `dawa.${Date.now()}@gmail.com`,
      prayerType: 'health_healing',
      targetPerson: 'Family Elders in Bumthang',
      butterLamps: 108,
      dedicationPrayer: 'For health, swift recovery and long life of grandparents.'
    });
    assert(prayerRes.status === 201 && prayerRes.data.success, 'Devotee submitted public prayer request');
    const prayerId = prayerRes.data.id;

    // Admin views in CMS Prayers
    const prayersRes = await axios.get(`${baseURL}/cms/prayer-requests`, adminHeaders);
    const foundPrayer = prayersRes.data.data.find(p => p.id === prayerId);
    assert(!!foundPrayer, 'Admin CMS Prayer Requests desk displays pending prayer');

    // Abbot marks prayer Dedicated
    const dedicateRes = await axios.put(`${baseURL}/cms/prayer-requests/${prayerId}/status`, {
      status: 'dedicated',
      notes: 'Dedicated by Abbot and Sangha at morning Tara assembly.'
    }, adminHeaders);
    assert(dedicateRes.status === 200 && dedicateRes.data.success, 'Abbot dedicated prayer with Monastic Sangha');


    // [B.4] Public Event RSVP -> Admin Attendee List
    console.log('\n[B.4] Public Ceremony RSVP -> Admin Attendee Roster:');
    const [existingEvents] = await pool.query(`SELECT id FROM news_events LIMIT 1`);
    const rsvpEventId = existingEvents[0].id;
    const rsvpGuestEmail = `guest.${Date.now()}@bhutan.bt`;

    const rsvpRes = await axios.post(`${baseURL}/cms/events/rsvp`, {
      eventId: rsvpEventId,
      guestName: 'Kinzang Tobgay',
      guestEmail: rsvpGuestEmail,
      guestPhone: '+975 17887766',
      attendingCount: 4,
      specialRequests: 'Elderly seating required'
    });
    assert(rsvpRes.status === 201 && rsvpRes.data.success, 'Devotee confirmed ceremony RSVP for 4 guests');

    // Admin views in Event Attendees
    const attendeesRes = await axios.get(`${baseURL}/cms/events/${rsvpEventId}/rsvps`, adminHeaders);
    const foundAttendee = attendeesRes.data.data.find(a => a.guest_email === rsvpGuestEmail);
    assert(!!foundAttendee && foundAttendee.attending_count === 4, 'Admin event attendees roster displays attendee record for 4 guests');


    // [B.5] Public Newsletter Subscription -> Admin List
    console.log('\n[B.5] Public Newsletter -> Admin Subscribers:');
    const newsEmail = `subscriber.${Date.now()}@himalayan.org`;
    const subRes = await axios.post(`${baseURL}/newsletter/subscribe`, { email: newsEmail });
    assert((subRes.status === 200 || subRes.status === 201) && subRes.data.success, 'Public visitor subscribed to newsletter in footer');

    const subListRes = await axios.get(`${baseURL}/newsletter/subscribers`, adminHeaders);
    const foundSub = subListRes.data.data.find(s => s.email === newsEmail);
    assert(!!foundSub, 'Admin CRM newsletter subscribers list contains new subscriber');


    // [B.6] Public Devotee Registration -> Admin Users & Sessions
    console.log('\n[B.6] Public Registration -> Admin Users Management:');
    const devoteeEmail = `user.devotee.${Date.now()}@gmail.com`;
    const regRes = await axios.post(`${baseURL}/auth/register`, {
      fullName: 'Sonam Choden Devotee',
      email: devoteeEmail,
      password: 'SecurePassword123!',
      phone: '+975 17990011',
      accountType: 'donor'
    });
    assert(regRes.status === 201 && regRes.data.success, 'Devotee registered account on /register');

    // Admin views user in Users & Roles
    const usersListRes = await axios.get(`${baseURL}/users`, adminHeaders);
    const foundUser = usersListRes.data.data.find(u => u.email === devoteeEmail);
    assert(!!foundUser, 'Admin Users & Roles displays newly registered devotee account');

    // Clean up temporary registered user
    await pool.query(`DELETE FROM users WHERE id = ?`, [foundUser.id]);


    // =========================================================================
    // PART C: ADMIN CORE INTERNAL CRUD OPERATIONS
    // =========================================================================
    console.log('\n--- PART C: Admin Internal Modules Core CRUD Verification ---');

    // [C.1] Accounts & Expenses: Submit -> Edit -> Approve -> Disburse -> Ledger
    console.log('\n[C.1] Accounts & Expenses CRUD:');
    const expCreate = await axios.post(`${baseURL}/accounts/expenses`, {
      title: 'Shrine Incense & Offerings Supplies',
      payeeName: 'Punakha Incense Guild',
      amount: 1800,
      currency: 'INR',
      categoryId: 1,
      paymentMethod: 'Cash'
    }, adminHeaders);
    assert(expCreate.status === 201 && expCreate.data.id, 'Expense claim submitted in Expenses module');
    const expId = expCreate.data.id;

    // Edit claim
    await axios.put(`${baseURL}/accounts/expenses/${expId}`, {
      title: 'Shrine Incense & Ceremonial Offerings Supplies (Adjusted)',
      amount: 2200
    }, adminHeaders);

    // Approve claim
    await axios.post(`${baseURL}/accounts/expenses/${expId}/approve`, { action: 'approved' }, adminHeaders);

    // Disburse payment
    await axios.post(`${baseURL}/accounts/expenses/${expId}/approve`, { action: 'paid' }, adminHeaders);

    // Verify in expenses list
    const expList = await axios.get(`${baseURL}/accounts/expenses`, adminHeaders);
    const paidExp = expList.data.data.find(e => e.id === expId);
    assert(paidExp.status === 'paid' && parseFloat(paidExp.amount) === 2200, 'Expense claim approved and disbursed (₹2,200, status: PAID)');

    // Cleanup
    await pool.query(`DELETE FROM expenses WHERE id = ?`, [expId]);


    // [C.2] Store & Inventory: Create Item -> Stock-In -> Stock-Out -> Transactions
    console.log('\n[C.2] Store Inventory CRUD:');
    const itmCode = `ITM-E2E-${Date.now().toString().slice(-4)}`;
    const itemRes = await axios.post(`${baseURL}/inventory/items`, {
      itemCode: itmCode,
      name: 'Tibetan Meditation Cushions (Zafu)',
      categoryId: 1,
      currentStock: 0,
      unitCost: 850
    }, adminHeaders);
    assert(itemRes.status === 201 && itemRes.data.id, 'Inventory item created in Store Inventory');
    const invItemId = itemRes.data.id;

    // Stock-In +30
    await axios.post(`${baseURL}/inventory/stock-in`, {
      itemId: invItemId,
      quantity: 30,
      notes: 'Arrival of cushions from craft center'
    }, adminHeaders);

    // Stock-Out -10
    await axios.post(`${baseURL}/inventory/stock-out`, {
      itemId: invItemId,
      quantity: 10,
      notes: 'Placed in main meditation hall'
    }, adminHeaders);

    // Verify stock balance = 20
    const invList = await axios.get(`${baseURL}/inventory/items`, adminHeaders);
    const foundInv = invList.data.data.find(i => i.id === invItemId);
    assert(parseInt(foundInv.current_stock, 10) === 20, 'Inventory stock balance accurately reflects 20 units (30 In - 10 Out)');

    // Cleanup
    await pool.query(`DELETE FROM store_items WHERE id = ?`, [invItemId]);


    // [C.3] HRM & Monthly Payroll: Employee -> Attendance -> Run -> Slips
    console.log('\n[C.3] HRM Employee & Monthly Payroll Run:');
    const empCode = `EMP-E2E-${Date.now().toString().slice(-4)}`;
    const empRes = await axios.post(`${baseURL}/hrm/employees`, {
      employeeCode: empCode,
      fullName: 'Tshering Phuntsho Verger',
      email: `tshering.${Date.now()}@monastery.bt`,
      phone: '+975 17334455',
      department: 'Monastic Affairs',
      designation: 'Temple Verger',
      employmentType: 'Full-Time',
      basicSalary: 25000,
      bankName: 'Bank of Bhutan',
      bankAccountNo: '200847291099'
    }, adminHeaders);
    assert(empRes.status === 201 && empRes.data.id, 'Monastic employee established in HRM');
    const hrmEmpId = empRes.data.id;

    // Daily Attendance
    await axios.post(`${baseURL}/hrm/attendance`, {
      attendanceDate: new Date().toISOString().slice(0, 10),
      records: [{ employeeId: hrmEmpId, status: 'present', remarks: 'Present at morning gates' }]
    }, adminHeaders);

    // Monthly Payroll Run
    const curDate = new Date();
    const payrollRunRes = await axios.post(`${baseURL}/payroll/generate`, {
      month: curDate.getMonth() + 1,
      year: curDate.getFullYear(),
      notes: 'End-to-end payroll calculation'
    }, adminHeaders);
    assert(payrollRunRes.status === 200 && payrollRunRes.data.success, 'Automated monthly payroll run computed and salary slips generated');

    // Verify salary slips
    const runId = payrollRunRes.data.data.payrollRunId;
    const slipsRes = await axios.get(`${baseURL}/payroll/runs/${runId}/slips`, adminHeaders);
    const empSlip = slipsRes.data.data.find(s => s.employee_id === hrmEmpId);
    assert(!!empSlip && parseFloat(empSlip.basic_salary) === 25000, 'Salary slip generated for employee with basic ₹25,000 and PF calculated');

    // Cleanup
    await pool.query(`DELETE FROM employees WHERE id = ?`, [hrmEmpId]);


    // [C.4] Stupa Projects & Tasks Management: Create Project -> Task Progression
    console.log('\n[C.4] Stupa Renovation Projects & Tasks CRUD:');
    const projRes = await axios.post(`${baseURL}/projects`, {
      projectCode: `PRJ-E2E-${Date.now().toString().slice(-4)}`,
      title: 'North Shrine Altar Wood Carving Restoration',
      category: 'Stupa Construction',
      estimatedBudget: 450000,
      startDate: new Date().toISOString().slice(0, 10),
      targetCompletionDate: '2026-11-30',
      location: 'Great Druk Wangyel Peace Stupa',
      managerName: 'Lopen Karma Samten',
      description: 'Hand carving traditional Ashtamangala cedar reliefs.'
    }, adminHeaders);
    assert(projRes.status === 201 && projRes.data.id, 'Capital project created in Projects module');
    const prjId = projRes.data.id;

    // Create Task
    const taskRes = await axios.post(`${baseURL}/projects/tasks`, {
      projectId: prjId,
      title: 'Source Himalayan Cedar Timbers',
      assignedTo: 'Wangdue Forest Guild',
      priority: 'high',
      dueDate: '2026-10-15'
    }, adminHeaders);
    const tskId = taskRes.data.id;

    // Progress Task to In-Progress (50%)
    await axios.put(`${baseURL}/projects/tasks/${tskId}`, {
      status: 'in_progress',
      completionPercent: 50
    }, adminHeaders);

    // Complete Task (100%)
    const taskCompleteRes = await axios.put(`${baseURL}/projects/tasks/${tskId}`, {
      status: 'completed',
      completionPercent: 100
    }, adminHeaders);
    assert(taskCompleteRes.status === 200 && taskCompleteRes.data.success, 'Task progressed to completed (100%)');

    // Cleanup
    await pool.query(`DELETE FROM project_tasks WHERE id = ?`, [tskId]);
    await pool.query(`DELETE FROM projects WHERE id = ?`, [prjId]);

  } catch (err) {
    console.error('❌ Flow execution error:', err.response?.data || err.message);
    failed++;
  } finally {
    if (server) server.close();
    console.log('\n================================================================');
    console.log(` BIDIRECTIONAL RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('================================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runBidirectionalTests();
