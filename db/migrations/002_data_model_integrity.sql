-- ===================================================================
-- Migration 002: Data Model Integrity, Indexes & Foreign Key Safeguards
-- ===================================================================

-- 1. Index Optimizations for Financial & High-Throughput Queries
ALTER TABLE donations
  ADD INDEX IF NOT EXISTS idx_donations_status_date (payment_status, payment_date),
  ADD INDEX IF NOT EXISTS idx_donations_donor_status (donor_id, payment_status),
  ADD INDEX IF NOT EXISTS idx_donations_campaign (campaign_id, payment_status);

ALTER TABLE money_receipts
  ADD INDEX IF NOT EXISTS idx_receipts_date_status (receipt_date, status),
  ADD INDEX IF NOT EXISTS idx_receipts_email (recipient_email),
  ADD INDEX IF NOT EXISTS idx_receipts_financial_year (financial_year, status);

ALTER TABLE income
  ADD INDEX IF NOT EXISTS idx_income_date_source (received_date, source_category),
  ADD INDEX IF NOT EXISTS idx_income_receipt (receipt_id);

ALTER TABLE expenses
  ADD INDEX IF NOT EXISTS idx_expenses_date_status (expense_date, status),
  ADD INDEX IF NOT EXISTS idx_expenses_category (category_id, status);

ALTER TABLE salary_slips
  ADD INDEX IF NOT EXISTS idx_slips_run_employee (payroll_run_id, employee_id),
  ADD INDEX IF NOT EXISTS idx_slips_status (payment_status);

ALTER TABLE enrollments
  ADD INDEX IF NOT EXISTS idx_enroll_student_course (student_id, course_id, status),
  ADD INDEX IF NOT EXISTS idx_enroll_status (status);

ALTER TABLE project_tasks
  ADD INDEX IF NOT EXISTS idx_tasks_project_status (project_id, status),
  ADD INDEX IF NOT EXISTS idx_tasks_due_status (due_date, status);

ALTER TABLE store_items
  ADD INDEX IF NOT EXISTS idx_items_cat_status (category_id, status),
  ADD INDEX IF NOT EXISTS idx_items_stock_status (status, current_stock);

-- Record migration 002 in schema_migrations table
INSERT IGNORE INTO schema_migrations (version, description) 
VALUES ('002_data_model_integrity', 'Optimized multi-column indexes for donations, receipts, expenses, payroll, and LMS');
