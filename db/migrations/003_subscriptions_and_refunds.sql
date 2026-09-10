-- ===================================================================
-- Migration 003: Subscriptions, Recurring Pledges & Refund Columns
-- ===================================================================

-- 1. Add Refund Tracking Columns to donations Table
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS refund_id VARCHAR(100) NULL AFTER transaction_ref,
  ADD COLUMN IF NOT EXISTS refund_status ENUM('NONE', 'REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'NONE' AFTER refund_id,
  ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(15,2) DEFAULT 0.00 AFTER refund_status,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT NULL AFTER refunded_amount,
  ADD COLUMN IF NOT EXISTS refunded_at DATETIME NULL AFTER refund_reason;

-- 2. Add Subscription Gateway Tracking to recurring_pledges Table
ALTER TABLE recurring_pledges
  ADD COLUMN IF NOT EXISTS gateway_subscription_id VARCHAR(100) NULL AFTER campaign_id,
  ADD COLUMN IF NOT EXISTS gateway_plan_id VARCHAR(100) NULL AFTER gateway_subscription_id,
  ADD COLUMN IF NOT EXISTS failure_count INT DEFAULT 0 AFTER next_due_date,
  ADD COLUMN IF NOT EXISTS last_charged_at DATETIME NULL AFTER failure_count,
  ADD COLUMN IF NOT EXISTS cancelled_at DATETIME NULL AFTER last_charged_at;

-- 3. Create Subscription Event Audit Table
CREATE TABLE IF NOT EXISTS subscription_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscription_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payload JSON NULL,
  status VARCHAR(50) DEFAULT 'PROCESSED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sub_event_sub_id (subscription_id),
  INDEX idx_sub_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record migration 003 in schema_migrations table
INSERT IGNORE INTO schema_migrations (version, description) 
VALUES ('003_subscriptions_and_refunds', 'Added refund tracking fields, subscription gateway metadata, and subscription events table');
