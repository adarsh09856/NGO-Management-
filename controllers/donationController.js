const { pool, withTransaction } = require('../config/db');
const { getNextReceiptNumber, numberToWords, processDonationRefund, processSuccessfulDonation } = require('../services/paymentService');
const { generateReceiptPdf } = require('../services/pdfService');
const { sendReceiptEmail, sendPaymentRejectionEmail } = require('../services/emailService');
const { logAudit } = require('../middleware/auditLogger');

// 1. Add New Donation (Matching form layout & behavior)
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

      // Insert Primary Financial Donation Record
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
                               paymentMethod === 'bank_transfer' ? `Bank Transfer (${bankName || 'Bank'})` :
                               paymentMethod === 'cheque_dd' ? `Cheque / DD` : 'Cash';

      const [receiptRes] = await conn.query(
        `INSERT INTO money_receipts (receipt_number, financial_year, donation_id, receipt_type, recipient_name, recipient_email, recipient_phone, recipient_address, amount, currency, amount_in_words, payment_mode, transaction_no, receipt_date, status, notes, issued_by_user_id)
         VALUES (?, ?, ?, 'donation', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ISSUED', ?, ?)`,
        [receiptNumber, financialYear, donationId, donor.full_name, donor.email, donor.phone, donor.address, numAmount, currency, amountInWords, paymentModeLabel, transactionRef || `TXN${Date.now()}`, paymentDate, `Donation for ${donationFor}`, req.user ? req.user.id : null]
      );
      const receiptId = receiptRes.insertId;

      return { donationId, receiptId, receiptNumber, financialYear, donor, numAmount, currency, amountInWords, paymentModeLabel, paymentDate, donationFor };
    });

    // Generate PDF & Dispatch Email
    let pdfResult = null;
    try {
      pdfResult = await generateReceiptPdf({
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
        transaction_no: transactionRef || `TXN${Date.now()}`,
        receipt_date: result.paymentDate,
        status: 'ISSUED'
      });

      await pool.query(`UPDATE money_receipts SET pdf_url = ? WHERE id = ?`, [pdfResult.relativeUrl, result.receiptId]);

      if (sendReceipt && result.donor.email) {
        sendReceiptEmail({
          toEmail: result.donor.email,
          donorName: result.donor.full_name,
          receiptNumber: result.receiptNumber,
          amount: result.numAmount,
          currency: result.currency,
          pdfPath: pdfResult.filePath
        }).catch(err => console.error('[Email Send Error]:', err.message));
      }
    } catch (e) {
      console.error('[Receipt PDF Error]:', e.message);
    }

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'create',
      recordId: result.donationId,
      details: { amount: numAmount, currency, receiptNumber: result.receiptNumber }
    });

    return res.status(201).json({
      success: true,
      message: `Donation recorded successfully! Receipt ${result.receiptNumber} generated.`,
      data: {
        donationId: result.donationId,
        receiptId: result.receiptId,
        receiptNumber: result.receiptNumber,
        pdfUrl: pdfResult ? pdfResult.relativeUrl : null
      }
    });

  } catch (error) {
    console.error('[Add Donation Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to record donation: ' + error.message });
  }
}

// 2. Get All Donations (Paginated, Filterable)
async function getAllDonations(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '15', 10);
    const offset = (page - 1) * limit;

    const { search, campaignId, paymentMethod, paymentStatus, startDate, endDate } = req.query;

    let query = `
      SELECT d.*, 
             dn.full_name as donor_name, dn.email as donor_email, dn.phone as donor_phone, dn.country as donor_country,
             c.title as campaign_title,
             mr.id as receipt_id, mr.pdf_url as receipt_pdf_url
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN money_receipts mr ON d.id = mr.donation_id
      WHERE d.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (d.receipt_number LIKE ? OR dn.full_name LIKE ? OR dn.email LIKE ? OR d.transaction_ref LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
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

// 5. Refund Donation (Direct Reversal against Donations Ledger & Receipt Void)
async function refundDonation(req, res) {
  try {
    const { id } = req.params;
    const { amount, refundReason } = req.body;

    if (!refundReason || refundReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory refund reason of at least 10 characters is required for auditing financial reversals.'
      });
    }

    const userId = req.user ? req.user.id : null;
    const result = await processDonationRefund({
      donationId: id,
      refundAmount: amount,
      refundReason: refundReason.trim(),
      initiatedByUserId: userId
    });

    logAudit({
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'refund',
      recordId: id,
      details: { ...result, refundReason: refundReason.trim() }
    });

    return res.json({
      success: true,
      message: `Donation ${id} refunded successfully (${result.isFullRefund ? 'Full Refund' : 'Partial Refund'}).`,
      data: result
    });
  } catch (error) {
    console.error('[Donation Refund Error]:', error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
}

// 6. Campaigns CRUD
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
    const {
      title,
      description,
      targetAmount,
      target_amount,
      currency = 'INR',
      category = 'Monastic Fund',
      bannerImage,
      banner_image,
      startDate,
      start_date,
      endDate,
      end_date,
      isFeatured = 0,
      is_featured = 0
    } = req.body;

    const finalTarget = targetAmount !== undefined ? targetAmount : (target_amount || 1000000);
    const finalBanner = bannerImage || banner_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80';
    const finalStart = startDate || start_date || null;
    const finalEnd = endDate || end_date || null;
    const finalFeatured = (isFeatured || is_featured) ? 1 : 0;
    const slug = (title || 'campaign').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const [result] = await pool.query(
      `INSERT INTO campaigns (title, slug, description, target_amount, currency, category, banner_image, start_date, end_date, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, description || '', finalTarget, currency, category, finalBanner, finalStart, finalEnd, finalFeatured]
    );

    return res.status(201).json({ success: true, message: 'Campaign created successfully', id: result.insertId });
  } catch (error) {
    console.error('[Create Campaign Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create campaign: ' + error.message });
  }
}

async function updateCampaign(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      targetAmount,
      target_amount,
      currency,
      category,
      bannerImage,
      banner_image,
      startDate,
      start_date,
      endDate,
      end_date,
      isActive,
      is_active,
      isFeatured,
      is_featured
    } = req.body;

    const finalTarget = targetAmount !== undefined ? targetAmount : (target_amount !== undefined ? target_amount : null);
    const finalBanner = bannerImage !== undefined ? bannerImage : (banner_image !== undefined ? banner_image : null);
    const finalStart = startDate !== undefined ? startDate : (start_date !== undefined ? start_date : null);
    const finalEnd = endDate !== undefined ? endDate : (end_date !== undefined ? end_date : null);
    const finalActive = isActive !== undefined ? (isActive ? 1 : 0) : (is_active !== undefined ? (is_active ? 1 : 0) : null);
    const finalFeatured = isFeatured !== undefined ? (isFeatured ? 1 : 0) : (is_featured !== undefined ? (is_featured ? 1 : 0) : null);

    await pool.query(
      `UPDATE campaigns 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           target_amount = COALESCE(?, target_amount),
           currency = COALESCE(?, currency),
           category = COALESCE(?, category),
           banner_image = COALESCE(?, banner_image),
           start_date = COALESCE(?, start_date),
           end_date = COALESCE(?, end_date),
           is_active = COALESCE(?, is_active),
           is_featured = COALESCE(?, is_featured)
       WHERE id = ?`,
      [
        title ?? null,
        description ?? null,
        finalTarget,
        currency ?? null,
        category ?? null,
        finalBanner,
        finalStart,
        finalEnd,
        finalActive,
        finalFeatured,
        id
      ]
    );

    return res.json({ success: true, message: 'Campaign updated successfully' });
  } catch (error) {
    console.error('[Update Campaign Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update campaign: ' + error.message });
  }
}

// 7. Recurring Donations / Pledges
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

    if (!['active', 'paused', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be one of: active, paused, cancelled' });
    }

    const cancelledAt = status === 'cancelled' ? new Date() : null;
    await pool.query(
      `UPDATE recurring_pledges 
       SET status = ?, 
           cancelled_at = COALESCE(?, cancelled_at)
       WHERE id = ?`,
      [status, cancelledAt, id]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'update_pledge_status',
      recordId: id,
      details: { status }
    });

    return res.json({ success: true, message: `Recurring pledge status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update pledge status' });
  }
}

// 8. Delete Campaign (Strict Zero-Corruption Policy)
async function deleteCampaign(req, res) {
  try {
    const { id } = req.params;

    const [campaignRows] = await pool.query(`SELECT * FROM campaigns WHERE id = ?`, [id]);
    if (campaignRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const [donationCount] = await pool.query(`SELECT COUNT(*) as count FROM donations WHERE campaign_id = ?`, [id]);
    if (donationCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete campaign with ${donationCount[0].count} recorded donation(s). Historical donation audit trail must be preserved. Please deactivate the campaign instead.`
      });
    }

    const [pledgeCount] = await pool.query(`SELECT COUNT(*) as count FROM recurring_pledges WHERE campaign_id = ?`, [id]);
    if (pledgeCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete campaign with linked recurring pledges. Please deactivate the campaign instead.'
      });
    }

    await pool.query(`DELETE FROM campaigns WHERE id = ?`, [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'delete_campaign',
      recordId: id,
      details: { title: campaignRows[0].title }
    });

    return res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('[Delete Campaign Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete campaign: ' + error.message });
  }
}

// 9. Toggle Campaign Active Status
async function toggleCampaignStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const [campaignRows] = await pool.query(`SELECT * FROM campaigns WHERE id = ?`, [id]);
    if (campaignRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const newStatus = isActive !== undefined ? (isActive ? 1 : 0) : (campaignRows[0].is_active ? 0 : 1);
    await pool.query(`UPDATE campaigns SET is_active = ? WHERE id = ?`, [newStatus, id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'toggle_campaign_status',
      recordId: id,
      details: { title: campaignRows[0].title, is_active: newStatus }
    });

    return res.json({
      success: true,
      message: `Campaign ${newStatus === 1 ? 'activated' : 'deactivated/archived'} successfully`,
      isActive: newStatus === 1
    });
  } catch (error) {
    console.error('[Toggle Campaign Status Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update campaign status' });
  }
}

// 10. Public Offering Submission (Auto Settlement, Donor Registry & Instant 80G Receipt)
async function submitPublicOffering(req, res) {
  try {
    const {
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      amount,
      currency = 'INR',
      campaignId,
      donationFor = 'Great Druk Wangyel Peace Stupa',
      donationType = 'one_time',
      paymentMethod = 'online_gateway',
      transactionRef,
      paymentStatus = 'completed',
      remarks
    } = req.body;

    if (!donorName || !donorEmail || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Devotee name, email, and valid amount are required.' });
    }

    const eventId = `pub_dana_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const paymentId = transactionRef || `pay_${Date.now()}`;
    const orderId = `order_${Date.now()}`;

    const settlement = await processSuccessfulDonation({
      gateway: paymentMethod === 'bank_transfer' ? 'bank_transfer' : (paymentMethod === 'upi_qr' ? 'upi_qr' : 'razorpay'),
      eventId,
      paymentId,
      orderId,
      transactionRef,
      paymentStatus,
      donorName,
      donorEmail,
      donorPhone,
      donorAddress: donorAddress || '',
      amount: parseFloat(amount),
      currency,
      campaignId: campaignId ? parseInt(campaignId, 10) : null,
      donationFor: donationFor || 'Great Druk Wangyel Peace Stupa',
      donationType,
      paymentMethod: paymentMethod || 'online_gateway',
      sendReceipt: true,
      remarks: remarks || `Public offering for ${donationFor}`
    });

    logAudit({
      userId: null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'public_offering_settled',
      recordId: settlement.donationId,
      details: { receiptNumber: settlement.receiptNumber, donorName, donorEmail, amount, currency, transactionRef }
    });

    return res.status(201).json({
      success: true,
      message: 'Tashi Delek! Your merit offering has been received and official receipt generated.',
      data: settlement
    });
  } catch (error) {
    console.error('[Public Offering Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to record merit offering: ' + error.message });
  }
}

// Column caching & auto-provisioning helper for payment approvals and tracking
let donationColumnsCache = null;

async function ensureDonationApprovalColumns() {
  if (donationColumnsCache) return donationColumnsCache;
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM donations");
    const colSet = new Set(cols.map(c => c.Field));

    if (!colSet.has('tracking_id')) {
      await pool.query("ALTER TABLE donations ADD COLUMN tracking_id VARCHAR(60) NULL UNIQUE AFTER receipt_number").catch(() => {});
    }
    if (!colSet.has('rejection_reason')) {
      await pool.query("ALTER TABLE donations ADD COLUMN rejection_reason TEXT NULL AFTER remarks").catch(() => {});
    }
    if (!colSet.has('verified_by_user_id')) {
      await pool.query("ALTER TABLE donations ADD COLUMN verified_by_user_id INT NULL AFTER rejection_reason").catch(() => {});
    }
    if (!colSet.has('verified_at')) {
      await pool.query("ALTER TABLE donations ADD COLUMN verified_at DATETIME NULL AFTER verified_by_user_id").catch(() => {});
    }

    const [finalCols] = await pool.query("SHOW COLUMNS FROM donations");
    donationColumnsCache = new Set(finalCols.map(c => c.Field));
    return donationColumnsCache;
  } catch (err) {
    console.warn('[DonationController] Column verification warning:', err.message);
    return new Set(['id', 'receipt_number', 'donor_id', 'amount', 'currency', 'payment_method', 'payment_status', 'transaction_ref', 'payment_date', 'remarks', 'created_at']);
  }
}

// 11. Admin Verification of Donation Payment (Reconciliation against Bank Statement / UTR proof)
async function verifyDonationPayment(req, res) {
  try {
    const { id } = req.params;

    const [donationRows] = await pool.query(
      `SELECT d.*, 
              dn.full_name as donor_name, dn.email as donor_email, dn.phone as donor_phone, dn.address as donor_address,
              mr.id as receipt_id, mr.financial_year
       FROM donations d
       JOIN donors dn ON d.donor_id = dn.id
       LEFT JOIN money_receipts mr ON d.id = mr.donation_id
       WHERE d.id = ?`,
      [id]
    );

    if (donationRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    const donation = donationRows[0];
    const userId = req.user ? req.user.id : null;

    // 1. Mark donation completed in primary ledger with verifier info
    const cols = await ensureDonationApprovalColumns();
    const updateSets = [`payment_status = 'completed'`];
    const updateParams = [];
    if (cols.has('rejection_reason')) {
      updateSets.push('rejection_reason = NULL');
    }
    if (cols.has('verified_by_user_id')) {
      updateSets.push('verified_by_user_id = ?');
      updateParams.push(userId);
    }
    if (cols.has('verified_at')) {
      updateSets.push('verified_at = NOW()');
    }
    updateParams.push(id);

    await pool.query(
      `UPDATE donations 
       SET ${updateSets.join(', ')}
       WHERE id = ?`,
      updateParams
    );

    // 2. Mark money receipt as ISSUED
    await pool.query(
      `UPDATE money_receipts SET status = 'ISSUED', notes = CONCAT(COALESCE(notes, ''), ' - UTR Verified & Certified by Monastic Treasury') WHERE donation_id = ?`,
      [id]
    );

    // 3. Generate Official Certified PDF Receipt
    let pdfUrl = null;
    let pdfFilePath = null;
    try {
      const receiptData = {
        receipt_number: donation.receipt_number,
        financial_year: donation.financial_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        recipient_name: donation.donor_name,
        recipient_email: donation.donor_email,
        recipient_phone: donation.donor_phone,
        recipient_address: donation.donor_address,
        purpose: donation.donation_for,
        amount: donation.amount,
        currency: donation.currency,
        amount_in_words: donation.amount_in_words,
        payment_mode: donation.payment_method,
        transaction_no: donation.transaction_ref,
        receipt_date: donation.payment_date || new Date().toISOString().slice(0, 10),
        status: 'ISSUED'
      };
      const pdfResult = await generateReceiptPdf(receiptData);
      pdfUrl = pdfResult.relativeUrl;
      pdfFilePath = pdfResult.filePath;
      if (donation.receipt_id) {
        await pool.query(`UPDATE money_receipts SET pdf_url = ? WHERE id = ?`, [pdfUrl, donation.receipt_id]);
      }
    } catch (pdfErr) {
      console.error('[Verify PDF Generation Error]:', pdfErr.message);
    }

    // 4. Dispatch Official 80G Tax Receipt Confirmation Email via SMTP
    let emailSent = false;
    if (donation.donor_email) {
      try {
        const mailResult = await sendReceiptEmail({
          toEmail: donation.donor_email,
          donorName: donation.donor_name,
          receiptNumber: donation.receipt_number,
          amount: donation.amount,
          currency: donation.currency,
          pdfPath: pdfFilePath
        });
        emailSent = mailResult?.success || false;
      } catch (mailErr) {
        console.error('[Verify SMTP Email Dispatch Error]:', mailErr.message);
      }
    }

    logAudit({
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'verify_payment',
      recordId: id,
      details: {
        receiptNumber: donation.receipt_number,
        utr: donation.transaction_ref,
        verifiedBy: req.user?.email || 'admin',
        emailSent
      }
    });

    return res.json({
      success: true,
      message: `Donation payment verified successfully. Official 80G tax receipt ${donation.receipt_number} is certified and confirmation email sent to ${donation.donor_email}.`,
      status: 'completed',
      emailSent
    });
  } catch (error) {
    console.error('[Verify Donation Payment Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify donation payment: ' + error.message });
  }
}

// 12. Get Centralized Payment Approvals & Treasury Feed with KPI Summary
async function getPaymentApprovals(req, res) {
  try {
    const cols = await ensureDonationApprovalColumns();
    const hasTrackingId = cols.has('tracking_id');
    const hasRejectionReason = cols.has('rejection_reason');
    const hasVerifiedAt = cols.has('verified_at');
    const hasVerifiedBy = cols.has('verified_by_user_id');

    const {
      status = 'all',
      method = 'all',
      search = '',
      dateFrom,
      dateTo,
      page = 1,
      limit = 25
    } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

    let whereClauses = ['d.is_deleted = 0'];
    const params = [];

    if (status && status !== 'all') {
      if (status === 'pending') {
        whereClauses.push(`(d.payment_status = 'pending_verification' OR d.payment_status = 'pending')`);
      } else {
        whereClauses.push(`d.payment_status = ?`);
        params.push(status);
      }
    }

    if (method && method !== 'all') {
      whereClauses.push(`d.payment_method = ?`);
      params.push(method);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      const searchFields = [
        'd.transaction_ref LIKE ?',
        'd.receipt_number LIKE ?',
        ...(hasTrackingId ? ['d.tracking_id LIKE ?'] : []),
        'dn.full_name LIKE ?',
        'dn.email LIKE ?',
        'dn.phone LIKE ?'
      ];
      whereClauses.push(`(${searchFields.join(' OR ')})`);
      for (let i = 0; i < searchFields.length; i++) {
        params.push(q);
      }
    }

    if (dateFrom) {
      whereClauses.push(`d.payment_date >= ?`);
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClauses.push(`d.payment_date <= ?`);
      params.push(dateTo);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const trackingCol = hasTrackingId ? 'd.tracking_id' : 'NULL as tracking_id';
    const rejectionCol = hasRejectionReason ? 'd.rejection_reason' : 'NULL as rejection_reason';
    const verifiedAtCol = hasVerifiedAt ? 'd.verified_at' : 'NULL as verified_at';
    const userJoin = hasVerifiedBy ? 'LEFT JOIN users u ON d.verified_by_user_id = u.id' : '';
    const userNameCol = hasVerifiedBy ? 'u.full_name as verified_by_name' : 'NULL as verified_by_name';

    // Main records query
    const listQuery = `
      SELECT d.id, ${trackingCol}, d.receipt_number, d.amount, d.currency, d.amount_in_words,
             d.payment_method, d.payment_status, d.transaction_ref, d.payment_date, d.payment_gateway,
             d.bank_name, d.remarks, ${rejectionCol}, d.created_at, ${verifiedAtCol},
             d.donation_for, d.donation_type,
             dn.id as donor_id, dn.full_name as donor_name, dn.email as donor_email,
             dn.phone as donor_phone, dn.address as donor_address, dn.country as donor_country,
             c.title as campaign_title,
             mr.id as receipt_id, mr.status as receipt_status, mr.pdf_url as receipt_pdf_url,
             ${userNameCol}
      FROM donations d
      LEFT JOIN donors dn ON d.donor_id = dn.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN money_receipts mr ON d.id = mr.donation_id
      ${userJoin}
      ${whereSql}
      ORDER BY 
        CASE 
          WHEN d.payment_status = 'pending_verification' THEN 1
          WHEN d.payment_status = 'pending' THEN 2
          ELSE 3
        END,
        d.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM donations d
      LEFT JOIN donors dn ON d.donor_id = dn.id
      ${whereSql}
    `;

    // Global summary metrics
    const summaryQuery = `
      SELECT 
        SUM(CASE WHEN payment_status IN ('pending_verification', 'pending') THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN payment_status IN ('pending_verification', 'pending') THEN amount ELSE 0 END) as pendingAmount,
        SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) as verifiedCount,
        SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as verifiedAmount,
        SUM(CASE WHEN payment_status = 'rejected' THEN 1 ELSE 0 END) as rejectedCount,
        SUM(CASE WHEN payment_date = CURDATE() AND payment_status = 'completed' THEN 1 ELSE 0 END) as todayCount,
        SUM(CASE WHEN payment_date = CURDATE() AND payment_status = 'completed' THEN amount ELSE 0 END) as todayAmount
      FROM donations
      WHERE is_deleted = 0
    `;

    const [[countRows], [listRows], [summaryRows]] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(listQuery, [...params, parsedLimit, offset]),
      pool.query(summaryQuery)
    ]);

    const total = countRows[0]?.total || 0;
    const summary = summaryRows[0] || {
      pendingCount: 0,
      pendingAmount: 0,
      verifiedCount: 0,
      verifiedAmount: 0,
      rejectedCount: 0,
      todayCount: 0,
      todayAmount: 0
    };

    return res.json({
      success: true,
      data: {
        payments: listRows,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit) || 1
        },
        summary: {
          pendingCount: parseInt(summary.pendingCount || 0, 10),
          pendingAmount: parseFloat(summary.pendingAmount || 0),
          verifiedCount: parseInt(summary.verifiedCount || 0, 10),
          verifiedAmount: parseFloat(summary.verifiedAmount || 0),
          rejectedCount: parseInt(summary.rejectedCount || 0, 10),
          todayCount: parseInt(summary.todayCount || 0, 10),
          todayAmount: parseFloat(summary.todayAmount || 0)
        }
      }
    });
  } catch (error) {
    console.error('[Get Payment Approvals Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment approvals: ' + error.message });
  }
}

// 13. Reject Donation Payment (e.g. UTR not found on bank statement, bad proof)
async function rejectDonationPayment(req, res) {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A clear rejection reason of at least 5 characters is required for treasury auditing.'
      });
    }

    const [donationRows] = await pool.query(
      `SELECT d.*, 
              dn.full_name as donor_name, dn.email as donor_email, dn.phone as donor_phone,
              mr.id as receipt_id
       FROM donations d
       LEFT JOIN donors dn ON d.donor_id = dn.id
       LEFT JOIN money_receipts mr ON d.id = mr.donation_id
       WHERE d.id = ?`,
      [id]
    );

    if (donationRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    const donation = donationRows[0];
    const userId = req.user ? req.user.id : null;
    const cleanReason = rejectionReason.trim();

    // 1. Mark donation as rejected with timestamp, user ID, and reason
    const cols = await ensureDonationApprovalColumns();
    const updateSets = [`payment_status = 'rejected'`];
    const updateParams = [];
    if (cols.has('rejection_reason')) {
      updateSets.push('rejection_reason = ?');
      updateParams.push(cleanReason);
    }
    if (cols.has('verified_by_user_id')) {
      updateSets.push('verified_by_user_id = ?');
      updateParams.push(userId);
    }
    if (cols.has('verified_at')) {
      updateSets.push('verified_at = NOW()');
    }
    updateParams.push(id);

    await pool.query(
      `UPDATE donations 
       SET ${updateSets.join(', ')} 
       WHERE id = ?`,
      updateParams
    );

    // 2. Void preliminary money receipt if exists
    if (donation.receipt_id) {
      await pool.query(
        `UPDATE money_receipts 
         SET status = 'VOIDED', 
             notes = CONCAT(COALESCE(notes, ''), ' - Voided due to UTR rejection: ', ?) 
         WHERE id = ?`,
        [cleanReason, donation.receipt_id]
      );
    }

    // 3. Dispatch professional rejection notice to donor if email exists
    let emailSent = false;
    if (donation.donor_email) {
      try {
        const mailResult = await sendPaymentRejectionEmail({
          toEmail: donation.donor_email,
          donorName: donation.donor_name,
          receiptNumber: donation.receipt_number,
          amount: donation.amount,
          currency: donation.currency,
          rejectionReason: cleanReason,
          transactionRef: donation.transaction_ref
        });
        emailSent = mailResult?.success || false;
      } catch (mailErr) {
        console.error('[Rejection Email Dispatch Error]:', mailErr.message);
      }
    }

    logAudit({
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'reject_payment',
      recordId: id,
      details: {
        receiptNumber: donation.receipt_number,
        utr: donation.transaction_ref,
        rejectionReason: cleanReason,
        rejectedBy: req.user?.email || 'admin',
        emailSent
      }
    });

    return res.json({
      success: true,
      message: `Payment marked as rejected. Rejection reason recorded and donor notified.`,
      emailSent
    });
  } catch (error) {
    console.error('[Reject Payment Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject payment: ' + error.message });
  }
}

// 14. Update / Correct UTR Reference (e.g. devotee typo)
async function updateDonationUtr(req, res) {
  try {
    const { id } = req.params;
    const { transactionRef, remarks } = req.body;

    if (!transactionRef || transactionRef.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Valid UTR / transaction reference is required (at least 4 characters).' });
    }

    const cleanRef = transactionRef.trim();

    const [existing] = await pool.query(`SELECT id, transaction_ref, receipt_number FROM donations WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    const oldRef = existing[0].transaction_ref;

    await pool.query(
      `UPDATE donations 
       SET transaction_ref = ?, 
           remarks = CONCAT(COALESCE(remarks, ''), IF(? != '', CONCAT(' | ', ?), ''))
       WHERE id = ?`,
      [cleanRef, remarks || '', remarks || '', id]
    );

    await pool.query(
      `UPDATE money_receipts SET transaction_no = ? WHERE donation_id = ?`,
      [cleanRef, id]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'update_utr',
      recordId: id,
      details: { oldRef, newRef: cleanRef, updatedBy: req.user?.email || 'admin' }
    });

    return res.json({
      success: true,
      message: `Transaction reference updated to ${cleanRef} successfully.`
    });
  } catch (error) {
    console.error('[Update UTR Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update transaction reference: ' + error.message });
  }
}

// 15. Resend Certified Receipt Email to Devotee
async function resendReceiptEmail(req, res) {
  try {
    const { id } = req.params;
    const [donationRows] = await pool.query(
      `SELECT d.*, 
              dn.full_name as donor_name, dn.email as donor_email, dn.phone as donor_phone, dn.address as donor_address,
              mr.id as receipt_id, mr.financial_year, mr.pdf_url
       FROM donations d
       JOIN donors dn ON d.donor_id = dn.id
       LEFT JOIN money_receipts mr ON d.id = mr.donation_id
       WHERE d.id = ?`,
      [id]
    );

    if (donationRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    const donation = donationRows[0];
    if (!donation.donor_email) {
      return res.status(400).json({ success: false, message: 'No email address registered for this devotee.' });
    }

    // Ensure PDF exists or regenerate
    const receiptData = {
      receipt_number: donation.receipt_number,
      financial_year: donation.financial_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      recipient_name: donation.donor_name,
      recipient_email: donation.donor_email,
      recipient_phone: donation.donor_phone,
      recipient_address: donation.donor_address,
      purpose: donation.donation_for,
      amount: donation.amount,
      currency: donation.currency,
      amount_in_words: donation.amount_in_words,
      payment_mode: donation.payment_method,
      transaction_no: donation.transaction_ref,
      receipt_date: donation.payment_date || new Date().toISOString().slice(0, 10),
      status: 'ISSUED'
    };

    const pdfResult = await generateReceiptPdf(receiptData);
    if (donation.receipt_id) {
      await pool.query(`UPDATE money_receipts SET pdf_url = ? WHERE id = ?`, [pdfResult.relativeUrl, donation.receipt_id]);
    }

    const mailResult = await sendReceiptEmail({
      toEmail: donation.donor_email,
      donorName: donation.donor_name,
      receiptNumber: donation.receipt_number,
      amount: donation.amount,
      currency: donation.currency,
      pdfPath: pdfResult.filePath
    });

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'donations',
      action: 'resend_receipt_email',
      recordId: id,
      details: { recipientEmail: donation.donor_email, receiptNumber: donation.receipt_number }
    });

    return res.json({
      success: true,
      message: `Certified 80G tax receipt re-sent successfully to ${donation.donor_email}.`
    });
  } catch (error) {
    console.error('[Resend Receipt Email Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to re-send receipt email: ' + error.message });
  }
}

module.exports = {
  addDonation,
  getAllDonations,
  getDonationById,
  deleteDonation,
  refundDonation,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignStatus,
  getRecurringPledges,
  updatePledgeStatus,
  submitPublicOffering,
  verifyDonationPayment,
  getPaymentApprovals,
  rejectDonationPayment,
  updateDonationUtr,
  resendReceiptEmail
};
