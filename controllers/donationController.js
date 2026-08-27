const { pool, withTransaction } = require('../config/db');
const { getNextReceiptNumber, numberToWords } = require('../services/paymentService');
const { generateReceiptPdf } = require('../services/pdfService');
const { sendReceiptEmail } = require('../services/emailService');
const { logAudit } = require('../middleware/auditLogger');

// 1. Add New Donation (Matching image 1 exact form layout & behavior)
async function addDonation(req, res) {
  try {
    const {
      donorType = 'individual', // individual, organization, anonymous
      donorId,
      newDonor, // { fullName, email, phone, address, city, state, country, panOrTaxId }
      donationFor = 'Peace Stupa Construction',
      campaignId,
      donationType = 'one_time', // one_time, recurring
      amount,
      currency = 'INR',
      paymentMethod = 'online_gateway', // online_gateway, bank_transfer, cash, cheque_dd, other
      transactionRef,
      paymentDate = new Date().toISOString().slice(0, 10),
      paymentGateway = 'Razorpay',
      bankName = 'HDFC Bank',
      remarks = '',
      sendReceipt = true,
      is80gEligible = true
    } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid donation amount is required' });
    }

    const numAmount = parseFloat(amount);
    const amountInWords = numberToWords(numAmount);

    const result = await withTransaction(async (conn) => {
      let finalDonorId = donorId;

      // Handle New Donor Creation if provided
      if (!finalDonorId && newDonor && newDonor.fullName) {
        const [existing] = await conn.query(`SELECT id FROM donors WHERE email = ? LIMIT 1`, [newDonor.email]);
        if (existing.length > 0) {
          finalDonorId = existing[0].id;
        } else {
          const [dRes] = await conn.query(
            `INSERT INTO donors (donor_type, full_name, email, phone, address, city, state, country, pan_or_tax_id, total_donated, total_donations_count, first_donation_date, last_donation_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
            [donorType, newDonor.fullName, newDonor.email || null, newDonor.phone || null, newDonor.address || null, newDonor.city || null, newDonor.state || null, newDonor.country || 'Bhutan', newDonor.panOrTaxId || null, numAmount, paymentDate, paymentDate]
          );
          finalDonorId = dRes.insertId;
        }
      }

      if (!finalDonorId) {
        // Fallback to anonymous donor record
        const [anon] = await conn.query(`SELECT id FROM donors WHERE donor_type = 'anonymous' LIMIT 1`);
        if (anon.length > 0) {
          finalDonorId = anon[0].id;
        } else {
          const [anonRes] = await conn.query(
            `INSERT INTO donors (donor_type, full_name, email, country, total_donated, total_donations_count, first_donation_date, last_donation_date)
             VALUES ('anonymous', 'Anonymous Devotee', 'anonymous@drodulphendeyling.org', 'Bhutan', ?, 1, ?, ?)`,
            [numAmount, paymentDate, paymentDate]
          );
          finalDonorId = anonRes.insertId;
        }
      }

      // Update donor total metrics
      await conn.query(
        `UPDATE donors 
         SET total_donated = total_donated + ?,
             total_donations_count = total_donations_count + 1,
             last_donation_date = ?
         WHERE id = ?`,
        [numAmount, paymentDate, finalDonorId]
      );

      // Fetch donor info for receipt
      const [donorRows] = await conn.query(`SELECT full_name, email, phone, address FROM donors WHERE id = ?`, [finalDonorId]);
      const donor = donorRows[0] || { full_name: 'Devotee', email: null, phone: null, address: '' };

      // Generate Auto Receipt Number
      const { receiptNumber, financialYear } = await getNextReceiptNumber(conn);

      // Insert Donation
      const [donationRes] = await conn.query(
        `INSERT INTO donations (receipt_number, donor_id, campaign_id, donation_for, donation_type, amount, currency, amount_in_words, payment_method, payment_status, transaction_ref, payment_date, payment_gateway, bank_name, remarks, send_receipt, is_80g_eligible, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [receiptNumber, finalDonorId, campaignId || null, donationFor, donationType, numAmount, currency, amountInWords, paymentMethod, transactionRef || `TXN${Date.now()}`, paymentDate, paymentGateway, bankName, remarks, sendReceipt ? 1 : 0, is80gEligible ? 1 : 0, req.user ? req.user.id : null]
      );
      const donationId = donationRes.insertId;

      // Update campaign if linked
      if (campaignId) {
        await conn.query(`UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?`, [numAmount, campaignId]);
      }

      // Insert Money Receipt
      const paymentModeLabel = paymentMethod === 'online_gateway' ? `Online (${paymentGateway})` :
                               paymentMethod === 'bank_transfer' ? `Bank Transfer (${bankName})` :
                               paymentMethod === 'cash' ? 'Cash' :
                               paymentMethod === 'cheque_dd' ? 'Cheque / DD' : 'Other';

      const [receiptRes] = await conn.query(
        `INSERT INTO money_receipts (receipt_number, financial_year, donation_id, receipt_type, recipient_name, recipient_email, recipient_phone, recipient_address, amount, currency, amount_in_words, payment_mode, transaction_no, receipt_date, status, notes)
         VALUES (?, ?, ?, 'donation', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ISSUED', ?)`,
        [receiptNumber, financialYear, donationId, donor.full_name, donor.email, donor.phone, donor.address, numAmount, currency, amountInWords, paymentModeLabel, transactionRef || `TXN${Date.now()}`, paymentDate, remarks || `Donation for ${donationFor}`]
      );
      const receiptId = receiptRes.insertId;

      // Insert into Income Ledger
      await conn.query(
        `INSERT INTO income (receipt_id, source_category, particulars, amount, currency, received_date, payment_mode, reference_no, created_by)
         VALUES (?, 'donation', ?, ?, ?, ?, ?, ?, ?)`,
        [receiptId, `Donation Received - ${donor.full_name} (${donationFor})`, numAmount, currency, paymentDate, paymentModeLabel, transactionRef || `TXN${Date.now()}`, req.user ? req.user.id : null]
      );

      // If Recurring Donation, insert into recurring_pledges
      if (donationType === 'recurring') {
        const nextMonth = new Date(paymentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        await conn.query(
          `INSERT INTO recurring_pledges (donor_id, campaign_id, amount, currency, frequency, status, start_date, next_charge_date, payment_method)
           VALUES (?, ?, ?, ?, 'monthly', 'active', ?, ?, ?)`,
          [finalDonorId, campaignId || null, numAmount, currency, paymentDate, nextMonth.toISOString().slice(0, 10), paymentModeLabel]
        );
      }

      return {
        donationId,
        receiptId,
        receiptNumber,
        financialYear,
        donor,
        donationFor,
        numAmount,
        currency,
        amountInWords,
        paymentModeLabel,
        transactionRef: transactionRef || `TXN${Date.now()}`,
        paymentDate,
        sendReceipt
      };
    });

    // Generate PDF Receipt asynchronously
    let pdfUrl = null;
    try {
      const receiptPdfData = {
        receipt_number: result.receiptNumber,
        financial_year: result.financialYear,
        recipient_name: result.donor.full_name,
        recipient_email: result.donor.email,
        recipient_phone: result.donor.phone,
        purpose: result.donationFor,
        amount: result.numAmount,
        currency: result.currency,
        amount_in_words: result.amountInWords,
        payment_mode: result.paymentModeLabel,
        transaction_no: result.transactionRef,
        receipt_date: result.paymentDate,
        status: 'ISSUED'
      };

      const pdfResult = await generateReceiptPdf(receiptPdfData);
      pdfUrl = pdfResult.relativeUrl;
      await pool.query(`UPDATE money_receipts SET pdf_url = ? WHERE id = ?`, [pdfUrl, result.receiptId]);

      if (result.sendReceipt && result.donor.email) {
        sendReceiptEmail({
          toEmail: result.donor.email,
          donorName: result.donor.full_name,
          receiptNumber: result.receiptNumber,
          amount: result.numAmount,
          currency: result.currency,
          pdfPath: pdfResult.filePath
        }).catch(e => console.error('[Mailer Error]:', e.message));
      }
    } catch (pdfErr) {
      console.error('[PDF Gen Error]:', pdfErr.message);
    }

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'create',
      recordId: result.donationId,
      details: { amount: result.numAmount, receiptNumber: result.receiptNumber, donor: result.donor.full_name }
    });

    return res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: {
        donationId: result.donationId,
        receiptId: result.receiptId,
        receiptNumber: result.receiptNumber,
        pdfUrl
      }
    });

  } catch (error) {
    console.error('[Donation Error] Failed to add donation:', error);
    return res.status(500).json({ success: false, message: 'Failed to record donation: ' + error.message });
  }
}

// 2. Get All Donations (Paginated, Searchable, Filterable)
async function getAllDonations(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '15', 10);
    const offset = (page - 1) * limit;

    const { search, campaignId, paymentMethod, paymentStatus, startDate, endDate } = req.query;

    let query = `
      SELECT d.*, 
             dn.full_name as donor_name, dn.email as donor_email, dn.phone as donor_phone, dn.donor_type,
             c.title as campaign_title,
             mr.id as receipt_id, mr.pdf_url as receipt_pdf_url, mr.status as receipt_status
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN money_receipts mr ON d.id = mr.donation_id
      WHERE d.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (d.receipt_number LIKE ? OR dn.full_name LIKE ? OR dn.email LIKE ? OR d.transaction_ref LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    if (campaignId) {
      query += ` AND d.campaign_id = ?`;
      params.push(campaignId);
    }
    if (paymentMethod) {
      query += ` AND d.payment_method = ?`;
      params.push(paymentMethod);
    }
    if (paymentStatus) {
      query += ` AND d.payment_status = ?`;
      params.push(paymentStatus);
    }
    if (startDate) {
      query += ` AND d.payment_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND d.payment_date <= ?`;
      params.push(endDate);
    }

    // Count Total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Fetch Page
    query += ` ORDER BY d.payment_date DESC, d.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [donations] = await pool.query(query, params);

    return res.json({
      success: true,
      data: donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Donations Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch donations' });
  }
}

// 3. Get Single Donation Details
async function getDonationById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT d.*, 
              dn.full_name as donor_name, dn.email as donor_email, dn.phone as donor_phone, dn.address as donor_address, dn.city as donor_city, dn.country as donor_country,
              c.title as campaign_title,
              mr.id as receipt_id, mr.pdf_url as receipt_pdf_url, mr.status as receipt_status
       FROM donations d
       JOIN donors dn ON d.donor_id = dn.id
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN money_receipts mr ON d.id = mr.donation_id
       WHERE d.id = ? AND d.is_deleted = 0`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch donation details' });
  }
}

// 4. Soft Delete Donation
async function deleteDonation(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE donations SET is_deleted = 1 WHERE id = ?`, [id]);

    logAudit({
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'delete',
      recordId: id
    });

    return res.json({ success: true, message: 'Donation deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete donation' });
  }
}

// 5. Campaigns CRUD
async function getCampaigns(req, res) {
  try {
    const [campaigns] = await pool.query(
      `SELECT c.*, 
              COUNT(d.id) as donation_count,
              COALESCE(SUM(d.amount), 0) as total_raised_computed
       FROM campaigns c
       LEFT JOIN donations d ON c.id = d.campaign_id AND d.payment_status = 'completed' AND d.is_deleted = 0
       GROUP BY c.id
       ORDER BY c.is_featured DESC, c.id ASC`
    );
    return res.json({ success: true, data: campaigns });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
  }
}

async function createCampaign(req, res) {
  try {
    const { title, description, targetAmount, currency = 'INR', startDate, endDate, isFeatured = 0 } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const [result] = await pool.query(
      `INSERT INTO campaigns (title, slug, description, target_amount, currency, start_date, end_date, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, description, targetAmount, currency, startDate || null, endDate || null, isFeatured ? 1 : 0]
    );

    return res.status(201).json({ success: true, message: 'Campaign created successfully', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create campaign' });
  }
}

async function updateCampaign(req, res) {
  try {
    const { id } = req.params;
    const { title, description, targetAmount, isActive, isFeatured } = req.body;

    await pool.query(
      `UPDATE campaigns 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           target_amount = COALESCE(?, target_amount),
           is_active = COALESCE(?, is_active),
           is_featured = COALESCE(?, is_featured)
       WHERE id = ?`,
      [title, description, targetAmount, isActive, isFeatured, id]
    );

    return res.json({ success: true, message: 'Campaign updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update campaign' });
  }
}

// 6. Recurring Donations / Pledges
async function getRecurringPledges(req, res) {
  try {
    const [pledges] = await pool.query(
      `SELECT rp.*, 
              dn.full_name as donor_name, dn.email as donor_email, dn.phone as donor_phone,
              c.title as campaign_title
       FROM recurring_pledges rp
       JOIN donors dn ON rp.donor_id = dn.id
       LEFT JOIN campaigns c ON rp.campaign_id = c.id
       ORDER BY rp.id DESC`
    );
    return res.json({ success: true, data: pledges });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch recurring pledges' });
  }
}

async function updatePledgeStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'paused', 'cancelled'

    await pool.query(`UPDATE recurring_pledges SET status = ? WHERE id = ?`, [status, id]);
    return res.json({ success: true, message: `Pledge status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update pledge status' });
  }
}

module.exports = {
  addDonation,
  getAllDonations,
  getDonationById,
  deleteDonation,
  getCampaigns,
  createCampaign,
  updateCampaign,
  getRecurringPledges,
  updatePledgeStatus
};
