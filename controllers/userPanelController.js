const { pool } = require('../config/db');

// 1. Get Unified User Panel Dashboard
async function getUserDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Find donor record linked to this user or matching user's email
    const [donorRows] = await pool.query(
      'SELECT * FROM donors WHERE user_id = ? OR email = ? LIMIT 1',
      [userId, userEmail]
    );

    const donor = donorRows[0] || null;
    let donations = [];
    let receipts = [];
    let pledges = [];
    let prayerRequests = [];

    if (donor) {
      // 1. Recent Donations
      const [dRows] = await pool.query(
        `SELECT d.*, c.title as campaign_title, r.receipt_number, r.id as receipt_id
         FROM donations d
         LEFT JOIN campaigns c ON d.campaign_id = c.id
         LEFT JOIN money_receipts r ON d.id = r.donation_id
         WHERE d.donor_id = ? OR d.donor_email = ?
         ORDER BY d.payment_date DESC LIMIT 10`,
        [donor.id, userEmail]
      );
      donations = dRows;

      // 2. Receipts list for direct download
      const [rRows] = await pool.query(
        `SELECT * FROM money_receipts 
         WHERE recipient_email = ? OR notes LIKE ?
         ORDER BY receipt_date DESC`,
        [userEmail, `%${donor.full_name}%`]
      );
      receipts = rRows;

      // 3. Recurring Pledges
      const [pRows] = await pool.query(
        `SELECT p.*, c.title as campaign_title 
         FROM recurring_pledges p
         LEFT JOIN campaigns c ON p.campaign_id = c.id
         WHERE p.donor_id = ?
         ORDER BY p.created_at DESC`,
        [donor.id]
      );
      pledges = pRows;
    } else {
      // If no donor row found, still fetch any donations matching email
      const [dRows] = await pool.query(
        `SELECT d.*, c.title as campaign_title, r.receipt_number, r.id as receipt_id
         FROM donations d
         LEFT JOIN campaigns c ON d.campaign_id = c.id
         LEFT JOIN money_receipts r ON d.id = r.donation_id
         WHERE d.donor_email = ?
         ORDER BY d.payment_date DESC LIMIT 10`,
        [userEmail]
      );
      donations = dRows;
    }

    // 4. Prayer Requests submitted by this user
    const [prRows] = await pool.query(
      'SELECT * FROM prayer_requests WHERE devotee_email = ? ORDER BY created_at DESC',
      [userEmail]
    );
    prayerRequests = prRows;

    const totalDonated = donor?.total_donated || donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const totalDonationsCount = donor?.total_donations_count || donations.length;

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          fullName: req.user.fullName,
          email: req.user.email,
          phone: req.user.phone,
          avatarUrl: req.user.avatarUrl,
          panOrTaxId: donor?.pan_or_tax_id || ''
        },
        givingStats: {
          totalDonated,
          totalDonationsCount,
          activePledgesCount: pledges.filter(p => p.status === 'active').length,
          taxExemptReceiptsCount: receipts.length
        },
        donations,
        receipts,
        pledges,
        prayerRequests
      }
    });
  } catch (error) {
    next(error);
  }
}

// 2. Update User Profile & Tax PAN
async function updateUserProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { fullName, phone, address, panOrTaxId } = req.body;

    // Update users table
    await pool.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
      [fullName, phone, userId]
    );

    // Update or create donor profile
    const [donorRows] = await pool.query('SELECT id FROM donors WHERE user_id = ? OR email = ?', [userId, req.user.email]);
    if (donorRows.length > 0) {
      await pool.query(
        'UPDATE donors SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), address = COALESCE(?, address), pan_or_tax_id = COALESCE(?, pan_or_tax_id) WHERE id = ?',
        [fullName, phone, address, panOrTaxId, donorRows[0].id]
      );
    }

    res.json({
      success: true,
      message: 'Profile and 80G tax settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserDashboard,
  updateUserProfile
};
