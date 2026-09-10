-- ===================================================================
-- Migration 004: Volunteers, Event RSVPs, Newsletter & Certificates
-- ===================================================================

-- 1. Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  skills TEXT,
  availability VARCHAR(100),
  interests VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected', 'active', 'inactive') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_volunteers_status (status),
  INDEX idx_volunteers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Event RSVPs Table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NULL,
  guest_name VARCHAR(150) NOT NULL,
  guest_email VARCHAR(150) NOT NULL,
  guest_phone VARCHAR(50),
  attending_count INT DEFAULT 1,
  special_requests TEXT,
  status ENUM('confirmed', 'cancelled', 'attended') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_rsvp_event_status (event_id, status),
  INDEX idx_rsvp_email (guest_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  full_name VARCHAR(150) NULL,
  status ENUM('subscribed', 'unsubscribed') DEFAULT 'subscribed',
  unsubscribe_token VARCHAR(64) NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME NULL,
  INDEX idx_newsletter_status (status),
  INDEX idx_newsletter_token (unsubscribe_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Certificates Table Security & Revocation Enhancements
ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS verification_hash VARCHAR(64) NULL AFTER certificate_number,
  ADD COLUMN IF NOT EXISTS is_revoked TINYINT(1) DEFAULT 0 AFTER verification_hash,
  ADD COLUMN IF NOT EXISTS revocation_reason TEXT NULL AFTER is_revoked,
  ADD COLUMN IF NOT EXISTS revoked_at DATETIME NULL AFTER revocation_reason,
  ADD INDEX IF NOT EXISTS idx_cert_verify_hash (verification_hash),
  ADD INDEX IF NOT EXISTS idx_cert_number (certificate_number);

-- Record migration 004 in schema_migrations table
INSERT IGNORE INTO schema_migrations (version, description) 
VALUES ('004_lms_volunteers_and_newsletter', 'Created volunteers, event_rsvps, newsletter_subscribers, and added certificate verification hashes');
