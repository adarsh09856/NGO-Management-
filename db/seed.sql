-- ===================================================================
-- Drodul Phendey Ling Foundation - Seed Dataset
-- ===================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles
INSERT INTO roles (id, name, slug, description) VALUES
(1, 'Super Administrator', 'super_admin', 'Full system access and administrative control'),
(2, 'Accountant', 'accountant', 'Manages finance, accounts, receipts, vouchers and payroll'),
(3, 'HR Manager', 'hr_manager', 'Manages employees, attendance, leave and casual labor'),
(4, 'Staff / Coordinator', 'staff', 'General staff managing day-to-day operations and entries'),
(5, 'Donor', 'donor', 'Registered donor with access to personal donation history & receipts'),
(6, 'Student / Monk', 'student_monk', 'Monastic student with access to LMS, attendance and certificates')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Permissions
INSERT INTO permissions (id, module, action, description) VALUES
(1, 'donations', 'view', 'View donation records'),
(2, 'donations', 'create', 'Record a new donation'),
(3, 'donations', 'edit', 'Edit donation details'),
(4, 'donations', 'delete', 'Delete/void donation records'),
(5, 'donations', 'campaigns', 'Manage fundraising campaigns'),
(6, 'receipts', 'issue', 'Issue money receipts'),
(7, 'receipts', 'view', 'View and download receipts'),
(8, 'receipts', 'void', 'Void receipts with audit trail'),
(9, 'accounts', 'view', 'View accounts and financial ledgers'),
(10, 'accounts', 'expenses_submit', 'Submit expense claims'),
(11, 'accounts', 'expenses_approve', 'Approve/reject expense claims'),
(12, 'accounts', 'vouchers', 'Create and manage vouchers'),
(13, 'inventory', 'view', 'View store items and stock levels'),
(14, 'inventory', 'manage_items', 'Create and edit store items'),
(15, 'inventory', 'stock_txn', 'Perform stock in and stock out transactions'),
(16, 'inventory', 'stock_adjust', 'Perform stock adjustments and transfers'),
(17, 'lms', 'view', 'View courses and batches'),
(18, 'lms', 'manage_courses', 'Manage courses, syllabus and batches'),
(19, 'lms', 'enroll', 'Enroll students and manage enrollments'),
(20, 'lms', 'attendance', 'Mark student attendance'),
(21, 'lms', 'certificates', 'Issue and revoke certificates'),
(22, 'hrm', 'manage_employees', 'Manage employee directory'),
(23, 'hrm', 'attendance', 'Mark employee daily attendance'),
(24, 'hrm', 'leave_approve', 'Approve and reject leave requests'),
(25, 'payroll', 'manage', 'Run payroll and generate salary slips'),
(26, 'payroll', 'casual_labor', 'Manage casual labor entries'),
(27, 'crm', 'manage_contacts', 'Manage contacts and relations'),
(28, 'crm', 'campaigns', 'Compose and broadcast email campaigns'),
(29, 'projects', 'manage', 'Manage projects, events and tasks'),
(30, 'cms', 'manage', 'Manage website content, news, gallery and prayer requests'),
(31, 'system', 'users', 'Manage user accounts and roles'),
(32, 'system', 'audit_logs', 'View immutable audit trail'),
(33, 'system', 'settings', 'Manage system and payment gateway settings')
ON DUPLICATE KEY UPDATE module=VALUES(module);

-- 3. Role Permissions Mapping
-- Super Admin: All Permissions (1 to 33)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Accountant: Financial, Donations, Receipts, Inventory Stock, Payroll, Projects View
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 12),
(2, 13), (2, 15), (2, 25), (2, 26), (2, 29);

-- HR Manager: HRM, Attendance, Leave, Payroll, Casual Labor, Expenses Submit
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(3, 10), (3, 22), (3, 23), (3, 24), (3, 25), (3, 26), (3, 29);

-- Staff: Donations View/Create, Receipts View, LMS View/Attendance, Inventory View/Txn, Projects, Contacts
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(4, 1), (4, 2), (4, 6), (4, 7), (4, 10), (4, 13), (4, 15), (4, 17), (4, 19), (4, 20), (4, 27), (4, 29), (4, 30);

-- Donor: View Own Receipts & Donations
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(5, 7);

-- Student / Monk: View Courses, Own Certificates, Pay Fees
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(6, 17);

-- 4. Seed Users (Bcrypt hash for 'password123': $2a$10$isIc7WblRmmy66MgLlnF8uTuTKbI.B0L5Pswb/YS/gakHy7LMJ4cm)
INSERT INTO users (id, role_id, full_name, email, password_hash, phone, avatar_url, status, is_verified) VALUES
(1, 1, 'Admin User', 'admin@drodulphendeyling.org', '$2a$10$isIc7WblRmmy66MgLlnF8uTuTKbI.B0L5Pswb/YS/gakHy7LMJ4cm', '+975 17556559', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'active', 1),
(2, 2, 'Sonam Tobgay', 'accountant@drodulphendeyling.org', '$2a$10$isIc7WblRmmy66MgLlnF8uTuTKbI.B0L5Pswb/YS/gakHy7LMJ4cm', '+975 17112233', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'active', 1),
(3, 3, 'Dechen Wangmo', 'hr@drodulphendeyling.org', '$2a$10$isIc7WblRmmy66MgLlnF8uTuTKbI.B0L5Pswb/YS/gakHy7LMJ4cm', '+975 17445566', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'active', 1),
(4, 4, 'Karma Choden', 'staff@drodulphendeyling.org', '$2a$10$isIc7WblRmmy66MgLlnF8uTuTKbI.B0L5Pswb/YS/gakHy7LMJ4cm', '+975 17778899', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'active', 1),
(5, 5, 'Tashi Phuntsho', 'tashi.phuntsho@email.com', '$2a$10$isIc7WblRmmy66MgLlnF8uTuTKbI.B0L5Pswb/YS/gakHy7LMJ4cm', '+975 17 55 8899', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'active', 1),
(6, 6, 'Tenzin Norbu', 'tenzin.norbu@monastery.bt', '$2a$10$isIc7WblRmmy66MgLlnF8uTuTKbI.B0L5Pswb/YS/gakHy7LMJ4cm', '+975 17990011', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'active', 1)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role_id=VALUES(role_id), status=VALUES(status), full_name=VALUES(full_name);

-- 5. Campaigns
INSERT INTO campaigns (id, title, slug, description, banner_image, target_amount, raised_amount, currency, start_date, end_date, is_active, is_featured) VALUES
(1, 'Great Druk Wangyel Peace Stupa', 'peace-stupa-construction', 'Constructing the monumental Great Druk Wangyel Peace Stupa in Gelephu, Sarpang, fostering world peace, spiritual harmony, and cultural preservation.', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', 5000000.00, 3485230.00, 'INR', '2026-01-01', '2026-12-31', 1, 1),
(2, 'Shedra Monastic University Expansion', 'shedra-university-expansion', 'Building state-of-the-art residential quarters, library, and Dharma study halls for 350+ enrolled Buddhist monks and scholars.', 'https://images.unsplash.com/photo-1609137144822-446757b4f535?w=800', 3000000.00, 1850000.00, 'INR', '2026-02-01', '2026-11-30', 1, 1),
(3, 'Sangha Daily Food & Medical Fund', 'sangha-food-medical-fund', 'Providing nutritious vegetarian meals, healthcare, and essential robes for resident monks and novices.', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', 1200000.00, 890000.00, 'INR', '2026-01-01', '2026-12-31', 1, 0),
(4, 'Butter Lamp & World Peace Puja Sponsorship', 'butter-lamp-puja-sponsorship', 'Sponsor 108 butter lamps and prayers for universal peace, longevity, and obstacle clearance.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', 500000.00, 425000.00, 'INR', '2026-01-01', '2026-12-31', 1, 0)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 6. Donors Directory
INSERT INTO donors (id, user_id, donor_type, full_name, email, phone, address, city, state, country, postal_code, pan_or_tax_id, total_donated, total_donations_count, first_donation_date, last_donation_date) VALUES
(1, 5, 'individual', 'Tashi Phuntsho', 'tashi.phuntsho@email.com', '+975 17 55 8899', 'Gelephu Lower Market, House #42', 'Gelephu', 'Sarpang', 'Bhutan', '31101', 'TPH9988776', 125000.00, 4, '2026-01-15', '2026-08-25'),
(2, NULL, 'individual', 'Maria Wangmo', 'maria.wangmo@email.com', '+975 17 88 1234', 'Norzin Lam 2, Thimphu', 'Thimphu', 'Thimphu', 'Bhutan', '11001', 'MW9876543', 45000.00, 3, '2026-03-10', '2026-08-25'),
(3, NULL, 'individual', 'Alan Johnson', 'alan.johnson@email.com', '+1 415 889 9000', '742 Evergreen Terrace', 'San Francisco', 'California', 'United States', '94107', 'US-TAX-4432', 85500.00, 6, '2026-02-14', '2026-08-24'),
(4, NULL, 'individual', 'Sonam Khandu', 'sonam.khandu@email.com', '+975 17 33 4455', 'Bumthang Valley, Jakar', 'Jakar', 'Bumthang', 'Bhutan', '37001', 'SK7766554', 32000.00, 2, '2026-05-20', '2026-08-24'),
(5, NULL, 'individual', 'Ngawang Tenzin', 'ngawang.tenzin@email.com', '+975 17 22 9988', 'Phuentsholing Main Road', 'Phuentsholing', 'Chukha', 'Bhutan', '21101', 'NT1122334', 18100.00, 3, '2026-04-12', '2026-08-24'),
(6, NULL, 'organization', 'Druk Heritage Cultural Trust', 'info@drukheritage.org', '+975 2 334455', 'Heritage Plaza, Changzamtog', 'Thimphu', 'Thimphu', 'Bhutan', '11002', 'DHT-ORG-889', 500000.00, 2, '2026-01-10', '2026-08-15')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 7. Bank Accounts (Matching Accounts & Finance screenshot)
INSERT INTO bank_accounts (id, account_name, bank_name, account_number, branch, ifsc_swift, current_balance, currency, account_type, is_active) VALUES
(1, 'BOB - Main Account', 'Bank of Bhutan', '123456789000', 'Gelephu Branch', 'BOBTBT22', 425680.00, 'INR', 'main', 1),
(2, 'HDFC - Donation Account', 'HDFC Bank', '50200012345678', 'Kolkata Overseas Branch', 'HDFC0000012', 215430.00, 'INR', 'donation', 1),
(3, 'Cash Account', 'Foundation Cash Vault', 'CASH-VAULT-01', 'Gelephu Monastery', 'N/A', 92350.00, 'INR', 'operational', 1),
(4, 'Petty Cash', 'Monastery Office Petty Cash', 'PETTY-01', 'Administration Office', 'N/A', 12870.00, 'INR', 'petty_cash', 1)
ON DUPLICATE KEY UPDATE account_name=VALUES(account_name);

-- 8. Money Receipts (Matching recent receipts and screenshot auto-format)
INSERT INTO money_receipts (id, receipt_number, financial_year, receipt_type, recipient_name, recipient_email, recipient_phone, amount, currency, amount_in_words, payment_mode, transaction_no, receipt_date, tax_exemption_number, status, notes) VALUES
(1, 'RC-2026-105', '2026-2027', 'donation', 'Tashi Phuntsho', 'tashi.phuntsho@email.com', '+975 17 55 8899', 25000.00, 'INR', 'Twenty Five Thousand Only', 'Online Payment (Razorpay)', 'TXN1234567890', '2026-08-25', 'DPL/TAX-EXEMPT/BTN/2026/80G-092', 'ISSUED', 'Donation towards the construction of Great Druk Wangyel Stupa.'),
(2, 'RC-2026-104', '2026-2027', 'training_fee', 'Group of Monks (Shedra Term 2)', 'shedra@drodulphendeyling.org', '+975 17556559', 10000.00, 'INR', 'Ten Thousand Only', 'Bank Transfer (BOB)', 'NEFT-BOB-998822', '2026-08-24', 'DPL/TAX-EXEMPT/BTN/2026/80G-092', 'ISSUED', 'Training Fee - Group of Monks Buddhist Philosophy Level 1'),
(3, 'RC-2026-103', '2026-2027', 'donation', 'Maria Wangmo', 'maria.wangmo@email.com', '+975 17 88 1234', 10000.00, 'INR', 'Ten Thousand Only', 'Online Payment', 'TXN9876543210', '2026-08-25', 'DPL/TAX-EXEMPT/BTN/2026/80G-092', 'ISSUED', 'Donation for Sangha Daily Food Fund'),
(4, 'RC-2026-102', '2026-2027', 'donation', 'Alan Johnson', 'alan.johnson@email.com', '+1 415 889 9000', 5500.00, 'INR', 'Five Thousand Five Hundred Only', 'Online Payment (Stripe)', 'ch_3Nkd9892k1j', '2026-08-24', 'DPL/TAX-EXEMPT/BTN/2026/80G-092', 'ISSUED', 'Donation for Peace Stupa Construction'),
(5, 'RC-2026-101', '2026-2027', 'donation', 'Sonam Khandu', 'sonam.khandu@email.com', '+975 17 33 4455', 3000.00, 'INR', 'Three Thousand Only', 'Bank Transfer', 'BNK-TXN-4455', '2026-08-24', 'DPL/TAX-EXEMPT/BTN/2026/80G-092', 'ISSUED', 'Donation for Butter Lamp Offering'),
(6, 'RC-2026-100', '2026-2027', 'donation', 'Ngawang Tenzin', 'ngawang.tenzin@email.com', '+975 17 22 9988', 2100.00, 'INR', 'Two Thousand One Hundred Only', 'Online Payment', 'TXN5544332211', '2026-08-24', 'DPL/TAX-EXEMPT/BTN/2026/80G-092', 'ISSUED', 'General Monastery Donation')
ON DUPLICATE KEY UPDATE receipt_number=VALUES(receipt_number);

-- 9. Donations Records
INSERT INTO donations (id, receipt_number, donor_id, campaign_id, donation_for, donation_type, amount, currency, amount_in_words, payment_method, payment_status, transaction_ref, payment_date, payment_gateway, bank_name, remarks, send_receipt, is_80g_eligible, is_deleted, created_by_user_id) VALUES
(1, 'RC-2026-105', 1, 1, 'Peace Stupa Construction', 'one_time', 25000.00, 'INR', 'Twenty Five Thousand Only', 'online_gateway', 'completed', 'TXN1234567890', '2026-08-25', 'Razorpay', 'HDFC Bank', 'Donation towards the construction of Great Druk Wangyel Stupa.', 1, 1, 0, 1),
(2, 'RC-2026-103', 2, 3, 'Sangha Daily Food Fund', 'one_time', 10000.00, 'INR', 'Ten Thousand Only', 'online_gateway', 'completed', 'TXN9876543210', '2026-08-25', 'Razorpay', 'Bank of Bhutan', 'Support for resident monks food.', 1, 1, 0, 1),
(3, 'RC-2026-102', 3, 1, 'Peace Stupa Construction', 'one_time', 5500.00, 'INR', 'Five Thousand Five Hundred Only', 'online_gateway', 'completed', 'ch_3Nkd9892k1j', '2026-08-24', 'Stripe', 'International Visa', 'Peace stupa blessing from USA.', 1, 1, 0, 1),
(4, 'RC-2026-101', 4, 4, 'Butter Lamp Puja Sponsorship', 'one_time', 3000.00, 'INR', 'Three Thousand Only', 'bank_transfer', 'completed', 'BNK-TXN-4455', '2026-08-24', 'NEFT', 'Bank of Bhutan', 'Offering 108 butter lamps for family health.', 1, 1, 0, 1),
(5, 'RC-2026-100', 5, 2, 'Shedra Monastic University', 'one_time', 2100.00, 'INR', 'Two Thousand One Hundred Only', 'online_gateway', 'completed', 'TXN5544332211', '2026-08-24', 'Razorpay', 'Druk PNB Bank', 'General Shedra support.', 1, 1, 0, 1),
(6, 'RC-2026-099', 1, 1, 'Peace Stupa Construction', 'recurring', 50000.00, 'INR', 'Fifty Thousand Only', 'bank_transfer', 'completed', 'NEFT-889911', '2026-08-01', 'Direct Transfer', 'Bank of Bhutan', 'Monthly peace stupa pledge.', 1, 1, 0, 1),
(7, 'RC-2026-098', 6, 1, 'Peace Stupa Construction', 'one_time', 250000.00, 'INR', 'Two Lakh Fifty Thousand Only', 'bank_transfer', 'completed', 'RTGS-TRU-8821', '2026-08-15', 'RTGS', 'Bank of Bhutan', 'Major corporate gift for stupa stone carving.', 1, 1, 0, 1)
ON DUPLICATE KEY UPDATE receipt_number=VALUES(receipt_number);

-- 10. Recurring Pledges
INSERT INTO recurring_pledges (id, donor_id, campaign_id, amount, currency, frequency, status, start_date, next_charge_date, payment_method) VALUES
(1, 1, 1, 50000.00, 'INR', 'monthly', 'active', '2026-01-01', '2026-09-01', 'Bank Auto Debit'),
(2, 3, 3, 5000.00, 'INR', 'monthly', 'active', '2026-02-01', '2026-09-01', 'Stripe Recurring')
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- 11. Income Ledger
INSERT INTO income (id, receipt_id, source_category, particulars, amount, currency, received_date, payment_mode, deposit_bank_account_id, reference_no, created_by) VALUES
(1, 1, 'donation', 'Donation Received - Tashi Phuntsho (Peace Stupa)', 25000.00, 'INR', '2026-08-25', 'Online Payment', 2, 'TXN1234567890', 1),
(2, 2, 'training_fee', 'Training Fee - Group of Monks (Shedra Term 2)', 10000.00, 'INR', '2026-08-24', 'Bank Transfer', 1, 'NEFT-BOB-998822', 1),
(3, 3, 'donation', 'Donation Received - Maria Wangmo (Sangha Food)', 10000.00, 'INR', '2026-08-25', 'Online Payment', 2, 'TXN9876543210', 1),
(4, 4, 'donation', 'Donation Received - Alan Johnson (Peace Stupa)', 5500.00, 'INR', '2026-08-24', 'Online Payment', 2, 'ch_3Nkd9892k1j', 1),
(5, 5, 'prayer_offering', 'Donation Received - Sonam Khandu (Butter Lamps)', 3000.00, 'INR', '2026-08-24', 'Bank Transfer', 1, 'BNK-TXN-4455', 1),
(6, 6, 'donation', 'Donation Received - Ngawang Tenzin (Shedra)', 2100.00, 'INR', '2026-08-24', 'Online Payment', 2, 'TXN5544332211', 1),
(7, NULL, 'donation', 'Corporate Donation - Druk Heritage Trust', 250000.00, 'INR', '2026-08-15', 'Bank Transfer', 1, 'RTGS-TRU-8821', 1),
(8, NULL, 'training_fee', 'Monastic Curriculum Enrollment Fees (Term 2)', 115000.00, 'INR', '2026-08-10', 'Bank Transfer', 1, 'BT-SHEDRA-2026', 1),
(9, NULL, 'prayer_offering', 'Ganachakra Special Puja Offerings', 75500.00, 'INR', '2026-08-18', 'Cash', 3, 'CSH-PUJA-0826', 1),
(10, NULL, 'misc', 'Monastery Dharma Books & Butter Lamp Oil Sales', 52130.00, 'INR', '2026-08-20', 'Cash', 3, 'CSH-MISC-0826', 1)
ON DUPLICATE KEY UPDATE particulars=VALUES(particulars);

-- 12. Expense Categories
INSERT INTO expense_categories (id, name, code, description) VALUES
(1, 'Stupa Construction Materials', 'EXP-CONST', 'Cement, stone, marble, gold leaf, and structural steel for Great Druk Wangyel Stupa'),
(2, 'Monastic Sangha Provisions & Food', 'EXP-FOOD', 'Rice, flour, butter, tea, vegetables and groceries for resident monks'),
(3, 'Utilities & Electricity', 'EXP-UTIL', 'Power, water, high-speed internet and waste management for monastery and shedra'),
(4, 'Staff Salaries & Stipends', 'EXP-SALARY', 'Monthly compensation for teachers, administrative staff and caretaking staff'),
(5, 'Ritual & Puja Items', 'EXP-RITUAL', 'Butter lamp brass, wick, pure saffron, Tibetan incense and prayer flags'),
(6, 'Casual Labor Wages', 'EXP-LABOR', 'Daily wages for stone carvers, stupa masons, carpenters and groundskeepers')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 13. Expenses (Matching Accounts & Finance recent transactions)
INSERT INTO expenses (id, category_id, title, description, amount, currency, expense_date, payee_name, payment_method, bank_account_id, voucher_no, status, submitted_by_user_id, approved_by_user_id, approved_at) VALUES
(1, 1, 'Construction Material Purchase', '100 Bags of High Grade Cement & Granite for Stupa Base', 18500.00, 'INR', '2026-08-25', 'Phuntsho Traders, Gelephu', 'Bank Transfer', 1, 'PV-2026-089', 'paid', 2, 1, '2026-08-25 10:00:00'),
(2, 4, 'Staff Salary - Aug 2026 (Batch 1)', 'Monthly stipend and salaries for resident monastic teachers and admin staff', 65000.00, 'INR', '2026-08-24', 'Foundation Staff & Monastic Faculty', 'Bank Transfer', 1, 'JV-2026-088', 'paid', 3, 1, '2026-08-24 16:30:00'),
(3, 3, 'Electricity Bill - Monastery Complex', 'Monthly Bhutan Power Corporation electricity bill for Shedra and Main Temple', 8750.00, 'INR', '2026-08-23', 'Bhutan Power Corporation', 'Bank Transfer', 1, 'PV-2026-087', 'paid', 2, 1, '2026-08-23 11:20:00'),
(4, 2, 'Monastery Kitchen Rice & Food Supplies', '150 Bags of Himalayan Sona Masoori Rice and Mustard Oil', 32500.00, 'INR', '2026-08-20', 'Karma Food Supply Co.', 'Bank Transfer', 1, 'PV-2026-086', 'paid', 2, 1, '2026-08-20 14:00:00'),
(5, 6, 'Casual Labor Wages - Stupa Stone Carving', 'Wages for 36 artisan workers and masons (15-day period)', 78500.00, 'INR', '2026-08-18', 'Stupa Artisan Guild Workers', 'Cash', 3, 'PV-2026-085', 'paid', 3, 1, '2026-08-18 17:00:00'),
(6, 5, 'Tibetan Incense & Butter Lamp Refills', 'Purified butter lamp ghee and grade A Tibetan sandalwood incense', 33290.00, 'INR', '2026-08-15', 'Dorji Religious Supplies', 'Bank Transfer', 1, 'PV-2026-084', 'paid', 2, 1, '2026-08-15 09:30:00')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 14. Vouchers (Matching Accounts screenshot)
INSERT INTO vouchers (id, voucher_no, voucher_type, voucher_date, total_amount, particulars, status, created_by) VALUES
(1, 'RC-2026-105', 'receipt', '2026-08-25', 25000.00, 'Donation Received - Tashi Phuntsho', 'posted', 1),
(2, 'PV-2026-089', 'payment', '2026-08-25', 18500.00, 'Construction Material Purchase', 'posted', 2),
(3, 'RC-2026-104', 'receipt', '2026-08-24', 10000.00, 'Training Fee - Group of Monks', 'posted', 2),
(4, 'JV-2026-088', 'journal', '2026-08-24', 65000.00, 'Staff Salary - Aug 2026', 'posted', 3),
(5, 'PV-2026-087', 'payment', '2026-08-23', 8750.00, 'Electricity Bill - Monastery', 'posted', 2)
ON DUPLICATE KEY UPDATE voucher_no=VALUES(voucher_no);

-- 15. Store Locations (Matching Inventory screenshot)
INSERT INTO store_locations (id, name, code, description) VALUES
(1, 'Main Store', 'LOC-MAIN', 'Gelephu, Sarpang Dzongkhag Central Store'),
(2, 'Kitchen Store', 'LOC-KTCH', 'Monastery Kitchen & Provision Store'),
(3, 'Construction Store', 'LOC-CNST', 'Stupa Construction Site Depot')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 16. Store Categories
INSERT INTO categories (id, name, slug, description) VALUES
(1, 'Construction Materials', 'construction-materials', 'Cement, timber, stone, paint and hardware for stupa and monastery buildings'),
(2, 'Monastery Supplies', 'monastery-supplies', 'Butter lamps, wicks, meditation cushions, altar cloths and prayer books'),
(3, 'Kitchen & Food Items', 'kitchen-food-items', 'Rice, flour, pulses, spices, tea leaves and cooking oil for Sangha kitchen'),
(4, 'Religious Items', 'religious-items', 'Tibetan incense, saffron, torma ingredients, brocades and ceremonial bells'),
(5, 'Stationery & Office', 'stationery-office', 'Textbooks, notebooks, registers, printer cartridges and administrative supplies')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 17. Units
INSERT INTO units (id, name, symbol) VALUES
(1, 'Pieces', 'Pcs'),
(2, 'Kilograms', 'Kg'),
(3, 'Bags (50Kg)', 'Bags'),
(4, 'Boxes', 'Box'),
(5, 'Liters', 'Ltr'),
(6, 'Sets', 'Set')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 18. Suppliers
INSERT INTO suppliers (id, name, contact_person, phone, email, address, city, country, tax_number) VALUES
(1, 'Phuntsho Traders', 'Phuntsho Wangdi', '+975 17 66 5544', 'sales@phuntshotraders.bt', 'Industrial Area, Gelephu', 'Gelephu', 'Bhutan', 'PT-BTN-992'),
(2, 'Dorji Supply Co.', 'Dorji Tshering', '+975 17 22 3344', 'dorji.supplies@btnet.bt', 'Main Bazaar, Sarpang', 'Sarpang', 'Bhutan', 'DS-SAR-114'),
(3, 'Karma Food Supply', 'Karma Jamtsho', '+975 17 88 7766', 'orders@karmafood.bt', 'Wholesale Market, Phuentsholing', 'Phuentsholing', 'Bhutan', 'KF-PHU-772')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 19. Store Items (Matching image 2 & image 3 exactly)
INSERT INTO store_items (id, item_code, item_name, category_id, unit_id, current_stock, min_stock, unit_cost, location_id, description, status) VALUES
(1, 'ITM-00125', 'Butter Lamp (Small)', 2, 1, 18, 50, 45.00, 1, 'Traditional brass butter lamp for altar offering', 'low_stock'),
(2, 'ITM-00098', 'Torma Flour', 3, 2, 12, 25, 120.00, 2, 'Special consecrated roasted barley flour for torma sculptures', 'low_stock'),
(3, 'ITM-00077', 'Incense (Tibetan)', 4, 1, 8, 30, 25.00, 1, 'Handmade Tibetan herbal temple incense sticks', 'low_stock'),
(4, 'ITM-00045', 'Maroon Robe (Large)', 2, 6, 5, 15, 850.00, 1, 'Full monastic robe set for ordained Gelong monks', 'low_stock'),
(5, 'ITM-00010', 'Cement (50 Kg)', 1, 3, 120, 40, 320.00, 3, 'Grade 53 Portland Pozzolana Cement for Stupa foundation', 'in_stock'),
(6, 'ITM-00012', 'Rice (25 Kg)', 3, 3, 85, 30, 1500.00, 2, 'Premium Sona Masoori Rice for Monastery Kitchen', 'in_stock'),
(7, 'ITM-00088', 'Pure Ghee for Altar (15 Kg Tin)', 3, 4, 22, 10, 4200.00, 2, 'Unadulterated clarified butter for 108 eternal lamps', 'in_stock'),
(8, 'ITM-00090', 'Granite Stone Blocks (Carved)', 1, 1, 45, 15, 1200.00, 3, 'Hand-carved Bhutanese granite blocks for Stupa spire', 'in_stock'),
(9, 'ITM-00033', 'Meditation Cushion (Zafu)', 2, 1, 60, 20, 350.00, 1, 'Buckwheat filled traditional meditation round cushion', 'in_stock'),
(10, 'ITM-00099', 'Gold Leaf Sheets (Pack of 100)', 4, 4, 0, 5, 6500.00, 1, '24K Pure Gold leaf for Stupa pinnacle gilding', 'out_of_stock')
ON DUPLICATE KEY UPDATE item_code=VALUES(item_code);

-- 20. Stock Transactions
INSERT INTO stock_txn (id, txn_no, item_id, txn_type, quantity, unit_cost, total_value, previous_stock, new_stock, supplier_id, from_location_id, to_location_id, reference_doc, purpose_or_remarks, txn_date, created_by_user_id) VALUES
(1, 'TXN-STK-2026-001', 5, 'stock_in', 100, 320.00, 32000.00, 20, 120, 1, NULL, 3, 'GRN-2026-081', 'Received from Phuntsho Traders for Stupa project', '2026-08-25', 1),
(2, 'TXN-STK-2026-002', 1, 'stock_in', 200, 45.00, 9000.00, 18, 218, 2, NULL, 1, 'GRN-2026-082', 'Altar lamp replenishment from Dorji Supply Co.', '2026-08-24', 1),
(3, 'TXN-STK-2026-003', 6, 'stock_in', 150, 1500.00, 22500.00, 35, 185, 3, NULL, 2, 'GRN-2026-083', 'Monthly rice provision from Karma Food Supply', '2026-08-24', 1),
(4, 'TXN-STK-2026-004', 1, 'stock_out', 200, 45.00, 9000.00, 218, 18, NULL, 1, NULL, 'REQ-2026-044', 'Issued for Grand Ganachakra 1000-lamp prayer', '2026-08-25', 1)
ON DUPLICATE KEY UPDATE txn_no=VALUES(txn_no);

-- 21. Courses (Matching image 2 LMS Overview)
INSERT INTO courses (id, course_code, title, slug, level, description, duration_months, total_credits, instructor_name, fee_amount, currency, is_active, thumbnail_url, syllabus) VALUES
(1, 'CRS-101', 'Buddhist Philosophy - Level 1', 'buddhist-philosophy-level-1', 'Basic', 'Introduction to Abhidharma, Four Noble Truths, Eightfold Path, and the foundations of Buddhist epistemological reasoning.', 6, 12, 'Khenpo Tashi Dorji', 0.00, 'INR', 1, 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400', '1. Introduction to Abhidharma\n2. The Twelve Links of Dependent Origination\n3. Pramana: Valid Cognition\n4. Madhyamaka Essentials'),
(2, 'CRS-102', 'Meditation & Mindfulness', 'meditation-mindfulness', 'Basic', 'Core practices of Shamatha (calm abiding) and Vipassana (insight meditation), breathing techniques, and posture mastery.', 3, 8, 'Lopen Karma Samten', 0.00, 'INR', 1, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', '1. Shamatha with Object\n2. Shamatha without Object\n3. Vipassana Analysis\n4. Integration in Daily Life'),
(3, 'CRS-103', 'Tibetan Language Basic', 'tibetan-language-basic', 'Basic', 'Study of Uchen script, classical Tibetan grammar, Dharma terminology, and liturgical reading of sacred texts.', 6, 12, 'Lopen Sonam Rigzin', 0.00, 'INR', 1, 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400', '1. 30 Consonants & 4 Vowels\n2. Suffixes & Prefixes\n3. Sacred Vocabulary\n4. Chanting Transliteration'),
(4, 'CRS-104', 'Buddha Dharma Studies', 'buddha-dharma-studies', 'Intermediate', 'Comprehensive study of the Bodhisattvacharyavatara by Shantideva, Bodhicitta cultivation, and the Six Paramitas.', 6, 14, 'Khenpo Jigme Wangdi', 0.00, 'INR', 1, 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400', '1. Awakening the Mind of Enlightenment\n2. Generosity and Discipline\n3. Patience and Diligence\n4. Wisdom of Non-Duality')
ON DUPLICATE KEY UPDATE course_code=VALUES(course_code);

-- 22. Batches
INSERT INTO batches (id, course_id, batch_name, batch_code, start_date, end_date, capacity, status) VALUES
(1, 1, 'Philosophy 2026 Batch A', 'PHIL-2026-A', '2026-03-01', '2026-08-31', 50, 'ongoing'),
(2, 2, 'Meditation Summer 2026', 'MED-2026-S', '2026-06-01', '2026-08-31', 40, 'ongoing'),
(3, 3, 'Tibetan Language Batch 1', 'TIB-2026-1', '2026-02-01', '2026-07-31', 35, 'ongoing'),
(4, 4, 'Dharma Studies Completed Group', 'DHM-2026-C', '2026-01-01', '2026-06-30', 65, 'completed')
ON DUPLICATE KEY UPDATE batch_code=VALUES(batch_code);

-- 23. Students & Monks
INSERT INTO students_monks (id, user_id, monastic_name, secular_name, roll_number, sangha_id, gender, dob, nationality, joining_date, monk_status, guardian_name, guardian_phone, address, emergency_contact, status) VALUES
(1, 6, 'Tenzin Norbu', 'Norbu Wangchuk', 'MNK-2026-001', 'SANGHA-GLP-101', 'male', '2004-05-12', 'Bhutanese', '2024-01-10', 'novice', 'Karma Wangchuk (Father)', '+975 17443322', 'Sarpang Dzongkhag, Bhutan', '+975 17990011', 'active'),
(2, NULL, 'Pema Gyaltsen', 'Gyaltsen Dorji', 'MNK-2026-002', 'SANGHA-GLP-102', 'male', '2002-08-20', 'Bhutanese', '2023-02-15', 'gelong', 'Sonam Dorji', '+975 17221144', 'Mongar, Bhutan', '+975 17887766', 'active'),
(3, NULL, 'Ngawang Choden', 'Choden Lhamo', 'STU-2026-003', 'SANGHA-GLP-103', 'female', '2000-11-04', 'Bhutanese', '2025-03-01', 'lay_student', 'Sangay Lhamo', '+975 17334411', 'Gelephu Town', '+975 17556677', 'active'),
(4, NULL, 'Sangay Thinley', 'Thinley Penjor', 'MNK-2026-004', 'SANGHA-GLP-104', 'male', '1998-03-15', 'Bhutanese', '2022-01-10', 'khenpo', 'Self', '+975 17665511', 'Punakha, Bhutan', '+975 17665511', 'active')
ON DUPLICATE KEY UPDATE roll_number=VALUES(roll_number);

-- 24. Enrollments (Matching student counts in LMS Overview: 48, 37, 29, 62)
INSERT INTO enrollments (id, student_id, course_id, batch_id, enrollment_date, progress_percent, attendance_percent, grade, status, completed_at, certificate_issued) VALUES
(1, 1, 1, 1, '2026-03-01', 75, 96, 'A', 'in_progress', NULL, 0),
(2, 1, 2, 2, '2026-06-01', 80, 92, 'A+', 'in_progress', NULL, 0),
(3, 2, 1, 1, '2026-03-01', 85, 98, 'A+', 'in_progress', NULL, 0),
(4, 2, 4, 4, '2026-01-01', 100, 98, 'Distinction', 'completed', '2026-06-30 12:00:00', 1),
(5, 3, 3, 3, '2026-02-01', 65, 88, 'B+', 'in_progress', NULL, 0),
(6, 4, 4, 4, '2026-01-01', 100, 100, 'Distinction', 'completed', '2026-06-30 12:00:00', 1)
ON DUPLICATE KEY UPDATE id=VALUES(id);

-- 25. Certificates
INSERT INTO certificates (id, certificate_number, enrollment_id, student_id, course_id, issue_date, grade, signed_by, pdf_url, status) VALUES
(1, 'CERT-DPL-2026-001', 4, 2, 4, '2026-07-05', 'Distinction', 'Khenpo Tashi Dorji, Abbot & Principal', NULL, 'VALID'),
(2, 'CERT-DPL-2026-002', 6, 4, 4, '2026-07-05', 'Distinction with Honors', 'Khenpo Tashi Dorji, Abbot & Principal', NULL, 'VALID')
ON DUPLICATE KEY UPDATE certificate_number=VALUES(certificate_number);

-- 26. Employees (Matching HR summary: 24 total, 18 active)
INSERT INTO employees (id, user_id, employee_code, full_name, email, phone, designation, department, employment_type, basic_salary, joining_date, status, bank_account_no, bank_name) VALUES
(1, 1, 'EMP-001', 'Khenpo Tashi Dorji', 'admin@drodulphendeyling.org', '+975 17556559', 'Abbot & Executive Director', 'Monastic Academic', 'Monastic Sangha', 45000.00, '2020-01-01', 'active', '123456789001', 'Bank of Bhutan'),
(2, 2, 'EMP-002', 'Sonam Tobgay', 'accountant@drodulphendeyling.org', '+975 17112233', 'Senior Chief Accountant', 'Admin & Finance', 'Full-Time', 35000.00, '2021-06-01', 'active', '123456789002', 'Bank of Bhutan'),
(3, 3, 'EMP-003', 'Dechen Wangmo', 'hr@drodulphendeyling.org', '+975 17445566', 'HR & Administrative Manager', 'Admin & Finance', 'Full-Time', 32000.00, '2022-03-15', 'active', '123456789003', 'Bank of Bhutan'),
(4, 4, 'EMP-004', 'Karma Choden', 'staff@drodulphendeyling.org', '+975 17778899', 'Donation & CRM Coordinator', 'Admin & Finance', 'Full-Time', 25000.00, '2023-01-10', 'active', '123456789004', 'Bank of Bhutan'),
(5, NULL, 'EMP-005', 'Lopen Karma Samten', 'karma.samten@monastery.bt', '+975 17661122', 'Senior Dharma Lecturer', 'Monastic Academic', 'Monastic Sangha', 28000.00, '2021-01-15', 'active', '123456789005', 'Bank of Bhutan'),
(6, NULL, 'EMP-006', 'Lopen Sonam Rigzin', 'sonam.rigzin@monastery.bt', '+975 17332211', 'Tibetan Language Instructor', 'Monastic Academic', 'Monastic Sangha', 26000.00, '2022-02-01', 'active', '123456789006', 'Bank of Bhutan'),
(7, NULL, 'EMP-007', 'Ugyen Tshering', 'ugyen.tshering@drodulphendeyling.org', '+975 17883344', 'Stupa Project Site Supervisor', 'Stupa Maintenance', 'Full-Time', 30000.00, '2023-04-01', 'active', '123456789007', 'Bank of Bhutan'),
(8, NULL, 'EMP-008', 'Dawa Penjor', 'dawa.penjor@drodulphendeyling.org', '+975 17554433', 'Head Caretaker & Kitchen Head', 'Kitchen & Caretaking', 'Full-Time', 22000.00, '2022-08-01', 'active', '123456789008', 'Bank of Bhutan')
ON DUPLICATE KEY UPDATE employee_code=VALUES(employee_code);

-- 27. Casual Labor (Matching HR summary: 36 casual workers)
INSERT INTO casual_labor (id, payroll_run_id, worker_name, work_type, days_worked, daily_rate, total_amount, work_date_from, work_date_to, payment_status, supervisor_id, notes) VALUES
(1, NULL, 'Dorji Gyeltshen & Team (12 masons)', 'stupa_masonry', 24.0, 850.00, 20400.00, '2026-08-01', '2026-08-25', 'paid', 7, 'Stupa dome brickwork and reinforced concrete column construction'),
(2, NULL, 'Kinley Wangdi & Team (10 carvers)', 'stone_carving', 22.0, 950.00, 20900.00, '2026-08-01', '2026-08-25', 'paid', 7, 'Intricate traditional Bhutanese lotus and dragon relief stone carvings'),
(3, NULL, 'Sangay Rinchen & Team (8 carpenters)', 'carpentry', 20.0, 800.00, 16000.00, '2026-08-01', '2026-08-25', 'paid', 7, 'Temple pillar framing and wooden roof timber installation'),
(4, NULL, 'Chimi Dorji & Team (6 workers)', 'landscaping', 18.0, 650.00, 11700.00, '2026-08-01', '2026-08-25', 'paid', 7, 'Stupa circumambulation pathway paving and garden landscaping')
ON DUPLICATE KEY UPDATE id=VALUES(id);

-- 28. Payroll Runs (Matching Payroll This Month: ₹ 1,78,600)
INSERT INTO payroll_runs (id, run_code, month, year, total_employees, total_casual_workers, total_basic, total_allowances, total_deductions, total_net_payroll, total_casual_labor_cost, grand_total, status, processed_by, processed_at, notes) VALUES
(1, 'PAY-2026-08', 8, 2026, 8, 36, 128000.00, 14000.00, 8400.00, 109600.00, 69000.00, 178600.00, 'processed', 2, '2026-08-24 18:00:00', 'Consolidated staff salary and stupa construction artisan wages for August 2026')
ON DUPLICATE KEY UPDATE run_code=VALUES(run_code);

-- 29. Projects & Construction
INSERT INTO projects (id, project_code, title, slug, category, description, estimated_budget, actual_expenditure, currency, start_date, target_completion_date, status, completion_percent, location, manager_name, thumbnail_url) VALUES
(1, 'PRJ-STUPA-01', 'Great Druk Wangyel Peace Stupa', 'great-druk-wangyel-peace-stupa', 'Stupa Construction', 'Construction of the 108-foot Great Druk Wangyel Peace Stupa with 4 auspicious gates, inner prayer shrine, relic chamber, and surrounding 108 prayer wheels.', 15000000.00, 6850000.00, 'INR', '2025-01-01', '2027-12-31', 'in_progress', 48, 'Gelephu, Sarpang Dzongkhag, Bhutan', 'Ugyen Tshering', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'),
(2, 'PRJ-SHEDRA-02', 'Shedra Monastic University Library & Hall', 'shedra-monastic-library', 'Shedra Expansion', 'Two-story Tibetan classical library housing 5,000+ sacred Kangyur & Tengyur woodblock prints and digital cataloging workstations.', 5000000.00, 2100000.00, 'INR', '2026-01-15', '2026-11-30', 'in_progress', 60, 'Monastery Campus, Gelephu', 'Khenpo Tashi Dorji', 'https://images.unsplash.com/photo-1609137144822-446757b4f535?w=800'),
(3, 'PRJ-EVENT-03', 'Grand Annual Ganachakra Puja & World Peace Prayer', 'grand-annual-ganachakra-puja-2026', 'Dharma Event', '5-day grand congregation of 500+ monks and international devotees performing Guru Rinpoche Tsok and longevity pujas.', 800000.00, 650000.00, 'INR', '2026-08-25', '2026-08-30', 'in_progress', 85, 'Drodul Phendey Ling Main Shrine Hall', 'Karma Choden', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800')
ON DUPLICATE KEY UPDATE project_code=VALUES(project_code);

-- 30. News & Events (Matching image 2 upcoming events: 28 Aug Ganachakra, 05 Sep New Moon, 12 Sep Teaching, 20 Sep Buddha Dharma)
INSERT INTO news_events (id, title, slug, category, summary, content, event_date, event_time, location, event_type, banner_image, is_published, views_count) VALUES
(1, 'Ganachakra Prayer Ceremony', 'ganachakra-prayer-ceremony-2026', 'Ganachakra', 'Annual Guru Rinpoche sacred feast gathering and blessing for global peace and harmony in Gelephu.', 'Join hundreds of monks and devotees for the auspicious Ganachakra feast offering. Offerings of butter lamps, flowers, and holy torma will be dedicated to all beings.', '2026-08-28', '08:00 AM - 05:00 PM', 'Gelephu, Sarpang, Bhutan', 'In-Person', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', 1, 342),
(2, 'New Moon Prayer', 'new-moon-prayer-sep-2026', 'Puja', 'Recitation of the Prajnaparamita Sutra and Green Tara obstacle clearing prayers.', 'On this sacred New Moon day, the monastic Sangha will recite the Heart Sutra and 21 Praises to Tara for the health and prosperity of all sponsors.', '2026-09-05', '06:00 AM - 12:00 PM', 'Drodul Phendey Ling Main Hall', 'In-Person', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', 1, 189),
(3, 'Teaching by Khenpo Rinpoche', 'teaching-by-khenpo-rinpoche-sep-2026', 'Teaching', 'Special discourse on Shantideva\'s Guide to the Bodhisattva Way of Life: Cultivating Universal Compassion.', 'Khenpo Rinpoche will expound on Chapter 3 of the Bodhisattvacharyavatara, detailing the practice of taking and giving (Tonglen) for peace.', '2026-09-12', '02:00 PM - 04:30 PM', 'Shedra Assembly Hall', 'Hybrid', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', 1, 512),
(4, 'Buddha Dharma Class (Online)', 'buddha-dharma-class-online-sep-2026', 'Teaching', 'Interactive digital webinar on Tibetan Buddhist meditation fundamentals and mindful daily living.', 'Open to international students and devotees worldwide. Q&A session with English translation provided.', '2026-09-20', '06:30 PM - 08:00 PM (BST)', 'Online (Zoom Webinar)', 'Online Zoom', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', 1, 620)
ON DUPLICATE KEY UPDATE slug=VALUES(slug);

-- 31. Contacts (CRM)
INSERT INTO contacts (id, contact_type, full_name, organization_name, email, phone, city, country, tags, lifetime_value, last_contact_date) VALUES
(1, 'donor', 'Tashi Phuntsho', 'Individual Devotee', 'tashi.phuntsho@email.com', '+975 17 55 8899', 'Gelephu', 'Bhutan', 'Major Donor, Stupa Patron', 125000.00, '2026-08-25'),
(2, 'donor', 'Maria Wangmo', 'Individual Devotee', 'maria.wangmo@email.com', '+975 17 88 1234', 'Thimphu', 'Bhutan', 'Regular Donor, Food Sponsor', 45000.00, '2026-08-25'),
(3, 'donor', 'Alan Johnson', 'San Francisco Sangha', 'alan.johnson@email.com', '+1 415 889 9000', 'San Francisco', 'United States', 'International Donor, VIP', 85500.00, '2026-08-24'),
(4, 'partner', 'Druk Heritage Cultural Trust', 'Druk Heritage Trust', 'info@drukheritage.org', '+975 2 334455', 'Thimphu', 'Bhutan', 'Institutional Partner', 500000.00, '2026-08-15'),
(5, 'vendor', 'Phuntsho Wangdi', 'Phuntsho Traders', 'sales@phuntshotraders.bt', '+975 17 66 5544', 'Gelephu', 'Bhutan', 'Cement & Hardware Vendor', 0.00, '2026-08-25')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 32. Contact Communications
INSERT INTO contact_communications (id, contact_id, comm_type, subject, notes, scheduled_followup_date, followup_status, created_by) VALUES
(1, 1, 'phone', 'Thank You Call for Peace Stupa Gift', 'Called donor Tashi Phuntsho to express Abbot\'s gratitude for ₹25,000 donation. Invited to consecration puja.', '2026-09-10', 'done', 1),
(2, 3, 'email', 'Receipt & Stupa Blueprint Progress Report', 'Sent tax receipt RC-2026-102 and high-resolution photo of newly carved stupa lion pedestal.', '2026-09-15', 'pending', 4)
ON DUPLICATE KEY UPDATE id=VALUES(id);

-- 33. Notices
INSERT INTO notices (id, title, slug, content, target_audience, is_pinned, is_published, published_date) VALUES
(1, 'Ganachakra Puja Preparation Guidelines', 'ganachakra-puja-preparation', 'All monk residents and volunteers are requested to assemble in the main hall by 7:00 AM on August 28 for altar arrangement.', 'all', 1, 1, '2026-08-25'),
(2, 'Shedra Semester Exam Schedule Announcement', 'shedra-semester-exam-schedule', 'Written examinations for Buddhist Philosophy Level 1 will commence on September 25. Detailed timetable posted on notice boards.', 'monks', 1, 1, '2026-08-24'),
(3, 'Online 80G Tax Exemption Certificates Ready for Download', 'tax-exemption-certificates-ready', 'Donors can now log in to the Donor Portal and instantly download financial year 2026-2027 PDF tax receipts.', 'donors', 0, 1, '2026-08-20')
ON DUPLICATE KEY UPDATE slug=VALUES(slug);

-- 34. Prayer Requests
INSERT INTO prayer_requests (id, devotee_name, devotee_email, devotee_phone, country, prayer_type, intention_text, butter_lamps_count, dedication_names, offering_amount, offering_currency, payment_status, status) VALUES
(1, 'Karma Choden', 'karma.devotee@gmail.com', '+975 17882233', 'Bhutan', 'Health & Long Life', 'Prayers for the speedy recovery and longevity of grandmother Khandu Wangmo.', 108, 'Khandu Wangmo, Sonam Dorji', 2500.00, 'INR', 'paid', 'dedicated'),
(2, 'David Miller', 'david.miller@zenpacific.com', '+1 206 555 0192', 'United States', 'World Peace', 'Dedication for global peace, relief from natural calamities, and blessings for the Bhutanese peace stupa.', 108, 'Miller Family & all sentient beings', 5000.00, 'INR', 'paid', 'pending')
ON DUPLICATE KEY UPDATE id=VALUES(id);

-- 35. Gallery Items (Photos, Video Uploads & YouTube / Vimeo Video URLs)
INSERT INTO gallery_items (id, title, category, media_type, media_url, thumbnail_url, caption, display_order, is_featured) VALUES
(1, 'Great Druk Wangyel Peace Stupa in Morning Light', 'Stupa Construction', 'image', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400', 'The magnificent stupa rising against the serene foothills of Gelephu, Bhutan.', 1, 1),
(2, 'Monks Chanting in Shedra Assembly Hall', 'Shedra Life', 'image', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400', 'Resident monastic students reciting sacred Prajnaparamita texts.', 2, 1),
(3, 'Consecration Ceremony & 1000 Butter Lamps Video', 'Puja & Ceremonies', 'video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', 'Official video footage of the 1000 Butter Lamps world peace dedication ritual.', 3, 1),
(4, 'Traditional Stone Carving Artisans at Work', 'Monastic Arts', 'image', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400', 'Master craftsmen carving auspicious Buddhist motifs for the Stupa base.', 4, 1),
(5, 'Morning Puja & Dharma Talk by Khenpo Tashi Dorji', 'Puja & Ceremonies', 'video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=400', 'Watch the profound morning discourse on compassion and Bodhicitta.', 5, 1)
ON DUPLICATE KEY UPDATE id=VALUES(id);

-- 36. Blog Posts
INSERT INTO blog_posts (id, title, slug, summary, content, cover_image, author_id, author_name, status, tags, views_count, published_at) VALUES
(1, 'The Spiritual Significance of the Great Druk Wangyel Peace Stupa', 'spiritual-significance-peace-stupa', 'Explore why stupas are regarded as the living mind of the Buddha and how this monument radiates blessings for global peace.', '<p>In Buddhist tradition, a stupa (Chorten in Dzongkha) is not merely an architectural monument; it represents the enlightened mind of the Buddha. Building a stupa in Gelephu, at the peaceful crossroads of southern Bhutan, serves as a beacon of harmony, pacifying conflicts, natural disasters, and negative energies across the world.</p><h3>The Eight Auspicious Symbols</h3><p>Every tier and spire of the Great Druk Wangyel Peace Stupa embodies deep philosophical teachings—from the four immeasurables at the base to the golden crescent moon and sun at the summit representing wisdom and compassion.</p><p>We invite devotees and well-wishers worldwide to participate in this merit-yielding endeavor.</p>', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', 1, 'Khenpo Tashi Dorji', 'published', 'Peace Stupa, Buddhism, Philosophy, Gelephu', 245, '2026-08-20 10:00:00'),
(2, 'Daily Life in the Shedra: Nurturing Compassion & Wisdom', 'daily-life-shedra-monastic-university', 'A glimpse into the daily schedule, philosophical debates, and meditation practices of our resident monk scholars.', '<p>The sound of the sacred conch echoes across the foothills of Gelephu at 5:00 AM, marking the beginning of another day of study and spiritual practice at Drodul Phendey Ling Shedra Monastic University.</p><p>Our students undergo an intensive 9-year curriculum studying Madhyamaka (the Middle Way), Pramana (Buddhist Logic), and Abhidharma. In the evening, the courtyard comes alive with traditional dialectical debate, sharpening intellect and refining understanding.</p><p>Through the support of our generous donors, these young monks are provided with books, food, and accommodation as they dedicate their lives to the service of all beings.</p>', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', 1, 'Lopen Karma Samten', 'published', 'Shedra, Monastic Life, Education, Dharma', 189, '2026-08-22 14:30:00'),
(3, 'The Merit of 108 Butter Lamp Offerings for World Peace', 'merit-butter-lamp-offerings', 'How the light of butter lamps dispels the darkness of ignorance and generates merit for all sentient beings.', '<p>Lighting butter lamps is one of the most powerful practices of generosity and dedication in Vajrayana Buddhism. The flame symbolizes the light of wisdom dispelling the darkness of ignorance and confusion.</p><p>Every evening, 108 butter lamps are offered in front of the main shrine at Drodul Phendey Ling, dedicating the positive energy toward world peace, health, and liberation from suffering for all families who request prayers through our foundation desk.</p>', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800', 1, 'Dechen Wangmo', 'published', 'Butter Lamps, Puja, Prayers, Merit', 312, '2026-08-25 09:15:00')
ON DUPLICATE KEY UPDATE slug=VALUES(slug);

-- 37. Learning & Dharma Video Materials (Public Library)
INSERT INTO learning_materials (id, title, description, category, media_type, media_url, thumbnail_url, instructor, duration, display_order, is_published, views_count) VALUES
(1, 'Introduction to the Four Noble Truths & Eightfold Path', 'A foundational discourse on the core tenets of Buddha Dharma, understanding suffering and the path to ultimate liberation.', 'Buddhist Philosophy', 'video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', 'Khenpo Tashi Dorji', '42 mins', 1, 1, 1420),
(2, 'Shamatha Meditation: Cultivating Calm Abiding & Focus', 'Practical step-by-step guidance on posture, breath awareness, and pacifying mental turbulence for daily mindfulness practice.', 'Meditation & Retreats', 'video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800', 'Lopen Karma Samten', '35 mins', 2, 1, 980),
(3, 'Bodhicitta: The Awakened Mind of Universal Compassion', 'Exploring Shantideva\'s Way of the Bodhisattva and generating unconditional love for all sentient beings.', 'Dharma Teachings', 'video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', 'Khenpo Tashi Dorji', '55 mins', 3, 1, 1150),
(4, 'Sacred Bhutanese Monastic Chanting & Mantra Recitation', 'An immersive audio-visual guide to sacred Chod, Tara, and Chenrezig chanting melodies preserved in Bhutanese monasteries.', 'Monastic Arts', 'video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800', 'Sangha Master Choten', '28 mins', 4, 1, 620)
ON DUPLICATE KEY UPDATE id=VALUES(id);

-- 38. System Settings
INSERT INTO system_settings (id, setting_key, setting_value, description, group_name) VALUES
(1, 'org_name', 'Drodul Phendey Ling Foundation', 'Official registered name of the foundation', 'general'),
(2, 'org_tagline', 'Building Peace. Empowering Lives.', 'Official foundation motto', 'general'),
(3, 'org_address', 'Gelephu, Sarpang Dzongkhag, Bhutan', 'Physical headquarters address', 'general'),
(4, 'org_phone', '+975 17556559', 'Primary contact phone number', 'general'),
(5, 'org_email', 'contact@drodulphendeyling.org', 'Public contact email address', 'general'),
(6, 'org_tax_number', 'DPL/TAX-EXEMPT/BTN/2026/80G-092', 'Official 80G tax exemption approval number', 'finance'),
(7, 'default_currency', 'INR', 'Default system currency (INR / BTN 1:1 parity)', 'finance'),
(8, 'payment_razorpay_enabled', '1', 'Enable Razorpay sandbox / test gateway', 'payments'),
(9, 'payment_stripe_enabled', '1', 'Enable Stripe sandbox / test gateway', 'payments'),
(10, 'sms_notifications_enabled', '0', 'Enable SMS alerts for receipts and notices', 'notifications')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

SET FOREIGN_KEY_CHECKS = 1;

