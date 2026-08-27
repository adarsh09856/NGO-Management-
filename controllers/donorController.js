const { pool } = require('../config/db');

// Admin: Donors Directory
async function getDonors(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '15', 10);
    const offset = (page - 1) * limit;
    const { search, donorType } = req.query;

    let query = `SELECT * FROM donors WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR pan_or_tax_id LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    if (donorType) {
      query += ` AND donor_type = ?`;
      params.push(donorType);
    }

    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ` ORDER BY total_donated DESC, id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [donors] = await pool.query(query, params);

    return res.json({
      success: true,
      data: donors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch donors list' });
  }
}

// Admin: Donor Profile & Join History
async function getDonorById(req, res) {
  try {
    const { id } = req.params;
    const [donors] = await pool.query(`SELECT * FROM donors WHERE id = ?`, [id]);
    if (donors.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const donor = donors[0];

    // Join Donations History
    const [donations] = await pool.query(
      `SELECT d.*, c.title as campaign_title, mr.id as receipt_id, mr.pdf_url as receipt_pdf_url
       FROM donations d
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN money_receipts mr ON d.id = mr.donation_id
       WHERE d.donor_id = ? AND d.is_deleted = 0
       ORDER BY d.payment_date DESC`,
      [id]
    );

    // Join Recurring Pledges
    const [pledges] = await pool.query(
      `SELECT rp.*, c.title as campaign_title 
       FROM recurring_pledges rp
       LEFT JOIN campaigns c ON rp.campaign_id = c.id
       WHERE rp.donor_id = ?`,
      [id]
    );

    return res.json({
      success: true,
      data: {
        ...donor,
        donations,
        pledges
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch donor profile' });
  }
}

// Admin: Create Donor
async function createDonor(req, res) {
  try {
    const { donorType = 'individual', fullName, email, phone, address, city, state, country = 'Bhutan', panOrTaxId, notes } = req.body;

    if (!fullName) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO donors (donor_type, full_name, email, phone, address, city, state, country, pan_or_tax_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [donorType, fullName, email || null, phone || null, address || null, city || null, state || null, country, panOrTaxId || null, notes || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Donor created successfully',
      id: result.insertId
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create donor' });
  }
}

// Donor Portal: Dashboard
async function getMyDashboard(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const [donors] = await pool.query(
      `SELECT * FROM donors WHERE user_id = ? OR email = ? LIMIT 1`,
      [userId, userEmail]
    );

    if (donors.length === 0) {
      return res.json({
        success: true,
        data: {
          donor: { full_name: req.user.full_name, email: req.user.email, total_donated: 0, total_donations_count: 0 },
          recentDonations: [],
          activePledges: [],
          taxReceiptsCount: 0
        }
      });
    }

    const donor = donors[0];

    const [recentDonations] = await pool.query(
      `SELECT d.*, c.title as campaign_title, mr.id as receipt_id, mr.pdf_url as receipt_pdf_url, mr.status as receipt_status
       FROM donations d
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN money_receipts mr ON d.id = mr.donation_id
       WHERE d.donor_id = ? AND d.is_deleted = 0
       ORDER BY d.payment_date DESC LIMIT 5`,
      [donor.id]
    );

    const [activePledges] = await pool.query(
      `SELECT rp.*, c.title as campaign_title 
       FROM recurring_pledges rp
       LEFT JOIN campaigns c ON rp.campaign_id = c.id
       WHERE rp.donor_id = ?`,
      [donor.id]
    );

    const [receiptCount] = await pool.query(
      `SELECT COUNT(*) as count FROM money_receipts WHERE recipient_email = ? AND status = 'ISSUED'`,
      [donor.email]
    );

    return res.json({
      success: true,
      data: {
        donor,
        recentDonations,
        activePledges,
        taxReceiptsCount: receiptCount[0].count
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch donor dashboard' });
  }
}

// Donor Portal: My Donations List
async function getMyDonations(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const [donors] = await pool.query(`SELECT id FROM donors WHERE user_id = ? OR email = ? LIMIT 1`, [userId, userEmail]);
    if (donors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const donorId = donors[0].id;

    const [donations] = await pool.query(
      `SELECT d.*, c.title as campaign_title, mr.id as receipt_id, mr.pdf_url as receipt_pdf_url, mr.status as receipt_status
       FROM donations d
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN money_receipts mr ON d.id = mr.donation_id
       WHERE d.donor_id = ? AND d.is_deleted = 0
       ORDER BY d.payment_date DESC`,
      [donorId]
    );

    return res.json({ success: true, data: donations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch personal donations' });
  }
}

// Donor Portal: Update Profile
async function updateMyProfile(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { fullName, phone, address, city, state, country, panOrTaxId } = req.body;

    await pool.query(
      `UPDATE donors 
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           state = COALESCE(?, state),
           country = COALESCE(?, country),
           pan_or_tax_id = COALESCE(?, pan_or_tax_id)
       WHERE user_id = ? OR email = ?`,
      [fullName, phone, address, city, state, country, panOrTaxId, userId, userEmail]
    );

    await pool.query(`UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?`, [fullName, phone, userId]);

    return res.json({ success: true, message: 'Donor profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
}

module.exports = {
  getDonors,
  getDonorById,
  createDonor,
  getMyDashboard,
  getMyDonations,
  updateMyProfile
};
