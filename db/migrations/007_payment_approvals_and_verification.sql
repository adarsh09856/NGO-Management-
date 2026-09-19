-- ===================================================================
-- Migration 007: Payment Approvals, Verification Audit & Rejection Tracking
-- ===================================================================

-- 1. Ensure donations table payment_status enum supports 'rejected' and 'pending_verification'
ALTER TABLE donations 
MODIFY COLUMN payment_status ENUM(
  'pending',
  'pending_verification',
  'completed',
  'failed',
  'rejected',
  'refunded',
  'partially_refunded'
) NOT NULL DEFAULT 'pending';

-- 2. Add rejection_reason column if not exists
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'donations'
    AND COLUMN_NAME = 'rejection_reason'
);
SET @stmt = IF(@col_exists = 0,
  'ALTER TABLE donations ADD COLUMN rejection_reason TEXT NULL AFTER remarks',
  'SELECT 1'
);
PREPARE alter_stmt FROM @stmt;
EXECUTE alter_stmt;
DEALLOCATE PREPARE alter_stmt;

-- 3. Add verified_by_user_id column if not exists
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'donations'
    AND COLUMN_NAME = 'verified_by_user_id'
);
SET @stmt = IF(@col_exists = 0,
  'ALTER TABLE donations ADD COLUMN verified_by_user_id INT NULL AFTER rejection_reason',
  'SELECT 1'
);
PREPARE alter_stmt FROM @stmt;
EXECUTE alter_stmt;
DEALLOCATE PREPARE alter_stmt;

-- 4. Add verified_at column if not exists
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'donations'
    AND COLUMN_NAME = 'verified_at'
);
SET @stmt = IF(@col_exists = 0,
  'ALTER TABLE donations ADD COLUMN verified_at DATETIME NULL AFTER verified_by_user_id',
  'SELECT 1'
);
PREPARE alter_stmt FROM @stmt;
EXECUTE alter_stmt;
DEALLOCATE PREPARE alter_stmt;

-- 5. Add index on payment_status and payment_date for high performance filtering
SET @idx_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'donations'
    AND INDEX_NAME = 'idx_donations_status_date'
);
SET @stmt = IF(@idx_exists = 0,
  'ALTER TABLE donations ADD INDEX idx_donations_status_date (payment_status, payment_date)',
  'SELECT 1'
);
PREPARE alter_idx_stmt FROM @stmt;
EXECUTE alter_idx_stmt;
DEALLOCATE PREPARE alter_idx_stmt;
