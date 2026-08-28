-- ===================================================================
-- Drodul Phendey Ling Foundation - Relational Database Schema
-- Database Engine: MySQL 8.0+ / MariaDB (InnoDB, UTF8MB4)
-- ===================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url VARCHAR(255),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  is_verified TINYINT(1) DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_module_action (module, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Audit Log (Immutable tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  record_id VARCHAR(50),
  details LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_module (module),
  INDEX idx_audit_action (action),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  link VARCHAR(255),
  is_read TINYINT(1) DEFAULT 0,
  read_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Donors
CREATE TABLE IF NOT EXISTS donors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL UNIQUE,
  donor_type ENUM('individual', 'organization', 'anonymous') DEFAULT 'individual',
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Bhutan',
  postal_code VARCHAR(30),
  pan_or_tax_id VARCHAR(50),
  total_donated DECIMAL(15,2) DEFAULT 0.00,
  total_donations_count INT DEFAULT 0,
  first_donation_date DATE NULL,
  last_donation_date DATE NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_donor_name (full_name),
  INDEX idx_donor_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  banner_image VARCHAR(255),
  target_amount DECIMAL(15,2) NOT NULL,
  raised_amount DECIMAL(15,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'INR',
  start_date DATE,
  end_date DATE,
  is_active TINYINT(1) DEFAULT 1,
  is_featured TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Donations
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_number VARCHAR(50) UNIQUE,
  donor_id INT NOT NULL,
  campaign_id INT NULL,
  donation_for VARCHAR(150) NOT NULL,
  donation_type ENUM('one_time', 'recurring') DEFAULT 'one_time',
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  amount_in_words VARCHAR(255),
  payment_method ENUM('online_gateway', 'bank_transfer', 'cash', 'cheque_dd', 'other') DEFAULT 'online_gateway',
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
  transaction_ref VARCHAR(100),
  payment_date DATE NOT NULL,
  payment_gateway VARCHAR(50),
  bank_name VARCHAR(100),
  remarks TEXT,
  send_receipt TINYINT(1) DEFAULT 1,
  is_80g_eligible TINYINT(1) DEFAULT 1,
  is_deleted TINYINT(1) DEFAULT 0,
  created_by_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE RESTRICT,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_donations_date (payment_date),
  INDEX idx_donations_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Recurring Donations / Pledges
CREATE TABLE IF NOT EXISTS recurring_pledges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  campaign_id INT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  frequency ENUM('monthly', 'quarterly', 'annually') DEFAULT 'monthly',
  status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
  start_date DATE NOT NULL,
  next_charge_date DATE,
  payment_method VARCHAR(50) DEFAULT 'online_gateway',
  gateway_subscription_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_name VARCHAR(150) NOT NULL,
  bank_name VARCHAR(150) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  branch VARCHAR(100),
  ifsc_swift VARCHAR(50),
  current_balance DECIMAL(15,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'INR',
  account_type ENUM('main', 'donation', 'operational', 'petty_cash') DEFAULT 'main',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Money Receipts
CREATE TABLE IF NOT EXISTS money_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  financial_year VARCHAR(20) NOT NULL,
  donation_id INT NULL,
  lms_payment_id INT NULL,
  receipt_type ENUM('donation', 'training_fee', 'puja_offering', 'book_sale', 'other') DEFAULT 'donation',
  recipient_name VARCHAR(150) NOT NULL,
  recipient_email VARCHAR(150),
  recipient_phone VARCHAR(50),
  recipient_address TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  amount_in_words VARCHAR(255),
  payment_mode VARCHAR(50) DEFAULT 'Online Payment',
  transaction_no VARCHAR(100),
  receipt_date DATE NOT NULL,
  tax_exemption_number VARCHAR(100) DEFAULT 'DPL/TAX-EXEMPT/BTN/2026/80G-092',
  status ENUM('ISSUED', 'VOID') DEFAULT 'ISSUED',
  void_reason TEXT NULL,
  voided_by_user_id INT NULL,
  voided_at DATETIME NULL,
  notes TEXT,
  pdf_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE SET NULL,
  FOREIGN KEY (voided_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_receipt_num (receipt_number),
  INDEX idx_receipt_date (receipt_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Income Ledger
CREATE TABLE IF NOT EXISTS income (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_id INT NULL,
  source_category ENUM('donation', 'training_fee', 'prayer_offering', 'monastery_event', 'misc') DEFAULT 'donation',
  particulars VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  received_date DATE NOT NULL,
  payment_mode VARCHAR(50) DEFAULT 'Online',
  deposit_bank_account_id INT NULL,
  reference_no VARCHAR(100),
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (receipt_id) REFERENCES money_receipts(id) ON DELETE SET NULL,
  FOREIGN KEY (deposit_bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_income_date (received_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  expense_date DATE NOT NULL,
  payee_name VARCHAR(150) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
  bank_account_id INT NULL,
  voucher_no VARCHAR(50),
  invoice_url VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
  submitted_by_user_id INT NOT NULL,
  approved_by_user_id INT NULL,
  approved_at DATETIME NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (submitted_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_expense_date (expense_date),
  INDEX idx_expense_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Vouchers (Double Entry Ledger)
CREATE TABLE IF NOT EXISTS vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  voucher_no VARCHAR(50) NOT NULL UNIQUE,
  voucher_type ENUM('receipt', 'payment', 'journal', 'contra') NOT NULL,
  voucher_date DATE NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  particulars VARCHAR(255) NOT NULL,
  status ENUM('draft', 'posted', 'cancelled') DEFAULT 'posted',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Store Locations
CREATE TABLE IF NOT EXISTS store_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Store Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Units
CREATE TABLE IF NOT EXISTS units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Bhutan',
  tax_number VARCHAR(50),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Store Items
CREATE TABLE IF NOT EXISTS store_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_code VARCHAR(50) NOT NULL UNIQUE,
  item_name VARCHAR(150) NOT NULL,
  category_id INT NOT NULL,
  unit_id INT NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 10,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  location_id INT NULL,
  description TEXT,
  status ENUM('in_stock', 'low_stock', 'out_of_stock', 'discontinued') DEFAULT 'in_stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,
  FOREIGN KEY (location_id) REFERENCES store_locations(id) ON DELETE SET NULL,
  INDEX idx_item_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Stock Transactions
CREATE TABLE IF NOT EXISTS stock_txn (
  id INT AUTO_INCREMENT PRIMARY KEY,
  txn_no VARCHAR(50) NOT NULL UNIQUE,
  item_id INT NOT NULL,
  txn_type ENUM('stock_in', 'stock_out', 'adjustment', 'transfer') NOT NULL,
  quantity INT NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(12,2) NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  supplier_id INT NULL,
  from_location_id INT NULL,
  to_location_id INT NULL,
  reference_doc VARCHAR(100),
  purpose_or_remarks TEXT,
  txn_date DATE NOT NULL,
  created_by_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES store_items(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (from_location_id) REFERENCES store_locations(id) ON DELETE SET NULL,
  FOREIGN KEY (to_location_id) REFERENCES store_locations(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_txn_date (txn_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Students & Monks Directory
CREATE TABLE IF NOT EXISTS students_monks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL UNIQUE,
  monastic_name VARCHAR(150) NOT NULL,
  secular_name VARCHAR(150),
  roll_number VARCHAR(50) NOT NULL UNIQUE,
  sangha_id VARCHAR(50),
  gender ENUM('male', 'female', 'other') DEFAULT 'male',
  dob DATE,
  nationality VARCHAR(100) DEFAULT 'Bhutanese',
  joining_date DATE NOT NULL,
  monk_status ENUM('novice', 'gelong', 'khenpo', 'lay_student') DEFAULT 'novice',
  guardian_name VARCHAR(150),
  guardian_phone VARCHAR(50),
  address TEXT,
  emergency_contact VARCHAR(100),
  photo_url VARCHAR(255),
  status ENUM('active', 'completed', 'left', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_monk_roll (roll_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Courses
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  level ENUM('Basic', 'Intermediate', 'Advanced', 'Shedra Master') DEFAULT 'Basic',
  description TEXT,
  duration_months INT DEFAULT 6,
  total_credits INT DEFAULT 12,
  instructor_name VARCHAR(150),
  fee_amount DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'INR',
  is_active TINYINT(1) DEFAULT 1,
  thumbnail_url VARCHAR(255),
  syllabus LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. Batches
CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  batch_code VARCHAR(50) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE,
  capacity INT DEFAULT 30,
  status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'ongoing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  batch_id INT NULL,
  enrollment_date DATE NOT NULL,
  progress_percent INT DEFAULT 0,
  attendance_percent INT DEFAULT 0,
  grade VARCHAR(10),
  status ENUM('in_progress', 'completed', 'dropped') DEFAULT 'in_progress',
  completed_at DATETIME NULL,
  certificate_issued TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students_monks(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
  UNIQUE KEY uq_student_course (student_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificate_number VARCHAR(100) NOT NULL UNIQUE,
  enrollment_id INT NOT NULL,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  issue_date DATE NOT NULL,
  grade VARCHAR(20) DEFAULT 'Distinction',
  signed_by VARCHAR(150) DEFAULT 'Khenpo Tashi Dorji, Abbot',
  pdf_url VARCHAR(255),
  status ENUM('VALID', 'REVOKED') DEFAULT 'VALID',
  revocation_reason TEXT NULL,
  revoked_by INT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students_monks(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_cert_num (certificate_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. Student Attendance
CREATE TABLE IF NOT EXISTS attendance_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  batch_id INT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'leave', 'half_day') DEFAULT 'present',
  remarks VARCHAR(255),
  marked_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students_monks(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_student_date (student_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. LMS Payments & Dues
CREATE TABLE IF NOT EXISTS lms_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Online Payment',
  payment_gateway VARCHAR(50),
  transaction_ref VARCHAR(100),
  status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
  receipt_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students_monks(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  FOREIGN KEY (receipt_id) REFERENCES money_receipts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. Employees
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL UNIQUE,
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  designation VARCHAR(100) NOT NULL,
  department ENUM('Monastic Academic', 'Admin & Finance', 'Stupa Maintenance', 'Kitchen & Caretaking', 'Security') DEFAULT 'Admin & Finance',
  employment_type ENUM('Full-Time', 'Part-Time', 'Monastic Sangha', 'Contract') DEFAULT 'Full-Time',
  basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  joining_date DATE NOT NULL,
  status ENUM('active', 'on_leave', 'terminated') DEFAULT 'active',
  bank_account_no VARCHAR(50),
  bank_name VARCHAR(100),
  emergency_contact VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_emp_code (employee_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. Employee Attendance
CREATE TABLE IF NOT EXISTS attendance_employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  status ENUM('present', 'absent', 'leave', 'half_day') DEFAULT 'present',
  remarks VARCHAR(255),
  marked_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_emp_date (employee_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type ENUM('casual', 'medical', 'monastic_retreat', 'unpaid') DEFAULT 'casual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  review_remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 33. Payroll Runs
CREATE TABLE IF NOT EXISTS payroll_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_code VARCHAR(50) NOT NULL UNIQUE,
  month INT NOT NULL,
  year INT NOT NULL,
  total_employees INT NOT NULL DEFAULT 0,
  total_casual_workers INT NOT NULL DEFAULT 0,
  total_basic DECIMAL(15,2) DEFAULT 0.00,
  total_allowances DECIMAL(15,2) DEFAULT 0.00,
  total_deductions DECIMAL(15,2) DEFAULT 0.00,
  total_net_payroll DECIMAL(15,2) DEFAULT 0.00,
  total_casual_labor_cost DECIMAL(15,2) DEFAULT 0.00,
  grand_total DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('draft', 'processed', 'paid') DEFAULT 'processed',
  processed_by INT NULL,
  processed_at DATETIME NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_month_year (month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. Salary Slips
CREATE TABLE IF NOT EXISTS salary_slips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payroll_run_id INT NOT NULL,
  employee_id INT NOT NULL,
  slip_no VARCHAR(50) NOT NULL UNIQUE,
  month INT NOT NULL,
  year INT NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL,
  housing_allowance DECIMAL(10,2) DEFAULT 0.00,
  monastic_stipend DECIMAL(10,2) DEFAULT 0.00,
  medical_allowance DECIMAL(10,2) DEFAULT 0.00,
  total_earnings DECIMAL(12,2) NOT NULL,
  pf_deduction DECIMAL(10,2) DEFAULT 0.00,
  tax_deduction DECIMAL(10,2) DEFAULT 0.00,
  other_deductions DECIMAL(10,2) DEFAULT 0.00,
  total_deductions DECIMAL(12,2) NOT NULL,
  net_salary DECIMAL(12,2) NOT NULL,
  payment_status ENUM('pending', 'paid') DEFAULT 'paid',
  payment_date DATE,
  payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
  pdf_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 35. Casual Labor
CREATE TABLE IF NOT EXISTS casual_labor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payroll_run_id INT NULL,
  worker_name VARCHAR(150) NOT NULL,
  work_type VARCHAR(100) NOT NULL,
  days_worked DECIMAL(5,1) NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  work_date_from DATE NOT NULL,
  work_date_to DATE NOT NULL,
  payment_status ENUM('pending', 'paid') DEFAULT 'paid',
  supervisor_id INT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (supervisor_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 36. Projects (Stupa Construction & Events)
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  category VARCHAR(100) DEFAULT 'Stupa Construction',
  description TEXT,
  estimated_budget DECIMAL(15,2) NOT NULL,
  actual_expenditure DECIMAL(15,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'INR',
  start_date DATE NOT NULL,
  target_completion_date DATE,
  status ENUM('planning', 'in_progress', 'on_hold', 'completed') DEFAULT 'in_progress',
  completion_percent INT DEFAULT 0,
  location VARCHAR(150) DEFAULT 'Gelephu, Sarpang, Bhutan',
  manager_name VARCHAR(150),
  thumbnail_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 37. Project Tasks
CREATE TABLE IF NOT EXISTS project_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to_employee_id INT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('todo', 'in_progress', 'review', 'completed') DEFAULT 'todo',
  due_date DATE,
  completed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 38. Contacts (CRM)
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_type ENUM('donor', 'prospect', 'partner', 'vendor', 'monastic_affiliate') DEFAULT 'donor',
  full_name VARCHAR(150) NOT NULL,
  organization_name VARCHAR(150),
  email VARCHAR(150),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Bhutan',
  tags VARCHAR(255) DEFAULT 'Devotee',
  lifetime_value DECIMAL(15,2) DEFAULT 0.00,
  last_contact_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contact_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 39. Contact Communications & Timeline
CREATE TABLE IF NOT EXISTS contact_communications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  comm_type ENUM('email', 'phone', 'in_person_meeting', 'letter', 'whatsapp') NOT NULL,
  subject VARCHAR(200) NOT NULL,
  notes TEXT,
  scheduled_followup_date DATE NULL,
  followup_status ENUM('pending', 'done') DEFAULT 'done',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 40. Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  target_segment VARCHAR(100) DEFAULT 'All Donors',
  body_html LONGTEXT NOT NULL,
  sent_count INT DEFAULT 0,
  status ENUM('draft', 'scheduled', 'sent') DEFAULT 'draft',
  sent_at DATETIME NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 41. Documents
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category ENUM('Legal', 'Blueprints', '80G Approvals', 'Audits', 'Sacred Texts', 'Minutes') DEFAULT 'Legal',
  file_path VARCHAR(255) NOT NULL,
  file_size INT DEFAULT 0,
  file_type VARCHAR(50),
  uploaded_by_user_id INT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 42. Notices
CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  target_audience ENUM('all', 'public', 'monks', 'staff', 'donors') DEFAULT 'all',
  is_pinned TINYINT(1) DEFAULT 0,
  is_published TINYINT(1) DEFAULT 1,
  published_date DATE NOT NULL,
  expires_date DATE NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 43. News & Events (CMS)
CREATE TABLE IF NOT EXISTS news_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  category ENUM('News', 'Teaching', 'Ganachakra', 'Construction Update', 'Puja') DEFAULT 'News',
  summary TEXT,
  content LONGTEXT NOT NULL,
  event_date DATE NULL,
  event_time VARCHAR(50),
  location VARCHAR(150),
  event_type ENUM('In-Person', 'Online Zoom', 'Hybrid') DEFAULT 'In-Person',
  banner_image VARCHAR(255),
  is_published TINYINT(1) DEFAULT 1,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 44. Prayer Requests
CREATE TABLE IF NOT EXISTS prayer_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  devotee_name VARCHAR(150) NOT NULL,
  devotee_email VARCHAR(150),
  devotee_phone VARCHAR(50),
  country VARCHAR(100) DEFAULT 'Bhutan',
  prayer_type ENUM('World Peace', 'Health & Long Life', 'Departed Loved Ones', 'Prosperity', 'Obstacle Removal') DEFAULT 'World Peace',
  intention_text TEXT NOT NULL,
  butter_lamps_count INT DEFAULT 108,
  dedication_names TEXT,
  offering_amount DECIMAL(10,2) DEFAULT 0.00,
  offering_currency VARCHAR(10) DEFAULT 'INR',
  payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
  receipt_id INT NULL,
  status ENUM('pending', 'dedicated', 'completed') DEFAULT 'pending',
  dedicated_by_monk_id INT NULL,
  dedication_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (receipt_id) REFERENCES money_receipts(id) ON DELETE SET NULL,
  FOREIGN KEY (dedicated_by_monk_id) REFERENCES students_monks(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 45. Gallery Items (Supporting Photos, Video Uploads, and Video URLs)
CREATE TABLE IF NOT EXISTS gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(100) DEFAULT 'Stupa Construction',
  media_type ENUM('image', 'video_upload', 'video_url') DEFAULT 'image',
  media_url VARCHAR(1000) NOT NULL,
  thumbnail_url VARCHAR(1000),
  caption VARCHAR(255),
  display_order INT DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 46. Payment Idempotency Log
CREATE TABLE IF NOT EXISTS payment_idempotency_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gateway ENUM('razorpay', 'stripe') NOT NULL,
  event_id VARCHAR(150) NOT NULL UNIQUE,
  payment_id VARCHAR(150),
  order_id VARCHAR(150),
  amount DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED') DEFAULT 'RECEIVED',
  payload LONGTEXT,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  INDEX idx_gateway_event (gateway, event_id),
  INDEX idx_gateway_payment (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 47. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description VARCHAR(255),
  group_name VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 48. Blog Posts (Rich Content, Cover Image, Publishing)
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  summary TEXT,
  content LONGTEXT NOT NULL,
  cover_image VARCHAR(500),
  author_id INT NULL,
  author_name VARCHAR(150) DEFAULT 'Khenpo Tashi Dorji',
  status ENUM('draft', 'published', 'archived') DEFAULT 'published',
  tags VARCHAR(255) DEFAULT 'Buddhism, Bhutan, Peace Stupa',
  views_count INT DEFAULT 0,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_blog_slug (slug),
  INDEX idx_blog_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 49. Learning & Dharma Video Materials (Public Training Library)
CREATE TABLE IF NOT EXISTS learning_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'Buddhist Philosophy',
  media_type ENUM('video_upload', 'video_url', 'document') DEFAULT 'video_url',
  media_url VARCHAR(1000) NOT NULL,
  thumbnail_url VARCHAR(1000),
  instructor VARCHAR(255) DEFAULT 'Khenpo Tashi Dorji',
  duration VARCHAR(50) DEFAULT '45 mins',
  display_order INT DEFAULT 0,
  is_published TINYINT(1) DEFAULT 1,
  views_count INT DEFAULT 0,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_learning_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
