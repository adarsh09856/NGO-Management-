const { pool } = require('../config/db');
const { sendCampaignEmail } = require('../services/emailService');
const { logAudit } = require('../middleware/auditLogger');

// 1. Contacts Directory
async function getContacts(req, res) {
  try {
    const { contactType, search } = req.query;
    let query = `SELECT * FROM contacts WHERE 1=1`;
    const params = [];

    if (contactType) { query += ` AND contact_type = ?`; params.push(contactType); }
    if (search) {
      query += ` AND (full_name LIKE ? OR organization_name LIKE ? OR email LIKE ? OR tags LIKE ?)`;
      const p = `%${search}%`;
      params.push(p, p, p, p);
    }

    query += ` ORDER BY lifetime_value DESC, id DESC`;
    const [contacts] = await pool.query(query, params);
    return res.json({ success: true, data: contacts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
}

async function createContact(req, res) {
  try {
    const { contactType = 'donor', fullName, organizationName, email, phone, address, city, country = 'Bhutan', tags = 'Devotee' } = req.body;

    if (!fullName) return res.status(400).json({ success: false, message: 'Full name is required' });

    const [result] = await pool.query(
      `INSERT INTO contacts (contact_type, full_name, organization_name, email, phone, address, city, country, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contactType, fullName, organizationName || null, email || null, phone || null, address || null, city || null, country, tags]
    );

    return res.status(201).json({ success: true, message: 'Contact added to CRM', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create contact' });
  }
}

// 2. Communication Timeline
async function getCommunicationsByContact(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT cc.*, u.full_name as author_name
       FROM contact_communications cc
       LEFT JOIN users u ON cc.created_by = u.id
       WHERE cc.contact_id = ?
       ORDER BY cc.created_at DESC`,
      [id]
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch communications' });
  }
}

async function addCommunication(req, res) {
  try {
    const { id } = req.params;
    const { commType, subject, notes, scheduledFollowupDate, followupStatus = 'done' } = req.body;

    if (!commType || !subject) {
      return res.status(400).json({ success: false, message: 'Communication type and subject are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO contact_communications (contact_id, comm_type, subject, notes, scheduled_followup_date, followup_status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, commType, subject, notes || null, scheduledFollowupDate || null, followupStatus, req.user ? req.user.id : null]
    );

    await pool.query(`UPDATE contacts SET last_contact_date = CURDATE() WHERE id = ?`, [id]);

    return res.status(201).json({ success: true, message: 'Communication logged', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to log communication' });
  }
}

// 3. Email Campaigns Composer & Broadcast
async function broadcastCampaign(req, res) {
  try {
    const { title, subject, targetSegment = 'All Donors', bodyHtml } = req.body;

    if (!subject || !bodyHtml) {
      return res.status(400).json({ success: false, message: 'Subject and email body are required' });
    }

    // Fetch target emails from contacts / donors
    const [contacts] = await pool.query(`SELECT DISTINCT email FROM donors WHERE email IS NOT NULL AND email != ''`);
    const emailList = contacts.map(c => c.email);

    // Send emails via nodemailer
    const dispatchResult = await sendCampaignEmail({
      toEmails: emailList,
      subject,
      bodyHtml
    });

    const [campRes] = await pool.query(
      `INSERT INTO email_campaigns (title, subject, target_segment, body_html, sent_count, status, sent_at, created_by)
       VALUES (?, ?, ?, ?, ?, 'sent', NOW(), ?)`,
      [title || subject, subject, targetSegment, bodyHtml, dispatchResult.sentCount || 0, req.user ? req.user.id : null]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'crm',
      action: 'broadcast_campaign',
      recordId: campRes.insertId,
      details: { sentCount: dispatchResult.sentCount, subject }
    });

    return res.json({
      success: true,
      message: `Email campaign broadcasted to ${dispatchResult.sentCount} recipients.`,
      campaignId: campRes.insertId
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Campaign broadcast failed: ' + error.message });
  }
}

module.exports = {
  getContacts,
  createContact,
  getCommunicationsByContact,
  addCommunication,
  broadcastCampaign
};
