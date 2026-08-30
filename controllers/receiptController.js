const { pool, withTransaction } = require('../config/db');
const { generateReceiptPdf } = require('../services/pdfService');
const { getNextReceiptNumber, numberToWords } = require('../services/paymentService');
const { logAudit } = require('../middleware/auditLogger');
const fs = require('fs');

// Issue New Money Receipt (Manual / 80G Direct Issue)
async function issueReceipt(req, res) {
  try {
    const {
      donationId,
      recipientName,
      recipientEmail,
      recipientPhone,
      recipientAddress,
      recipientPan,
      amount,
      currency = 'INR',
      paymentMethod = 'bank_transfer',
      transactionNo,
      purpose = 'Peace Stupa Construction & General Charitable Purpose',
      receiptDate = new Date().toISOString().slice(0, 10),
      is80gEligible = true,
      remarks = ''
    } = req.body;

    if (!recipientName || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Recipient name and valid amount are required' });
    }

    const numAmount = parseFloat(amount);
    const amountInWords = numberToWords(numAmount);
    const receiptNumber = await getNextReceiptNumber();
    const issuedByUserId = req.user ? req.user.id : null;

    const result = await withTransaction(async (conn) => {
      const [rRes] = await conn.query(
        `INSERT INTO money_receipts 
         (receipt_number, donation_id, recipient_name, recipient_email, recipient_phone, recipient_address, recipient_pan, amount, amount_in_words, currency, payment_method, transaction_no, purpose, receipt_date, is_80g_eligible, status, issued_by_user_id, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ISSUED', ?, ?)`,
        [
          receiptNumber,
          donationId || null,
          recipientName,
          recipientEmail || null,
          recipientPhone || null,
          recipientAddress || null,
          recipientPan || null,
          numAmount,
          amountInWords,
          currency,
          paymentMethod,
          transactionNo || `TXN-${Date.now()}`,
          purpose,
          receiptDate,
          is80gEligible ? 1 : 0,
          issuedByUserId,
          remarks || null
        ]
      );

      return { id: rRes.insertId, receiptNumber };
    });

    logAudit({
      userId: issuedByUserId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'receipts',
      action: 'issue',
      recordId: result.id,
      details: { receiptNumber: result.receiptNumber, amount: numAmount, recipient: recipientName }
    });

    return res.status(201).json({
      success: true,
      message: `Money receipt ${result.receiptNumber} issued successfully`,
      data: { id: result.id, receiptNumber: result.receiptNumber }
    });
  } catch (error) {
    console.error('[Issue Receipt Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to issue receipt: ' + error.message });
  }
}

// Get All Receipts (Paginated, Searchable)
async function getReceipts(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '15', 10);
    const offset = (page - 1) * limit;
    const { search, status, startDate, endDate } = req.query;

    let query = `SELECT * FROM money_receipts WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (receipt_number LIKE ? OR recipient_name LIKE ? OR recipient_email LIKE ? OR transaction_no LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (startDate) {
      query += ` AND receipt_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND receipt_date <= ?`;
      params.push(endDate);
    }

    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ` ORDER BY receipt_date DESC, id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [receipts] = await pool.query(query, params);

    return res.json({
      success: true,
      data: receipts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch money receipts' });
  }
}

// Get Receipt Details
async function getReceiptById(req, res) {
  try {
    const { id } = req.params;
    const [receipts] = await pool.query(`SELECT * FROM money_receipts WHERE id = ?`, [id]);
    if (receipts.length === 0) {
      return res.status(404).json({ success: false, message: 'Money receipt not found' });
    }
    return res.json({ success: true, data: receipts[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch receipt' });
  }
}

// Stream / Download Receipt PDF
async function downloadReceiptPdf(req, res) {
  try {
    const { id } = req.params;
    const [receipts] = await pool.query(`SELECT * FROM money_receipts WHERE id = ?`, [id]);
    if (receipts.length === 0) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    const receipt = receipts[0];
    const pdfResult = await generateReceiptPdf(receipt);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Receipt-${receipt.receipt_number}.pdf"`);

    const fileStream = fs.createReadStream(pdfResult.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('[Receipt PDF Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate receipt PDF' });
  }
}

// Void Receipt (With Mandatory Reason & Audit Trail)
async function voidReceipt(req, res) {
  try {
    const { id } = req.params;
    const { voidReason } = req.body;

    if (!voidReason || voidReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory void reason of at least 10 characters is required for auditing financial reversals.'
      });
    }

    const userId = req.user ? req.user.id : null;

    const result = await withTransaction(async (conn) => {
      const [receipts] = await conn.query(`SELECT * FROM money_receipts WHERE id = ? FOR UPDATE`, [id]);
      if (receipts.length === 0) {
        throw new Error('Receipt record not found');
      }

      const receipt = receipts[0];
      if (receipt.status === 'VOID') {
        throw new Error('Receipt is already voided');
      }

      // Update Receipt Status
      await conn.query(
        `UPDATE money_receipts 
         SET status = 'VOID',
             void_reason = ?,
             voided_by_user_id = ?,
             voided_at = NOW()
         WHERE id = ?`,
        [voidReason.trim(), userId, id]
      );

      // Reverse Income Ledger Entry if exists
      await conn.query(
        `UPDATE income 
         SET particulars = CONCAT('[VOIDED] ', particulars),
             amount = 0.00
         WHERE receipt_id = ?`,
        [id]
      );

      // If linked to a donation, mark donation refunded / void
      if (receipt.donation_id) {
        await conn.query(
          `UPDATE donations 
           SET payment_status = 'refunded',
               remarks = CONCAT(COALESCE(remarks, ''), ' [RECEIPT VOIDED: ', ?, ']')
           WHERE id = ?`,
          [voidReason.trim(), receipt.donation_id]
        );
      }

      return receipt;
    });

    logAudit({
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'receipts',
      action: 'void',
      recordId: id,
      details: {
        receiptNumber: result.receipt_number,
        amount: result.amount,
        recipient: result.recipient_name,
        voidReason: voidReason.trim()
      }
    });

    return res.json({
      success: true,
      message: `Receipt ${result.receipt_number} has been voided successfully. Audit trail recorded.`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  issueReceipt,
  getReceipts,
  getReceiptById,
  downloadReceiptPdf,
  voidReceipt
};
