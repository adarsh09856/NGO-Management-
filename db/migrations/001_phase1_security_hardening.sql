-- ===================================================================
-- Migration 001: Phase 1 Security Hardening & Session Management
-- ===================================================================

-- 1. Create Schema Migrations Table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add 2FA Columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255) NULL AFTER avatar_url,
  ADD COLUMN IF NOT EXISTS two_factor_enabled TINYINT(1) DEFAULT 0 AFTER two_factor_secret,
  ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT NULL AFTER two_factor_enabled;

-- 3. Add SHA-256 Hash Chaining Columns to audit_logs table
ALTER TABLE audit_logs 
  ADD COLUMN IF NOT EXISTS prev_hash VARCHAR(64) NULL AFTER details,
  ADD COLUMN IF NOT EXISTS record_hash VARCHAR(64) NULL AFTER prev_hash;

-- 4. Password Reset Tokens Table (Single-use, 15-min expiration)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  is_used TINYINT(1) DEFAULT 0,
  used_at DATETIME NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_token_hash (token_hash),
  INDEX idx_reset_token_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Active Sessions & Refresh Token Rotation Table
CREATE TABLE IF NOT EXISTS active_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  refresh_token_hash VARCHAR(64) NOT NULL UNIQUE,
  device_info VARCHAR(255) NULL,
  ip_address VARCHAR(45) NULL,
  is_revoked TINYINT(1) DEFAULT 0,
  revoked_at DATETIME NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_refresh_hash (refresh_token_hash),
  INDEX idx_session_user (user_id, is_revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record migration as applied
INSERT IGNORE INTO schema_migrations (version, description) 
VALUES ('001_phase1_security_hardening', '2FA fields, audit hash chaining, password reset tokens, and active sessions');
