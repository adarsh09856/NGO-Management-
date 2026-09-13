-- ===================================================================
-- Migration 006: Platform Currency Defaults & Offering Schema Integrity
-- ===================================================================

-- 1. Ensure system_settings has baseline currency keys
INSERT INTO system_settings (setting_key, setting_value, description, group_name) VALUES
('default_currency', 'BTN', 'Default platform currency code (BTN / INR / USD)', 'finance'),
('currency', 'BTN', 'Active system currency code', 'finance'),
('currency_symbol', 'Nu.', 'Active system currency symbol', 'finance'),
('currency_name', 'Bhutanese Ngultrum', 'Active system currency display name', 'finance')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- 2. Ensure prayer_requests has offering_currency column
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'prayer_requests'
    AND COLUMN_NAME = 'offering_currency'
);

SET @stmt = IF(@col_exists = 0,
  'ALTER TABLE prayer_requests ADD COLUMN offering_currency VARCHAR(10) DEFAULT ''BTN'' AFTER offering_amount',
  'SELECT 1'
);
PREPARE alter_stmt FROM @stmt;
EXECUTE alter_stmt;
DEALLOCATE PREPARE alter_stmt;

-- 3. Ensure donations table currency defaults to BTN
ALTER TABLE donations MODIFY COLUMN currency VARCHAR(10) DEFAULT 'BTN';
