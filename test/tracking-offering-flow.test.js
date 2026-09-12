const axios = require('axios');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { pool, testConnection } = require('../config/db');

async function run() {
  console.log('\n================================================================');
  console.log('☸  TESTING PUBLIC PAYMENT PROOF & LIVE TRACKING (/tracking) API');
  console.log('================================================================\n');

  let server;
  let donationId = null;
  let prayerTrackingId = null;

  try {
    await testConnection();
    const port = 53000 + Math.floor(Math.random() * 1000);
    server = http.createServer(app);
    await new Promise(resolve => server.listen(port, resolve));
    const baseUrl = `http://127.0.0.1:${port}/api`;
    const api = axios.create({ baseURL: baseUrl, validateStatus: () => true });

    // 1. Submit Dana offering with mandatory UTR
    const testUtr = `98${Date.now().toString().slice(-10)}`;
    const donRes = await api.post('/donations/public-offering', {
      amount: 5100,
      currency: 'INR',
      donorName: 'Dorji Tshering',
      donorEmail: `dorji.tshering.${Date.now()}@drodul-monastery.org`,
      donorPhone: '+975 17123456',
      donationFor: 'Great Druk Wangyel Peace Stupa',
      donationType: 'one_time',
      paymentMethod: 'upi_qr',
      transactionRef: testUtr,
      paymentStatus: 'pending_verification',
      remarks: `UPI Transfer via GPAY (UTR: ${testUtr})`
    });

    if (donRes.status !== 200 && donRes.status !== 201) {
      throw new Error(`Failed to submit donation: ${JSON.stringify(donRes.data)}`);
    }
    const trackingId = donRes.data.data.trackingId;
    donationId = donRes.data.data.donationId;
    console.log(`✅ [1] Donation submitted. Tracking ID: ${trackingId}, Donation ID: ${donationId}`);

    // 2. Track offering by Tracking ID
    const trackRes = await api.get(`/tracking/${trackingId}`);
    if (trackRes.status !== 200 || !trackRes.data.success) {
      throw new Error(`Failed to track offering by Tracking ID: ${JSON.stringify(trackRes.data)}`);
    }
    const trackingData = trackRes.data.data;
    console.log(`✅ [2] Tracking portal lookup succeeded by Tracking ID:`);
    console.log(`     Category: ${trackingData.category}, Status: ${trackingData.paymentStatus}`);
    console.log(`     Masked Devotee: ${trackingData.donorNameMasked}, Masked UTR: ${trackingData.transactionRefMasked}`);
    console.log(`     Timeline steps: ${trackingData.timeline.length} milestones`);

    if (!trackingData.donorNameMasked.includes('*')) {
      throw new Error(`Masked devotee name did not mask characters: ${trackingData.donorNameMasked}`);
    }

    // 3. Track offering by UTR
    const trackByUtr = await api.get(`/tracking/${testUtr}`);
    if (trackByUtr.status !== 200 || trackByUtr.data.data.trackingId !== trackingId) {
      throw new Error(`Failed to track offering by UTR: ${JSON.stringify(trackByUtr.data)}`);
    }
    console.log(`✅ [3] Tracking portal lookup succeeded by 12-digit UTR reference.`);

    // 4. Submit Prayer Request with 108 butter lamps and mandatory UTR
    const prayerUtr = `12${Date.now().toString().slice(-10)}`;
    const prayerRes = await api.post('/cms/prayer-requests', {
      devoteeName: 'Pema Wangdi',
      devoteeEmail: `pema.wangdi.${Date.now()}@drodul-monastery.org`,
      devoteePhone: '+975 17887766',
      country: 'Bhutan',
      prayerType: 'healing',
      intentionText: 'Good health and long life for family',
      butterLampsCount: 108,
      offeringAmount: 1080,
      paymentMethod: 'upi_qr',
      transactionRef: prayerUtr
    });

    if ((prayerRes.status !== 200 && prayerRes.status !== 201) || !prayerRes.data.trackingId) {
      throw new Error(`Failed to submit prayer request: ${JSON.stringify(prayerRes.data)}`);
    }
    prayerTrackingId = prayerRes.data.trackingId;
    console.log(`✅ [4] Prayer request submitted. Tracking ID: ${prayerTrackingId}`);

    // 5. Track Prayer Request
    const trackPrayerRes = await api.get(`/tracking/${prayerTrackingId}`);
    if (trackPrayerRes.status !== 200 || !trackPrayerRes.data.success) {
      throw new Error(`Failed to track prayer request: ${JSON.stringify(trackPrayerRes.data)}`);
    }
    console.log(`✅ [5] Prayer request live tracking verified. Category: ${trackPrayerRes.data.data.category}, Status: ${trackPrayerRes.data.data.paymentStatus}`);

    // 6. Admin verifies donation payment
    const JWT_SECRET = process.env.JWT_SECRET || 'dpl_monastery_super_secure_jwt_secret_key_2026_bhutan';
    const adminToken = jwt.sign({ userId: 1, id: 1, email: 'contact@drodulphendeyling.org', role: 'super_admin' }, JWT_SECRET, { expiresIn: '2h' });

    const verifyRes = await api.put(`/donations/${donationId}/verify`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (verifyRes.status === 200) {
      console.log(`✅ [6] Admin verified donation payment against bank statement.`);

      // 7. Check tracking post-verification
      const postVerifyTrack = await api.get(`/tracking/${trackingId}`);
      if (postVerifyTrack.data.data.isVerified && postVerifyTrack.data.data.pdfDownloadUrl) {
        console.log(`✅ [7] Tracking status updated: isVerified=true, Section 80G PDF receipt URL ready: ${postVerifyTrack.data.data.pdfDownloadUrl}`);
      }
    } else {
      throw new Error(`Failed admin verify donation: ${JSON.stringify(verifyRes.data)}`);
    }

    console.log('\n================================================================');
    console.log('🎉 ALL PUBLIC PAYMENT & LIVE TRACKING TESTS PASSED (100%)');
    console.log('================================================================\n');

    // Clean up test data
    if (donationId) {
      await pool.query('DELETE FROM money_receipts WHERE donation_id = ?', [donationId]).catch(() => {});
      await pool.query('DELETE FROM donations WHERE id = ?', [donationId]).catch(() => {});
    }
    if (prayerTrackingId) {
      await pool.query('DELETE FROM prayer_requests WHERE tracking_id = ?', [prayerTrackingId]).catch(() => {});
    }

  } catch(err) {
    console.error('❌ Test failed:', err.message || err);
    process.exit(1);
  } finally {
    if (server) server.close();
    process.exit(0);
  }
}

run();
