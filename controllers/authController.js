const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { pool } = require('../config/db');
const { JWT_SECRET, JWT_REFRESH_SECRET, hashToken } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditLogger');

const BCRYPT_ROUNDS = 12;

// Password Policy Enforcement
// Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') return false;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+={}\[\]:;<>,.~`\/-])[A-Za-z\d@$!%*?&#^()_+={}\[\]:;<>,.~`\/-]{8,}$/;
  return passwordRegex.test(password);
}

// Generate Access & Refresh Tokens
function generateTokens(user) {
  const payload = {
    userId: user.id,
    roleId: user.role_id,
    roleSlug: user.role_slug
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const refreshToken = crypto.randomBytes(40).toString('hex');

  return { accessToken, refreshToken };
}

// 1. User Login with 2FA Support and Active Session Recording
async function login(req, res) {
  try {
    const { email, password, portal, twoFactorCode, backupCode } = req.body;

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
    if (portal === 'user' && !['user', 'donor', 'student_monk', 'super_admin', 'accountant', 'staff', 'hr_manager'].includes(user.role_slug)) {
      return res.status(403).json({ success: false, message: 'Access denied: Member portal credentials required.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Two-Factor Authentication Check
    if (user.two_factor_enabled) {
      if (!twoFactorCode && !backupCode) {
        return res.status(200).json({
          success: true,
          require2FA: true,
          userId: user.id,
          message: 'Two-factor authentication code required'
        });
      }

      let is2faValid = false;

      if (twoFactorCode && user.two_factor_secret) {
        is2faValid = speakeasy.totp.verify({
          secret: user.two_factor_secret,
          encoding: 'base32',
          token: String(twoFactorCode).trim(),
          window: 1
        });
      }

      // Check backup codes if TOTP failed or backup code provided
      if (!is2faValid && backupCode && user.two_factor_backup_codes) {
        try {
          const storedCodes = JSON.parse(user.two_factor_backup_codes);
          const inputHash = hashToken(String(backupCode).trim());
          const codeIndex = storedCodes.findIndex(c => c.hash === inputHash && !c.used);

          if (codeIndex !== -1) {
            is2faValid = true;
            storedCodes[codeIndex].used = true;
            storedCodes[codeIndex].used_at = new Date().toISOString();
            await pool.query(
              `UPDATE users SET two_factor_backup_codes = ? WHERE id = ?`,
              [JSON.stringify(storedCodes), user.id]
            );
          }
        } catch (e) {
          console.error('[2FA Error] Backup code verification error:', e);
        }
      }

      if (!is2faValid) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA authentication or backup code' });
      }
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

    // Linked donor / student ID lookup
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

    // Generate JWT Access and Refresh Tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh session in active_sessions table
    try {
      const refreshHash = hashToken(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await pool.query(
        `INSERT INTO active_sessions (user_id, refresh_token_hash, device_info, ip_address, expires_at)
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, refreshHash, req.headers['user-agent'] || 'Browser', req.ip || '127.0.0.1', expiresAt]
      );
    } catch (sessionErr) {
      console.error('[Session Error] Failed to persist active session:', sessionErr.message);
    }

    logAudit({
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'auth',
      action: 'login',
      recordId: user.id,
      details: { role: user.role_slug, portal, twoFactorUsed: !!user.two_factor_enabled }
    });

    // Check if administrative role requires 2FA setup recommendation
    const isAdminRole = ['super_admin', 'accountant', 'hr_manager', 'staff'].includes(user.role_slug);
    const require2FASetup = isAdminRole && !user.two_factor_enabled;

    // Set secure httpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('dpl_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });
    res.cookie('dpl_refresh', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      accessToken,
      refreshToken,
      require2FASetup,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        twoFactorEnabled: !!user.two_factor_enabled,
        role: {
          id: user.role_id,
          name: user.role_name,
          slug: user.role_slug
        },
        permissions: permissionList,
        mustChangePassword: !!user.must_change_password,
        linkedDonorId,
        linkedStudentId
      }
    });

  } catch (error) {
    console.error('[Auth Error] Login failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
}

// 2. Register User (with Password Complexity Check & 12-round bcrypt)
async function register(req, res) {
  try {
    const { fullName, email, password, phone, accountType, monasticName, sanghaId } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    const [existing] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const roleSlug = accountType === 'student' ? 'student_monk' : 'donor';
    const [roles] = await pool.query(`SELECT id FROM roles WHERE slug = ?`, [roleSlug]);
    const roleId = roles.length > 0 ? roles[0].id : 2;

    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
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

    logAudit({
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'auth',
      action: 'register',
      recordId: userId,
      details: { role: roleSlug, email: email.trim().toLowerCase() }
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. You can now log in.'
    });

  } catch (error) {
    console.error('[Auth Error] Registration failed:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
}

// 3. Current Authenticated User Profile (Me)
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
        twoFactorEnabled: !!req.user.two_factor_enabled,
        role: {
          id: req.user.role_id,
          name: req.user.role_name,
          slug: req.user.role_slug
        },
        permissions: req.user.permissions,
        mustChangePassword: !!req.user.must_change_password,
        linkedDonorId,
        linkedStudentId
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
}

// 4. Update Profile
async function updateProfile(req, res) {
  try {
    const { fullName, phone, avatarUrl, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set new password' });
      }
      if (!validatePasswordStrength(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.'
        });
      }
      const [users] = await pool.query(`SELECT password_hash FROM users WHERE id = ?`, [userId]);
      const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password incorrect' });
      }
      const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
      const newHash = await bcrypt.hash(newPassword, salt);
      await pool.query(`UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?`, [newHash, userId]);
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

// 5. Setup TOTP 2FA (Generates Secret + QR Code + Backup Codes)
async function setup2FA(req, res) {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    const secret = speakeasy.generateSecret({
      name: `Drodul Phendey Ling (${email})`,
      issuer: 'Drodul Phendey Ling Foundation',
      length: 20
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Generate 8 alphanumeric single-use backup recovery codes
    const backupCodes = [];
    const hashedBackupCodes = [];
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      backupCodes.push(code);
      hashedBackupCodes.push({
        hash: hashToken(code),
        used: false,
        created_at: new Date().toISOString()
      });
    }

    // Save temporary secret to user record
    await pool.query(
      `UPDATE users SET two_factor_secret = ?, two_factor_backup_codes = ? WHERE id = ?`,
      [secret.base32, JSON.stringify(hashedBackupCodes), userId]
    );

    return res.json({
      success: true,
      data: {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
        qrCodeUrl: qrCodeDataUrl,
        backupCodes
      },
      message: 'Scan the QR code with Google Authenticator or enter the manual key, then verify with a 6-digit code.'
    });
  } catch (error) {
    console.error('[2FA Setup Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate 2FA setup: ' + error.message });
  }
}

// 6. Verify & Enable TOTP 2FA
async function verify2FA(req, res) {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ success: false, message: '6-digit 2FA token is required' });
    }

    const [users] = await pool.query(`SELECT two_factor_secret FROM users WHERE id = ?`, [userId]);
    if (users.length === 0 || !users[0].two_factor_secret) {
      return res.status(400).json({ success: false, message: '2FA setup was not initiated. Please call setup first.' });
    }

    const isVerified = speakeasy.totp.verify({
      secret: users[0].two_factor_secret,
      encoding: 'base32',
      token: String(token).trim(),
      window: 1
    });

    if (!isVerified) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA token. Verification failed.' });
    }

    await pool.query(`UPDATE users SET two_factor_enabled = 1 WHERE id = ?`, [userId]);

    logAudit({
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'auth',
      action: '2fa_enabled',
      recordId: userId,
      details: { enabled: true }
    });

    return res.json({
      success: true,
      message: 'Two-factor authentication successfully enabled on your account.'
    });
  } catch (error) {
    console.error('[2FA Verify Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify 2FA token' });
  }
}

// 7. Disable TOTP 2FA
async function disable2FA(req, res) {
  try {
    const { password, token } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required to disable 2FA' });
    }

    const [users] = await pool.query(`SELECT password_hash, two_factor_secret, two_factor_enabled FROM users WHERE id = ?`, [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, users[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid account password' });
    }

    if (token && users[0].two_factor_secret) {
      const is2faMatch = speakeasy.totp.verify({
        secret: users[0].two_factor_secret,
        encoding: 'base32',
        token: String(token).trim(),
        window: 1
      });
      if (!is2faMatch) {
        return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
      }
    }

    await pool.query(
      `UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL, two_factor_backup_codes = NULL WHERE id = ?`,
      [userId]
    );

    logAudit({
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'auth',
      action: '2fa_disabled',
      recordId: userId,
      details: { enabled: false }
    });

    return res.json({ success: true, message: 'Two-factor authentication disabled.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
  }
}

// 8. Refresh Token Rotation
async function refreshToken(req, res) {
  try {
    const token = req.body.refreshToken || req.headers['x-refresh-token'];

    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const tokenHash = hashToken(token);

    const [sessions] = await pool.query(
      `SELECT s.*, u.id as user_id, u.role_id, u.status, r.slug as role_slug, r.name as role_name
       FROM active_sessions s
       JOIN users u ON s.user_id = u.id
       JOIN roles r ON u.role_id = r.id
       WHERE s.refresh_token_hash = ?`,
      [tokenHash]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid refresh session' });
    }

    const session = sessions[0];

    // Detect reuse of revoked token (Security Breach Guard: revoke all sessions)
    if (session.is_revoked) {
      console.warn(`[Security Alert] Revoked refresh token reused for user ${session.user_id}. Revoking all sessions.`);
      await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE user_id = ?`, [session.user_id]);
      return res.status(403).json({
        success: false,
        message: 'Security alert: Invalid refresh token reuse detected. All sessions revoked. Please log in again.'
      });
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE id = ?`, [session.id]);
      return res.status(401).json({ success: false, message: 'Refresh token expired. Please log in again.' });
    }

    if (session.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is inactive or suspended' });
    }

    // Invalidate old refresh session (Token Rotation)
    await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE id = ?`, [session.id]);

    // Issue new pair
    const userObj = { id: session.user_id, role_id: session.role_id, role_slug: session.role_slug };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(userObj);

    const newRefreshHash = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO active_sessions (user_id, refresh_token_hash, device_info, ip_address, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [session.user_id, newRefreshHash, req.headers['user-agent'] || 'Browser', req.ip || '127.0.0.1', newExpiresAt]
    );

    return res.json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('[Refresh Token Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to refresh token' });
  }
}

// 9. Logout & Session Invalidation
async function logout(req, res) {
  try {
    const token = req.body.refreshToken || req.headers['x-refresh-token'] || req.cookies?.dpl_refresh;
    if (token) {
      const tokenHash = hashToken(token);
      await pool.query(`UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE refresh_token_hash = ?`, [tokenHash]);
    }

    res.clearCookie('dpl_token', { httpOnly: true, sameSite: 'lax' });
    res.clearCookie('dpl_refresh', { httpOnly: true, sameSite: 'lax' });

    if (req.user) {
      logAudit({
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        module: 'auth',
        action: 'logout',
        recordId: req.user.id,
        details: { email: req.user.email }
      });
    }

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to log out' });
  }
}

// 10. Forgot Password (Single-use 15-Minute Expiry Token Hashing)
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const [users] = await pool.query(`SELECT id, full_name, email FROM users WHERE email = ?`, [email.trim().toLowerCase()]);
    
    // Always return success to prevent user enumeration attacks
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If an account exists for that email, a password reset link has been dispatched.'
      });
    }

    const user = users[0];
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes

    // Invalidate existing unused tokens for this user
    await pool.query(`UPDATE password_reset_tokens SET is_used = 1 WHERE user_id = ? AND is_used = 0`, [user.id]);

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, ip_address)
       VALUES (?, ?, ?, ?)`,
      [user.id, tokenHash, expiresAt, req.ip || '127.0.0.1']
    );

    logAudit({
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'auth',
      action: 'forgot_password_requested',
      recordId: user.id,
      details: { email: user.email }
    });

    const isDev = process.env.NODE_ENV !== 'production';

    return res.json({
      success: true,
      message: 'If an account exists for that email, a password reset link has been dispatched.',
      // Expose resetToken in non-production environments for testing and local verification
      ...(isDev ? { devResetToken: rawResetToken } : {})
    });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return res.status(500).json({ success: false, message: 'Internal error processing request' });
  }
}

// 11. Reset Password (Single-use Invalidation + Active Session Revocation)
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required' });
    }

    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.'
      });
    }

    const tokenHash = hashToken(token);

    const [tokens] = await pool.query(
      `SELECT prt.*, u.email 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token_hash = ? AND prt.is_used = 0`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or already used password reset token.' });
    }

    const resetRecord = tokens[0];

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Password reset token has expired (15-minute limit exceeded).' });
    }

    // Hash new password with 12 rounds
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, resetRecord.user_id]);

    // Mark token as used
    await pool.query(
      `UPDATE password_reset_tokens SET is_used = 1, used_at = NOW() WHERE id = ?`,
      [resetRecord.id]
    );

    // Invalidate all existing sessions for security
    await pool.query(
      `UPDATE active_sessions SET is_revoked = 1, revoked_at = NOW() WHERE user_id = ?`,
      [resetRecord.user_id]
    );

    logAudit({
      userId: resetRecord.user_id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'auth',
      action: 'password_reset_completed',
      recordId: resetRecord.user_id,
      details: { email: resetRecord.email }
    });

    return res.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password: ' + error.message });
  }
}

module.exports = {
  BCRYPT_ROUNDS,
  validatePasswordStrength,
  login,
  register,
  me,
  updateProfile,
  setup2FA,
  verify2FA,
  disable2FA,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
};
