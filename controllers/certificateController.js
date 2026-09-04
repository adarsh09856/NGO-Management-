const { pool } = require('../config/db');
const { generateCertificatePdf } = require('../services/pdfService');
const { logAudit } = require('../middleware/auditLogger');
const fs = require('fs');

// Get All Issued Certificates
async function getCertificates(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT cert.*, 
              sm.monastic_name, sm.secular_name, sm.roll_number, sm.sangha_id,
              c.title as course_title, c.course_code
       FROM certificates cert
       JOIN students_monks sm ON cert.student_id = sm.id
       JOIN courses c ON cert.course_id = c.id
       ORDER BY cert.issue_date DESC, cert.id DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
  }
}

// Download / Stream Certificate PDF
async function downloadCertificatePdf(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT cert.*, 
              sm.monastic_name, sm.secular_name, sm.roll_number,
              c.title as course_title
       FROM certificates cert
       JOIN students_monks sm ON cert.student_id = sm.id
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const cert = rows[0];
    const pdfData = {
      certificate_number: cert.certificate_number,
      student_name: cert.monastic_name || cert.secular_name,
      roll_number: cert.roll_number,
      course_title: cert.course_title,
      grade: cert.grade,
      issue_date: cert.issue_date,
      signed_by: cert.signed_by
    };

    const pdfResult = await generateCertificatePdf(pdfData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Certificate-${cert.certificate_number}.pdf"`);

    const fileStream = fs.createReadStream(pdfResult.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('[Certificate PDF Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate certificate PDF' });
  }
}

// Revoke Certificate
async function revokeCertificate(req, res) {
  try {
    const { id } = req.params;
    const revocationReason = req.body.revocationReason || req.body.reason;

    await pool.query(
      `UPDATE certificates 
       SET status = 'REVOKED', 
           revocation_reason = ?, 
           revoked_by = ?, 
           revoked_at = NOW() 
       WHERE id = ?`,
      [revocationReason || 'Administrative revocation', req.user ? req.user.id : null, id]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'certificates',
      action: 'revoke',
      recordId: id,
      details: { revocationReason }
    });

    return res.json({ success: true, message: 'Certificate revoked successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to revoke certificate' });
  }
}

// Verify Certificate Publicly
async function verifyCertificate(req, res) {
  try {
    const { certNumber } = req.params;
    const [rows] = await pool.query(
      `SELECT cert.*, 
              sm.monastic_name, sm.secular_name, sm.roll_number,
              c.title as course_title, c.course_code
       FROM certificates cert
       JOIN students_monks sm ON cert.student_id = sm.id
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.certificate_number = ?`,
      [certNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or non-existent certificate number' });
    }

    const cert = rows[0];
    return res.json({
      success: true,
      data: {
        certificateNumber: cert.certificate_number,
        studentName: cert.monastic_name || cert.secular_name,
        courseTitle: cert.course_title,
        grade: cert.grade,
        issueDate: cert.issue_date,
        status: cert.status,
        isValid: cert.status === 'ACTIVE'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to verify certificate' });
  }
}

// Issue Certificate
async function issueCertificate(req, res) {
  try {
    const { studentId, courseId, grade = 'Distinction', signedBy = 'Khenpo Tashi Dorji', issueDate = new Date().toISOString().slice(0, 10) } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ success: false, message: 'Student ID and Course ID are required' });
    }
    const certNumber = `CERT-DPL-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const [result] = await pool.query(
      `INSERT INTO certificates (certificate_number, student_id, course_id, issue_date, grade, signed_by, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [certNumber, studentId, courseId, issueDate, grade, signedBy]
    );
    return res.status(201).json({ success: true, message: 'Certificate issued successfully', id: result.insertId, certNumber });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to issue certificate: ' + error.message });
  }
}

module.exports = {
  getCertificates,
  downloadCertificatePdf,
  revokeCertificate,
  verifyCertificate,
  issueCertificate
};
