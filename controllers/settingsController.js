const { pool } = require('../config/db');
const { createBackup } = require('../db/backup');
const { logAudit } = require('../middleware/auditLogger');
const bcrypt = require('bcryptjs');

// 1. System Settings
async function getSettings(req, res) {
  try {
    const [rows] = await pool.query(`SELECT * FROM system_settings ORDER BY group_name ASC, id ASC`);
    const settingsMap = {};
    rows.forEach(r => { settingsMap[r.setting_key] = r.setting_value; });
    return res.json({ success: true, data: settingsMap, raw: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
}

async function updateSettings(req, res) {
  try {
    const settings = req.body; // { key: value, ... }

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(value)]
      );
    }

    logAudit({
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'settings',
      action: 'update',
      details: { keys: Object.keys(settings) }
    });

    return res.json({ success: true, message: 'System settings saved successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
}

// 2. Users & Roles Management
async function getUsers(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.role_id, u.full_name, u.email, u.phone, u.avatar_url, u.status, u.is_verified, u.last_login_at, u.created_at,
              r.name as role_name, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.id ASC`
    );
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
}

async function createUser(req, res) {
  try {
    const { roleId, fullName, email, password, phone } = req.body;

    if (!roleId || !fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Role, name, email, and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (role_id, full_name, email, password_hash, phone, status, is_verified)
       VALUES (?, ?, ?, ?, ?, 'active', 1)`,
      [roleId, fullName, email.trim().toLowerCase(), passwordHash, phone || null]
    );

    return res.status(201).json({ success: true, message: 'User account created', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create user: ' + error.message });
  }
}

async function getRolesAndPermissions(req, res) {
  try {
    const [roles] = await pool.query(`SELECT * FROM roles ORDER BY id ASC`);
    const [permissions] = await pool.query(`SELECT * FROM permissions ORDER BY module ASC, action ASC`);
    const [rolePermissions] = await pool.query(`SELECT * FROM role_permissions`);

    return res.json({
      success: true,
      data: {
        roles,
        permissions,
        rolePermissions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch roles & permissions matrix' });
  }
}

// 3. Audit Logs
async function getAuditLogs(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const [logs] = await pool.query(
      `SELECT al.*, u.full_name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countRow] = await pool.query(`SELECT COUNT(*) as total FROM audit_logs`);
    const total = countRow[0].total;

    return res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
}

// 4. Trigger Backup
async function triggerBackup(req, res) {
  try {
    const backupFile = await createBackup();
    return res.json({ success: true, message: 'Database backup generated successfully', backupFile });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to trigger backup: ' + error.message });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  getUsers,
  createUser,
  getRolesAndPermissions,
  getAuditLogs,
  triggerBackup
};
