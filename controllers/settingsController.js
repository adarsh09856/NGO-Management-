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

// 5. Update and Delete User Accounts
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const targetId = parseInt(id, 10);
    const { roleId, fullName, email, phone, status, password } = req.body;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email.trim().toLowerCase() !== existing[0].email) {
      const [duplicate] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email.trim().toLowerCase(), targetId]);
      if (duplicate.length > 0) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another user' });
      }
    }

    let passwordHash = existing[0].password_hash;
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    await pool.query(
      `UPDATE users
       SET role_id = COALESCE(?, role_id),
           full_name = COALESCE(?, full_name),
           email = COALESCE(?, email),
           phone = ?,
           status = COALESCE(?, status),
           password_hash = ?
       WHERE id = ?`,
      [
        roleId ? parseInt(roleId, 10) : existing[0].role_id,
        fullName ? fullName.trim() : existing[0].full_name,
        email ? email.trim().toLowerCase() : existing[0].email,
        phone !== undefined ? phone : existing[0].phone,
        status || existing[0].status,
        passwordHash,
        targetId
      ]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'users',
      action: 'update',
      recordId: String(targetId),
      details: { fullName, email, roleId, status, passwordUpdated: !!password }
    });

    return res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user: ' + error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const targetId = parseInt(id, 10);
    if (targetId === 1 || (req.user && targetId === req.user.id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete the root super administrator or your own account' });
    }

    const [existing] = await pool.query('SELECT id, full_name, email FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [targetId]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'users',
      action: 'delete',
      recordId: String(targetId),
      details: { deletedUser: existing[0] }
    });

    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user: ' + error.message });
  }
}

// 6. Update Role Permissions
async function updateRolePermissions(req, res) {
  const connection = await pool.getConnection();
  try {
    const roleId = parseInt(req.params.id, 10);
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      connection.release();
      return res.status(400).json({ success: false, message: 'permissionIds must be an array of permission IDs' });
    }

    const [role] = await connection.query('SELECT id, name FROM roles WHERE id = ?', [roleId]);
    if (role.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    await connection.beginTransaction();

    // Remove all current permissions for this role
    await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

    // Insert updated permissions
    if (permissionIds.length > 0) {
      const values = permissionIds.map(pid => [roleId, parseInt(pid, 10)]);
      await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [values]);
    }

    await connection.commit();
    connection.release();

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'roles',
      action: 'update_permissions',
      recordId: String(roleId),
      details: { roleName: role[0].name, permissionCount: permissionIds.length }
    });

    return res.json({ success: true, message: `Permissions for role '${role[0].name}' updated successfully` });
  } catch (error) {
    await connection.rollback();
    connection.release();
    return res.status(500).json({ success: false, message: 'Failed to update role permissions: ' + error.message });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRolesAndPermissions,
  updateRolePermissions,
  getAuditLogs,
  triggerBackup
};
