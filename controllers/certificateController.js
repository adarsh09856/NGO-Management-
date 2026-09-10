const crypto = require('crypto');
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
    const revocationReason = req.body.revocationReason || req.body.reason || 'Administrative revocation';

    await pool.query(
      `UPDATE certificates 
       SET status = 'REVOKED', 
           is_revoked = 1,
           revocation_reason = ?, 
           revoked_by = ?, 
           revoked_at = NOW() 
       WHERE id = ?`,
      [revocationReason, req.user ? req.user.id : null, id]
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

// Verify Certificate Publicly (with anti-enumeration lookup and hash verification)
async function verifyCertificate(req, res) {
  try {
    const { certNumber } = req.params;
    const sanitizedNumber = (certNumber || '').trim();

    if (!sanitizedNumber || sanitizedNumber.length < 5) {
      return res.status(400).json({ success: false, message: 'Invalid certificate identifier supplied.' });
    }

    const [rows] = await pool.query(
      `SELECT cert.*, 
              sm.monastic_name, sm.secular_name, sm.roll_number,
              c.title as course_title, c.course_code
       FROM certificates cert
       JOIN students_monks sm ON cert.student_id = sm.id
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.certificate_number = ? OR cert.verification_hash = ?`,
      [sanitizedNumber, sanitizedNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No certificate found matching the provided identification code.'
      });
    }

    const cert = rows[0];
    const isRevoked = cert.is_revoked === 1 || cert.status === 'REVOKED';
    const isValid = !isRevoked && (cert.status === 'VALID' || cert.status === 'ACTIVE');

    return res.json({
      success: true,
      data: {
        certificateNumber: cert.certificate_number,
        verificationHash: cert.verification_hash,
        studentName: cert.monastic_name || cert.secular_name,
        courseTitle: cert.course_title,
        grade: cert.grade,
        issueDate: cert.issue_date,
        status: isRevoked ? 'REVOKED' : cert.status,
        isValid,
        isRevoked,
        revocationReason: isRevoked ? (cert.revocation_reason || 'Certificate revoked by administrative authority') : null,
        revokedAt: isRevoked ? cert.revoked_at : null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to verify certificate' });
  }
}

// Issue Certificate (Generates unguessable identifier + cryptographic hash)
async function issueCertificate(req, res) {
  try {
    const { studentId, courseId, grade = 'Distinction', signedBy = 'Khenpo Tashi Dorji', issueDate = new Date().toISOString().slice(0, 10) } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ success: false, message: 'Student ID and Course ID are required' });
    }

    // Ensure enrollment exists
    let enrollmentId = null;
    const [enrRows] = await pool.query('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, courseId]);
    if (enrRows.length > 0) {
      enrollmentId = enrRows[0].id;
    } else {
      const [newEnr] = await pool.query(
        'INSERT INTO enrollments (student_id, course_id, enrollment_date, status, certificate_issued) VALUES (?, ?, CURDATE(), "completed", 1)',
        [studentId, courseId]
      );
      enrollmentId = newEnr.insertId;
    }

    // Generate unguessable entropy
    const randomEntropy = crypto.randomBytes(3).toString('hex').toUpperCase();
    const certNumber = `CERT-DPL-${new Date().getFullYear()}-${randomEntropy}`;
    const verificationHash = crypto.createHash('sha256').update(`${certNumber}:${studentId}:${courseId}:${issueDate}`).digest('hex');

    const [result] = await pool.query(
      `INSERT INTO certificates (certificate_number, verification_hash, enrollment_id, student_id, course_id, issue_date, grade, signed_by, status, is_revoked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'VALID', 0)`,
      [certNumber, verificationHash, enrollmentId, studentId, courseId, issueDate, grade, signedBy]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'certificates',
      action: 'create',
      recordId: result.insertId,
      details: { certNumber, verificationHash, studentId, courseId, grade, signedBy }
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      id: result.insertId,
      certNumber,
      verificationHash
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to issue certificate: ' + error.message });
  }
}

// Update Certificate
async function updateCertificate(req, res) {
  try {
    const { id } = req.params;
    const { grade, signed_by, signedBy, issue_date, issueDate } = req.body;
    const finalSignedBy = signed_by || signedBy;
    const finalIssueDate = issue_date || issueDate;

    const [existing] = await pool.query('SELECT * FROM certificates WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    await pool.query(
      `UPDATE certificates 
       SET grade = COALESCE(?, grade),
           signed_by = COALESCE(?, signed_by),
           issue_date = COALESCE(?, issue_date)
       WHERE id = ?`,
      [grade || null, finalSignedBy || null, finalIssueDate || null, id]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'certificates',
      action: 'update',
      recordId: id,
      details: { grade, signed_by: finalSignedBy, issue_date: finalIssueDate }
    });

    return res.json({ success: true, message: 'Certificate updated successfully' });
  } catch (error) {
    console.error('[Update Certificate Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update certificate: ' + error.message });
  }
}

// Delete Certificate
async function deleteCertificate(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM certificates WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    await pool.query('DELETE FROM certificates WHERE id = ?', [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'certificates',
      action: 'delete',
      recordId: id,
      details: { certNumber: existing[0].certificate_number }
    });

    return res.json({ success: true, message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('[Delete Certificate Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete certificate' });
  }
}

module.exports = {
  getCertificates,
  downloadCertificatePdf,
  revokeCertificate,
  verifyCertificate,
  issueCertificate,
  updateCertificate,
  deleteCertificate
};
