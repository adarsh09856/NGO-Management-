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
    const commType = req.body.commType || req.body.communicationType;
    const { subject, notes, scheduledFollowupDate, followupDate, followupStatus = 'done' } = req.body;

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

// 4. Update Contact
async function updateContact(req, res) {
  try {
    const { id } = req.params;
    const { contactType, fullName, organizationName, email, phone, address, city, country, tags, lifetimeValue } = req.body;

    const [existing] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await pool.query(
      `UPDATE contacts 
       SET contact_type = COALESCE(?, contact_type),
           full_name = COALESCE(?, full_name),
           organization_name = COALESCE(?, organization_name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           country = COALESCE(?, country),
           tags = COALESCE(?, tags),
           lifetime_value = COALESCE(?, lifetime_value),
           updated_at = NOW()
       WHERE id = ?`,
      [contactType || null, fullName || null, organizationName || null, email || null, phone || null, address || null, city || null, country || null, tags || null, lifetimeValue !== undefined ? lifetimeValue : null, id]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'crm',
      action: 'update_contact',
      recordId: id,
      details: { fullName, email, contactType }
    });

    return res.json({ success: true, message: 'Contact updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update contact: ' + error.message });
  }
}

// 5. Delete Contact
async function deleteContact(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await pool.query('DELETE FROM contact_communications WHERE contact_id = ?', [id]);
    await pool.query('DELETE FROM contacts WHERE id = ?', [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'crm',
      action: 'delete_contact',
      recordId: id,
      details: { fullName: existing[0].full_name, email: existing[0].email }
    });

    return res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete contact: ' + error.message });
  }
}

// 4. Public Contact Inquiry Submission
async function submitPublicInquiry(req, res) {
  try {
    const { fullName, email, phone, subject = 'General Inquiry', message, department = 'General' } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ success: false, message: 'Full name, email address, and message are required.' });
    }

    // Check or create contact
    let contactId;
    const [existing] = await pool.query('SELECT id FROM contacts WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      contactId = existing[0].id;
      await pool.query(
        `UPDATE contacts SET full_name = COALESCE(full_name, ?), phone = COALESCE(phone, ?), last_contact_date = CURDATE() WHERE id = ?`,
        [fullName, phone || null, contactId]
      );
    } else {
      const [cRes] = await pool.query(
        `INSERT INTO contacts (contact_type, full_name, email, phone, country, tags)
         VALUES ('prospect', ?, ?, ?, 'Bhutan', ?)`,
        [fullName, email, phone || null, `Website Inquiry: ${department || 'General'}`]
      );
      contactId = cRes.insertId;
    }

    // Insert communication record
    await pool.query(
      `INSERT INTO contact_communications (contact_id, comm_type, subject, notes, scheduled_followup_date, followup_status, created_by)
       VALUES (?, 'inquiry', ?, ?, CURDATE(), 'pending', NULL)`,
      [contactId, subject || 'Website Inquiry', message]
    );

    return res.status(201).json({
      success: true,
      message: 'Tashi Delek! Your inquiry has been received by the monastery administration.'
    });
  } catch (error) {
    console.error('[Public Inquiry Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit inquiry: ' + error.message });
  }
}

// 5. Get Email Campaigns History
async function getEmailCampaigns(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT ec.*, u.full_name as created_by_name 
       FROM email_campaigns ec
       LEFT JOIN users u ON ec.created_by = u.id
       ORDER BY ec.id DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch email campaigns: ' + error.message });
  }
}

module.exports = {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getCommunicationsByContact,
  addCommunication,
  broadcastCampaign,
  getEmailCampaigns,
  submitPublicInquiry
};
