const { pool } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Public Volunteer Application Submission
 * Rate-limited via publicFormRateLimiter
 */
async function applyVolunteer(req, res, next) {
  try {
    const {
      fullName,
      full_name,
      email,
      phone,
      skills,
      availability,
      interests
    } = req.body;

    const applicantName = (fullName || full_name || '').trim();
    const applicantEmail = (email || '').trim().toLowerCase();

    if (!applicantName || !applicantEmail) {
      return res.status(400).json({
        success: false,
        message: 'Full name and valid email address are required for volunteer registration.'
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const userId = req.user ? req.user.id : null;

    const [result] = await pool.query(
      `INSERT INTO volunteers (user_id, full_name, email, phone, skills, availability, interests, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        applicantName,
        applicantEmail,
        phone || null,
        skills || null,
        availability || null,
        interests || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for your volunteer application! Our team will review your details and contact you soon.',
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get All Volunteers (Admin / Staff)
 */
async function getVolunteers(req, res, next) {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;
    let query = `SELECT v.*, u.username, u.role_id 
                 FROM volunteers v
                 LEFT JOIN users u ON v.user_id = u.id
                 WHERE 1=1`;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND v.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (v.full_name LIKE ? OR v.email LIKE ? OR v.skills LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY v.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM volunteers WHERE 1=1` +
      (status && status !== 'all' ? ` AND status = '${status.replace(/'/g, "''")}'` : '')
    );

    return res.json({
      success: true,
      data: rows,
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Volunteer by ID
 */
async function getVolunteerById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT v.*, u.username 
       FROM volunteers v
       LEFT JOIN users u ON v.user_id = u.id
       WHERE v.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Volunteer Status / Notes (Admin / Super Admin)
 */
async function updateVolunteerStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'active', 'inactive'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const [existing] = await pool.query('SELECT * FROM volunteers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found.' });
    }

    await pool.query(
      `UPDATE volunteers 
       SET status = COALESCE(?, status),
           notes = COALESCE(?, notes)
       WHERE id = ?`,
      [status || null, notes !== undefined ? notes : null, id]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'volunteers',
      action: 'update_status',
      recordId: id,
      details: { previousStatus: existing[0].status, newStatus: status, notes }
    });

    return res.json({
      success: true,
      message: 'Volunteer profile updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Volunteer (Admin / Super Admin)
 */
async function deleteVolunteer(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM volunteers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found.' });
    }

    await pool.query('DELETE FROM volunteers WHERE id = ?', [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'volunteers',
      action: 'delete',
      recordId: id,
      details: { volunteerName: existing[0].full_name, email: existing[0].email }
    });

    return res.json({ success: true, message: 'Volunteer profile deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  applyVolunteer,
  getVolunteers,
  getVolunteerById,
  updateVolunteerStatus,
  deleteVolunteer
};
