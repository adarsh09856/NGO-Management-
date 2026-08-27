const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditLogger');

// Login
async function login(req, res) {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [users] = await pool.query(
      `SELECT u.*, r.name as role_name, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is inactive or suspended. Please contact administration.' });
    }

    // Verify Portal Role matching if specified
    if (portal === 'admin' && !['super_admin', 'accountant', 'hr_manager', 'staff'].includes(user.role_slug)) {
      return res.status(403).json({ success: false, message: 'Access denied: Admin portal credentials required.' });
    }
    if (portal === 'donor' && user.role_slug !== 'donor' && user.role_slug !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Donor portal credentials required.' });
    }
    if (portal === 'student' && user.role_slug !== 'student_monk' && user.role_slug !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Student / Monk credentials required.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);

    // Fetch permissions
    const [permissions] = await pool.query(
      `SELECT p.module, p.action
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`,
      [user.role_id]
    );

    const permissionList = permissions.map(p => `${p.module}:${p.action}`);

    // If user is a donor or student monk, get their linked entity ID
    let linkedDonorId = null;
    let linkedStudentId = null;

    if (user.role_slug === 'donor') {
      const [donors] = await pool.query(`SELECT id FROM donors WHERE user_id = ? OR email = ? LIMIT 1`, [user.id, user.email]);
      if (donors.length > 0) linkedDonorId = donors[0].id;
    }

    if (user.role_slug === 'student_monk') {
      const [monks] = await pool.query(`SELECT id FROM students_monks WHERE user_id = ? LIMIT 1`, [user.id]);
      if (monks.length > 0) linkedStudentId = monks[0].id;
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.role_id,
        roleSlug: user.role_slug
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logAudit({
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'auth',
      action: 'login',
      recordId: user.id,
      details: { role: user.role_slug, portal }
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        role: {
          id: user.role_id,
          name: user.role_name,
          slug: user.role_slug
        },
        permissions: permissionList,
        linkedDonorId,
        linkedStudentId
      }
    });

  } catch (error) {
    console.error('[Auth Error] Login failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
}

// Register Donor or Student
async function register(req, res) {
  try {
    const { fullName, email, password, phone, accountType, monasticName, sanghaId } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
    }

    const [existing] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Determine Role
    const roleSlug = accountType === 'student' ? 'student_monk' : 'donor';
    const [roles] = await pool.query(`SELECT id FROM roles WHERE slug = ?`, [roleSlug]);
    const roleId = roles[0].id;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [userResult] = await pool.query(
      `INSERT INTO users (role_id, full_name, email, password_hash, phone, status, is_verified)
       VALUES (?, ?, ?, ?, ?, 'active', 1)`,
      [roleId, fullName, email.trim().toLowerCase(), passwordHash, phone || null]
    );

    const userId = userResult.insertId;

    if (roleSlug === 'donor') {
      await pool.query(
        `INSERT INTO donors (user_id, full_name, email, phone, country)
         VALUES (?, ?, ?, ?, 'Bhutan')`,
        [userId, fullName, email.trim().toLowerCase(), phone || null]
      );
    } else if (roleSlug === 'student_monk') {
      const rollNumber = `MNK-2026-${String(userId).padStart(3, '0')}`;
      await pool.query(
        `INSERT INTO students_monks (user_id, monastic_name, secular_name, roll_number, sangha_id, joining_date, monk_status)
         VALUES (?, ?, ?, ?, ?, CURDATE(), 'novice')`,
        [userId, monasticName || fullName, fullName, rollNumber, sanghaId || null]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. You can now log in.'
    });

  } catch (error) {
    console.error('[Auth Error] Registration failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
}

// Current Authenticated User (Me)
async function me(req, res) {
  try {
    let linkedDonorId = null;
    let linkedStudentId = null;

    if (req.user.role_slug === 'donor') {
      const [donors] = await pool.query(`SELECT id FROM donors WHERE user_id = ? OR email = ? LIMIT 1`, [req.user.id, req.user.email]);
      if (donors.length > 0) linkedDonorId = donors[0].id;
    }

    if (req.user.role_slug === 'student_monk') {
      const [monks] = await pool.query(`SELECT id FROM students_monks WHERE user_id = ? LIMIT 1`, [req.user.id]);
      if (monks.length > 0) linkedStudentId = monks[0].id;
    }

    return res.json({
      success: true,
      user: {
        id: req.user.id,
        fullName: req.user.full_name,
        email: req.user.email,
        phone: req.user.phone,
        avatarUrl: req.user.avatar_url,
        role: {
          id: req.user.role_id,
          name: req.user.role_name,
          slug: req.user.role_slug
        },
        permissions: req.user.permissions,
        linkedDonorId,
        linkedStudentId
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
}

// Update Profile
async function updateProfile(req, res) {
  try {
    const { fullName, phone, avatarUrl, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set new password' });
      }
      const [users] = await pool.query(`SELECT password_hash FROM users WHERE id = ?`, [userId]);
      const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, userId]);
    }

    await pool.query(
      `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url) WHERE id = ?`,
      [fullName, phone, avatarUrl, userId]
    );

    return res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
}

module.exports = {
  login,
  register,
  me,
  updateProfile
};
