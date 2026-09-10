const { pool } = require('../config/db');
const { createBackup } = require('../db/backup');
const { logAudit, verifyAuditLogChain } = require('../middleware/auditLogger');
const { validatePasswordStrength } = require('./authController');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

// 1. System Settings & Dynamic Site Configuration
async function getSettings(req, res) {
  try {
    const [rows] = await pool.query(`SELECT * FROM system_settings ORDER BY group_name ASC, id ASC`);
    const settingsMap = {};
    rows.forEach(r => { settingsMap[r.setting_key] = r.setting_value; });

    // Also fetch structured site_settings if available
    let siteSettingsMap = {};
    try {
      const [siteRows] = await pool.query(`SELECT setting_key, setting_group, setting_value FROM site_settings`);
      siteRows.forEach(sr => {
        let val = sr.setting_value;
        if (typeof val === 'string') {
          try { val = JSON.parse(val); } catch (_) {}
        }
        siteSettingsMap[sr.setting_key] = val;
        // Merge top-level if not already set
        if (settingsMap[sr.setting_key] === undefined) {
          settingsMap[sr.setting_key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
        }
      });
    } catch (_) {
      // Table may not exist yet if migrations haven't run
    }

    return res.json({ success: true, data: settingsMap, siteSettings: siteSettingsMap, raw: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings: ' + error.message });
  }
}

async function updateSettings(req, res) {
  try {
    const payload = req.body.settings || req.body;

    for (const [key, rawValue] of Object.entries(payload)) {
      const isObj = typeof rawValue === 'object' && rawValue !== null;
      const strValue = isObj ? JSON.stringify(rawValue) : String(rawValue);

      // 1. Write to system_settings
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, strValue]
      );

      // 2. If it's a JSON config object or matches known site_settings keys, write to site_settings
      try {
        let group = 'general';
        if (key.startsWith('header_')) group = 'header';
        else if (key === 'branding') group = 'branding';
        else if (key.startsWith('home_')) group = 'cms_home';
        else if (key.startsWith('donation_') || key.includes('razorpay') || key.includes('stripe')) group = 'donations';
        else if (key.includes('tax') || key.includes('80g')) group = 'legal';
        else if (key.includes('smtp') || key.includes('email')) group = 'mail';

        const jsonVal = isObj ? JSON.stringify(rawValue) : JSON.stringify({ value: rawValue });
        await pool.query(
          `INSERT INTO site_settings (setting_key, setting_group, setting_value, updated_by)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
          [key, group, jsonVal, req.user?.id || null]
        );
      } catch (_) {}
    }

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'settings',
      action: 'update',
      details: { keys: Object.keys(payload) }
    });

    return res.json({ success: true, message: 'System settings saved successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save settings: ' + error.message });
  }
}

// 2. Users & Roles Management
async function getUsers(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.role_id, u.full_name, u.email, u.phone, u.avatar_url, u.status, u.is_verified, 
              u.two_factor_enabled, u.last_login_at, u.created_at,
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

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.'
      });
    }

    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (role_id, full_name, email, password_hash, phone, status, is_verified)
       VALUES (?, ?, ?, ?, ?, 'active', 1)`,
      [roleId, fullName, email.trim().toLowerCase(), passwordHash, phone || null]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'users',
      action: 'create',
      recordId: String(result.insertId),
      details: { fullName, email: email.trim().toLowerCase(), roleId }
    });

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

// 3. Audit Logs (Paginated + Cryptographic Chain Verification)
async function getAuditLogs(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const [logs] = await pool.query(
      `SELECT al.*, u.full_name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC, al.id DESC LIMIT ? OFFSET ?`,
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

async function verifyAuditLogs(req, res) {
  try {
    const auditReport = await verifyAuditLogChain();
    return res.json({
      success: true,
      data: auditReport,
      message: auditReport.isValid
        ? `Audit log SHA-256 cryptographic chain verified successfully (${auditReport.totalEntries} entries valid).`
        : `Cryptographic chain anomaly detected: ${auditReport.tamperedCount} tampered record(s) found.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to verify audit logs: ' + error.message });
  }
}

// 4. Trigger Backup
async function triggerBackup(req, res) {
  try {
    const backupFile = await createBackup();
    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'system',
      action: 'backup_triggered',
      details: { backupFile }
    });
    return res.json({ success: true, message: 'Database backup completed successfully', file: backupFile });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Backup failed: ' + error.message });
  }
}

// 5. Update User
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { roleId, fullName, email, phone, status, password } = req.body;
    const targetId = parseInt(id, 10);

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let passwordHash = existing[0].password_hash;
    if (password && password.trim()) {
      if (!validatePasswordStrength(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.'
        });
      }
      const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
      passwordHash = await bcrypt.hash(password, salt);
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

// 6. Admin 1-Click Password Reset (sets must_change_password = 1, revokes active sessions)
async function resetUserPasswordByAdmin(req, res) {
  try {
    const { id } = req.params;
    const [users] = await pool.query(`SELECT id, full_name, email FROM users WHERE id = ?`, [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const user = users[0];
    const tempPassword = `DPL#${Math.random().toString(36).slice(2, 6).toUpperCase()}!${Math.floor(1000 + Math.random() * 9000)}`;
    const hash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    await pool.query(
      `UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?`,
      [hash, id]
    );

    await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE user_id = ?`, [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'users',
      action: 'admin_password_reset',
      recordId: String(id),
      details: { targetEmail: user.email, targetName: user.full_name, mustChangePassword: true }
    });

    return res.json({
      success: true,
      message: `Password reset successfully for ${user.full_name}`,
      temporaryPassword: tempPassword,
      mustChangePassword: true
    });
  } catch (error) {
    console.error('[Admin Password Reset Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password: ' + error.message });
  }
}

// 7. Toggle User Account Status (Active <-> Suspended)
async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const [users] = await pool.query(`SELECT id, full_name, email, status FROM users WHERE id = ?`, [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldStatus = users[0].status;
    await pool.query(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);

    if (status === 'suspended' || status === 'inactive') {
      await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE user_id = ?`, [id]);
    }

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'users',
      action: 'status_change',
      recordId: String(id),
      details: { oldStatus, newStatus: status, userEmail: users[0].email }
    });

    return res.json({
      success: true,
      message: `User status updated from ${oldStatus} to ${status}`,
      status
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user status: ' + error.message });
  }
}

// 8. Change User Role
async function changeUserRole(req, res) {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ success: false, message: 'roleId is required' });
    }

    const [roles] = await pool.query(`SELECT id, name, slug FROM roles WHERE id = ?`, [roleId]);
    if (roles.length === 0) {
      return res.status(400).json({ success: false, message: 'Role does not exist' });
    }

    const [users] = await pool.query(`SELECT id, full_name, email, role_id FROM users WHERE id = ?`, [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query(`UPDATE users SET role_id = ? WHERE id = ?`, [roleId, id]);
    await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE user_id = ?`, [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'users',
      action: 'role_change',
      recordId: String(id),
      details: { oldRoleId: users[0].role_id, newRoleId: roleId, newRoleName: roles[0].name }
    });

    return res.json({
      success: true,
      message: `User role updated to ${roles[0].name}`,
      role: roles[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to change user role: ' + error.message });
  }
}

// 9. Active Sessions View & Revocation
async function getUserSessions(req, res) {
  try {
    const { id } = req.params;
    const [sessions] = await pool.query(
      `SELECT id, user_id, device_info, ip_address, is_revoked, expires_at, created_at, revoked_at
       FROM active_sessions
       WHERE user_id = ?
       ORDER BY id DESC LIMIT 20`,
      [id]
    );
    return res.json({ success: true, data: sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user sessions' });
  }
}

async function revokeSession(req, res) {
  try {
    const { sessionId } = req.params;
    await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE id = ?`, [sessionId]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'users',
      action: 'revoke_session',
      recordId: String(sessionId),
      details: { sessionId }
    });

    return res.json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to revoke session' });
  }
}

async function revokeAllUserSessions(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE user_id = ?`, [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'users',
      action: 'revoke_all_user_sessions',
      recordId: String(id),
      details: { targetUserId: id }
    });

    return res.json({ success: true, message: 'All active sessions revoked for this user' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to revoke user sessions: ' + error.message });
  }
}

async function revokeAllSessionsGlobal(req, res) {
  try {
    await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW()`);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'security',
      action: 'global_session_kill_switch',
      recordId: 'all',
      details: { triggeredBy: req.user?.id }
    });

    return res.json({ success: true, message: 'Global session kill switch executed. All sessions invalidated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to execute global session kill switch: ' + error.message });
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
  resetUserPasswordByAdmin,
  toggleUserStatus,
  changeUserRole,
  getUserSessions,
  revokeSession,
  revokeAllUserSessions,
  revokeAllSessionsGlobal,
  getAuditLogs,
  verifyAuditLogs,
  triggerBackup
};

