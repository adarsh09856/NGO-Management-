const { pool, withTransaction } = require('../config/db');
const { generateReceiptPdf } = require('../services/pdfService');
const { logAudit } = require('../middleware/auditLogger');
const fs = require('fs');

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
  getReceipts,
  getReceiptById,
  downloadReceiptPdf,
  voidReceipt
};
