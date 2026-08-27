const crypto = require('crypto');
const { pool } = require('../config/db');
const { generateReceiptPdf } = require('./pdfService');
const { sendReceiptEmail } = require('./emailService');

// Helper to calculate amount in words
function numberToWords(amount) {
  const num = Math.floor(amount);
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'overflow';
    let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArray) return '';
    let str = '';
    str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
    str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
    str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
    str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
    str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : '';
    return str.trim();
  }

  const words = inWords(num);
  return words ? `${words} Rupees Only` : 'Zero Rupees Only';
}

// Generate Next Sequential Receipt Number
async function getNextReceiptNumber(connection) {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const financialYear = `${currentYear}-${nextYear}`;

  const [rows] = await connection.query(
    `SELECT receipt_number FROM money_receipts 
     WHERE financial_year = ? 
     ORDER BY id DESC LIMIT 1`,
    [financialYear]
  );

  let nextSequence = 106; // Start after seed data
  if (rows.length > 0) {
    const lastNum = rows[0].receipt_number;
    const match = lastNum.match(/RC-\d{4}-(\d+)/);
    if (match) {
      nextSequence = parseInt(match[1], 10) + 1;
    }
  }

  const formattedSeq = String(nextSequence).padStart(3, '0');
  const receiptNumber = `RC-${currentYear}-${formattedSeq}`;
  return { receiptNumber, financialYear };
}

// Verify Razorpay HMAC Signature
function verifyRazorpaySignature({ order_id, payment_id, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_bhutan_peace';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${order_id}|${payment_id}`)
    .digest('hex');
  return expectedSignature === signature;
}

// Atomic Idempotent Settlement for Online Donations
async function processSuccessfulDonation({
  gateway = 'razorpay',
  eventId,
  paymentId,
  orderId,
  donorName,
  donorEmail,
  donorPhone,
  donorAddress = '',
  amount,
  currency = 'INR',
  campaignId = null,
  donationFor = 'Peace Stupa Construction',
  donationType = 'one_time',
  paymentMethod = 'online_gateway',
  sendReceipt = true,
  remarks = ''
}) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Check Idempotency Table
    if (eventId) {
      const [existingLogs] = await connection.query(
        `SELECT id, status FROM payment_idempotency_log WHERE gateway = ? AND event_id = ? FOR UPDATE`,
        [gateway, eventId]
      );

      if (existingLogs.length > 0 && existingLogs[0].status === 'PROCESSED') {
        console.log(`[Payment] Idempotent hit: Event ${eventId} already processed.`);
        await connection.rollback();
        connection.release();
        return { success: true, alreadyProcessed: true };
      }

      if (existingLogs.length === 0) {
        await connection.query(
          `INSERT INTO payment_idempotency_log (gateway, event_id, payment_id, order_id, amount, currency, status, payload)
           VALUES (?, ?, ?, ?, ?, ?, 'PROCESSING', ?)`,
          [gateway, eventId, paymentId, orderId, amount, currency, JSON.stringify({ donorName, donorEmail, amount, campaignId })]
        );
      }
    }

    // 2. Find or Create Donor Record
    let donorId;
    const [existingDonors] = await connection.query(
      `SELECT id, total_donated, total_donations_count FROM donors WHERE email = ? LIMIT 1`,
      [donorEmail]
    );

    const donationDate = new Date().toISOString().slice(0, 10);

    if (existingDonors.length > 0) {
      donorId = existingDonors[0].id;
      await connection.query(
        `UPDATE donors 
         SET total_donated = total_donated + ?,
             total_donations_count = total_donations_count + 1,
             last_donation_date = ?
         WHERE id = ?`,
        [amount, donationDate, donorId]
      );
    } else {
      const [donorResult] = await connection.query(
        `INSERT INTO donors (donor_type, full_name, email, phone, address, country, total_donated, total_donations_count, first_donation_date, last_donation_date)
         VALUES ('individual', ?, ?, ?, ?, 'Bhutan', ?, 1, ?, ?)`,
        [donorName, donorEmail, donorPhone || null, donorAddress || null, amount, donationDate, donationDate]
      );
      donorId = donorResult.insertId;
    }

    // 3. Generate Auto Receipt Number
    const { receiptNumber, financialYear } = await getNextReceiptNumber(connection);
    const amountInWords = numberToWords(amount);

    // 4. Insert Donation Record
    const [donationResult] = await connection.query(
      `INSERT INTO donations (receipt_number, donor_id, campaign_id, donation_for, donation_type, amount, currency, amount_in_words, payment_method, payment_status, transaction_ref, payment_date, payment_gateway, remarks, send_receipt, is_80g_eligible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, 1)`,
      [receiptNumber, donorId, campaignId || null, donationFor, donationType, amount, currency, amountInWords, paymentMethod, paymentId || orderId, donationDate, gateway, remarks, sendReceipt ? 1 : 0]
    );
    const donationId = donationResult.insertId;

    // 5. Update Campaign Raised Amount if linked
    if (campaignId) {
      await connection.query(
        `UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?`,
        [amount, campaignId]
      );
    }

    // 6. Insert Money Receipt Record
    const [receiptResult] = await connection.query(
      `INSERT INTO money_receipts (receipt_number, financial_year, donation_id, receipt_type, recipient_name, recipient_email, recipient_phone, recipient_address, amount, currency, amount_in_words, payment_mode, transaction_no, receipt_date, status, notes)
       VALUES (?, ?, ?, 'donation', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ISSUED', ?)`,
      [receiptNumber, financialYear, donationId, donorName, donorEmail, donorPhone, donorAddress, amount, currency, amountInWords, `Online (${gateway})`, paymentId || orderId, donationDate, `Donation for ${donationFor}`]
    );
    const receiptId = receiptResult.insertId;

    // 7. Insert Income Ledger Entry
    await connection.query(
      `INSERT INTO income (receipt_id, source_category, particulars, amount, currency, received_date, payment_mode, reference_no)
       VALUES (?, 'donation', ?, ?, ?, ?, 'Online', ?)`,
      [receiptId, `Donation Received - ${donorName} (${donationFor})`, amount, currency, donationDate, paymentId || orderId]
    );

    // 8. Update Idempotency Table to PROCESSED
    if (eventId) {
      await connection.query(
        `UPDATE payment_idempotency_log 
         SET status = 'PROCESSED', processed_at = NOW() 
         WHERE gateway = ? AND event_id = ?`,
        [gateway, eventId]
      );
    }

    // Commit MySQL Transaction
    await connection.commit();
    connection.release();

    // 9. Generate PDF Receipt and Dispatch Email Asynchronously
    const receiptData = {
      receipt_number: receiptNumber,
      financial_year: financialYear,
      recipient_name: donorName,
      recipient_email: donorEmail,
      recipient_phone: donorPhone,
      purpose: donationFor,
      amount: amount,
      currency: currency,
      amount_in_words: amountInWords,
      payment_mode: `Online (${gateway})`,
      transaction_no: paymentId || orderId,
      receipt_date: donationDate,
      status: 'ISSUED'
    };

    let pdfInfo = null;
    try {
      pdfInfo = await generateReceiptPdf(receiptData);
      // Update PDF URL in DB
      await pool.query(`UPDATE money_receipts SET pdf_url = ? WHERE id = ?`, [pdfInfo.relativeUrl, receiptId]);

      if (sendReceipt && donorEmail) {
        sendReceiptEmail({
          toEmail: donorEmail,
          donorName,
          receiptNumber,
          amount,
          currency,
          pdfPath: pdfInfo.filePath
        }).catch(err => console.error('[Email Send Error]:', err));
      }
    } catch (pdfErr) {
      console.error('[PDF Generation Error]:', pdfErr.message);
    }

    return {
      success: true,
      donationId,
      receiptId,
      receiptNumber,
      pdfUrl: pdfInfo ? pdfInfo.relativeUrl : null
    };

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('[Payment Error] Failed transaction in processSuccessfulDonation:', error.message);

    if (eventId) {
      await pool.query(
        `UPDATE payment_idempotency_log 
         SET status = 'FAILED', error_message = ? 
         WHERE gateway = ? AND event_id = ?`,
        [error.message, gateway, eventId]
      ).catch(() => {});
    }

    throw error;
  }
}

module.exports = {
  numberToWords,
  getNextReceiptNumber,
  verifyRazorpaySignature,
  processSuccessfulDonation
};
