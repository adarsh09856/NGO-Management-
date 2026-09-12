const { pool } = require('../config/db');

/**
 * Public Offering & Prayer Tracking Controller
 * Allows devotees to look up live verification & reconciliation progress
 * using their Tracking ID (TRK-...), Receipt Number (RC-...), or UTR reference.
 */
async function trackOffering(req, res) {
  try {
    const rawQuery = (req.params.query || req.query.q || '').trim();

    if (!rawQuery || rawQuery.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Tracking ID, Receipt Number, or UTR reference number.'
      });
    }

    // 1. Search in Donations Table
    const [donationRows] = await pool.query(
      `SELECT d.id, d.tracking_id, d.receipt_number, d.donation_for, d.donation_type, d.amount, d.currency,
              d.payment_method, d.payment_status, d.transaction_ref, d.created_at, d.payment_date,
              dn.full_name as donor_name, dn.email as donor_email,
              mr.id as receipt_id, mr.status as receipt_status, mr.pdf_url
       FROM donations d
       LEFT JOIN donors dn ON d.donor_id = dn.id
       LEFT JOIN money_receipts mr ON d.id = mr.donation_id
       WHERE d.tracking_id = ? OR d.receipt_number = ? OR d.transaction_ref = ?
       LIMIT 1`,
      [rawQuery, rawQuery, rawQuery]
    );

    if (donationRows.length > 0) {
      const row = donationRows[0];
      const isCompleted = row.payment_status === 'completed';

      // Mask donor name and email for privacy
      const maskName = (name) => {
        if (!name) return 'Noble Patron';
        const parts = name.split(' ');
        return parts.map(p => p.length > 2 ? p[0] + '*'.repeat(p.length - 2) + p[p.length - 1] : p[0] + '*').join(' ');
      };

      const maskEmail = (email) => {
        if (!email) return '';
        const [user, domain] = email.split('@');
        if (!domain) return '***';
        return (user.length > 2 ? user[0] + '***' + user[user.length - 1] : '***') + '@' + domain;
      };

      const maskUtr = (utr) => {
        if (!utr) return 'N/A';
        if (utr.length <= 4) return utr;
        return '*'.repeat(utr.length - 4) + utr.slice(-4);
      };

      const trackingData = {
        trackingId: row.tracking_id || `TRK-${new Date(row.created_at).getFullYear()}-${String(row.id).padStart(6, '0')}`,
        receiptNumber: row.receipt_number,
        donationId: row.id,
        category: 'Sacred Dana Offering',
        cause: row.donation_for,
        amount: Number(row.amount),
        currency: row.currency || 'INR',
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        transactionRefMasked: maskUtr(row.transaction_ref),
        donorNameMasked: maskName(row.donor_name),
        donorEmailMasked: maskEmail(row.donor_email),
        submittedAt: row.created_at,
        isVerified: isCompleted,
        pdfDownloadUrl: isCompleted && row.receipt_id ? `/api/receipts/${row.receipt_id}/pdf` : null,
        timeline: [
          {
            step: 1,
            title: 'Offering & UTR Proof Submitted',
            description: `Devotee logged offering of ${row.currency} ${Number(row.amount).toLocaleString()} with transaction reference ${maskUtr(row.transaction_ref)}.`,
            status: 'completed',
            timestamp: row.created_at
          },
          {
            step: 2,
            title: 'Bank Statement Reconciliation',
            description: isCompleted
              ? 'Monastic treasury successfully matched and verified UTR against Bank of Bhutan account statement.'
              : 'Our finance office is actively reconciling your transaction proof with our bank statement. Please allow 1-24 hours.',
            status: isCompleted ? 'completed' : 'in_progress',
            timestamp: isCompleted ? row.payment_date || row.created_at : null
          },
          {
            step: 3,
            title: 'Abbot Sanctification & 80G Tax Certification',
            description: isCompleted
              ? 'Offering sanctified during Sangha puja. Statutory Section 80G tax rebate certified.'
              : 'Awaiting completion of treasury reconciliation.',
            status: isCompleted ? 'completed' : 'pending',
            timestamp: isCompleted ? row.payment_date || row.created_at : null
          },
          {
            step: 4,
            title: 'Official Tax Receipt & Blessings Dispatched',
            description: isCompleted
              ? `Official certified PDF receipt issued and confirmation email dispatched to ${maskEmail(row.donor_email)}.`
              : `Official certified PDF receipt will be automatically emailed to ${maskEmail(row.donor_email)} upon verification.`,
            status: isCompleted ? 'completed' : 'pending',
            timestamp: isCompleted ? row.payment_date || row.created_at : null
          }
        ]
      };

      return res.json({ success: true, data: trackingData });
    }

    // 2. Search in Prayer Requests Table
    const [prayerRows] = await pool.query(
      `SELECT pr.id, pr.tracking_id, pr.prayer_type, pr.butter_lamps_count, pr.offering_amount,
              pr.offering_currency, pr.payment_status, pr.status as prayer_status,
              pr.transaction_ref, pr.created_at, pr.dedication_names,
              pr.devotee_name, pr.devotee_email
       FROM prayer_requests pr
       WHERE pr.tracking_id = ? OR pr.transaction_ref = ?
       LIMIT 1`,
      [rawQuery, rawQuery]
    );

    if (prayerRows.length > 0) {
      const pRow = prayerRows[0];
      const isPaid = pRow.payment_status === 'paid';
      const isDedicated = pRow.prayer_status === 'dedicated' || pRow.prayer_status === 'completed';

      const trackingData = {
        trackingId: pRow.tracking_id || `TRK-PRAYER-${pRow.id}`,
        receiptNumber: `PR-${pRow.id}`,
        donationId: pRow.id,
        category: 'Sacred Sangha Prayer & Butter Lamps',
        cause: `${pRow.prayer_type} (${pRow.butter_lamps_count || 108} Butter Lamps)`,
        amount: Number(pRow.offering_amount || 0),
        currency: pRow.offering_currency || 'INR',
        paymentMethod: 'upi_qr',
        paymentStatus: isPaid ? 'completed' : 'pending_verification',
        transactionRefMasked: pRow.transaction_ref ? '****' + pRow.transaction_ref.slice(-4) : 'N/A',
        donorNameMasked: pRow.devotee_name ? pRow.devotee_name[0] + '***' : 'Devotee',
        donorEmailMasked: pRow.devotee_email ? '***@' + pRow.devotee_email.split('@')[1] : '',
        submittedAt: pRow.created_at,
        isVerified: isPaid,
        timeline: [
          {
            step: 1,
            title: 'Prayer Request & Butter Lamps Inscribed',
            description: `Prayer intentions for "${pRow.dedication_names || 'All Sentient Beings'}" inscribed in monastic prayer roster.`,
            status: 'completed',
            timestamp: pRow.created_at
          },
          {
            step: 2,
            title: 'Offering Proof Verification',
            description: isPaid
              ? 'Offering proof verified by monastic treasury.'
              : 'Our finance desk is reconciling your payment reference against our bank statement.',
            status: isPaid ? 'completed' : 'in_progress',
            timestamp: isPaid ? pRow.created_at : null
          },
          {
            step: 3,
            title: 'Sangha Consecration & Lamp Illumination',
            description: isDedicated
              ? 'Sacred butter lamps illuminated before the Buddha altar with daily puja dedications by resident monks.'
              : 'Slated for chanting at next daily puja assembly.',
            status: isDedicated ? 'completed' : (isPaid ? 'in_progress' : 'pending'),
            timestamp: isDedicated ? pRow.created_at : null
          },
          {
            step: 4,
            title: 'Dharma Blessing Confirmation Dispatched',
            description: isDedicated
              ? 'Blessing dedication and confirmation dispatched to devotee email.'
              : 'Confirmation will be dispatched upon monastic dedication.',
            status: isDedicated ? 'completed' : 'pending',
            timestamp: isDedicated ? pRow.created_at : null
          }
        ]
      };

      return res.json({ success: true, data: trackingData });
    }

    return res.status(404).json({
      success: false,
      message: `No record found matching "${rawQuery}". Please check your Tracking ID or UTR number.`
    });
  } catch (error) {
    console.error('[Track Offering Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tracking status: ' + error.message
    });
  }
}

module.exports = {
  trackOffering
};
