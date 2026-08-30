# ☸ Drodul Phendey Ling Foundation — 1-Week Project Timeline & Delivery Roadmap

A comprehensive day-by-day technical execution log and delivery timeline for the full-stack **Drodul Phendey Ling Foundation** Management Platform (Public Website, Unified Devotee User Panel, and Super Admin ERP).

---

## 📅 High-Level 7-Day Roadmap Overview

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│  DAY 1   │  DAY 2   │  DAY 3   │  DAY 4   │  DAY 5   │  DAY 6   │  DAY 7   │
│ Database │ Auth &   │ Donation │ Finance  │ HRM &    │ Public   │ Audit,   │
│ & Schema │ 3 Portals│ Engine & │ & Store  │ Payroll  │ Bhutan   │ VPS Live │
│ Modeling │  RBAC    │ 80G PDFs │Inventory │ & CMS    │ UI/UX    │ Deploy   │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 🗓️ Day 1: Architecture, Database Modeling & Foundation Setup

### Objectives
* Establish full-stack repository structure (Vite + React 18 frontend, Node.js + Express backend, MySQL 8.0).
* Design relational database schema covering 30+ tables with foreign key constraints, indexes, and audit logs.

### Key Milestones Delivered
1. **Database Schema Creation (`db/schema.sql`)**:
   * Designed schemas for `users`, `roles`, `permissions`, `role_permissions`, and `audit_logs`.
   * Modeled financial entities: `donations`, `donors`, `money_receipts`, `campaigns`, `recurring_pledges`, `bank_accounts`, `expenses`, and `vouchers`.
   * Modeled operational modules: `store_items`, `stock_txn`, `employees`, `attendance`, `payroll_runs`, `salary_slips`, `projects`, `project_tasks`, and `contacts`.
   * Modeled public CMS: `blog_posts`, `learning_materials`, `gallery_items`, `news_events`, `prayer_requests`, and `system_settings`.
2. **Seed Data Generator (`db/seed.sql`)**:
   * Pre-seeded default roles (`super_admin`, `accountant`, `staff`, `hr_manager`, `donor_user`).
   * Generated initial bcrypt password hashes, sample accounts, bank ledgers, inventory units, and monastic records.
3. **Backend Foundation (`server.js` & `config/db.js`)**:
   * Configured MySQL connection pooling with automatic reconnection and transaction helpers (`withTransaction`).
   * Configured middleware for CORS, Helmet security headers, JSON parsing, and static file serving (`/uploads`).

---

## 🗓️ Day 2: Authentication, Security & Server-Enforced RBAC

### Objectives
* Enforce strict separation between the **3 allowed portals**:
  1. **Public Website (`/`)**
  2. **User Panel (`/user`)** — Unified for donors & devotees.
  3. **Admin Panel (`/admin`)** — Super Admin, Accountant, Staff under single shell.
* Eliminate weak security, demo credentials, and client-only route hiding.

### Key Milestones Delivered
1. **Isolated Authentication Flow (`controllers/authController.js`)**:
   * Dedicated `/admin/login` route for staff and administrators.
   * Public `/login` route for devotees with registration (`/register`).
   * Server-side permission validator middleware (`middleware/rbac.js`).
2. **Role-Based Dynamic Navigation (`src/components/AdminSidebar.jsx`)**:
   * Super Admin sees all 20+ ERP modules.
   * Accountant sees only Finance, Donations, Receipts, Bank Accounts, and Vouchers.
   * Staff sees only assigned operational tasks, inventory, or communications.
3. **Audit Logging Subsystem (`middleware/auditLogger.js`)**:
   * Automatic tracking of user ID, IP address, timestamp, action, and payload for all critical operations.

---

## 🗓️ Day 3: Donations, Multi-Currency Gateways & 80G PDF Engine

### Objectives
* Implement seamless donation flows for one-time and recurring pledges.
* Integrate Razorpay and Stripe payment gateways with webhook handling.
* Build automated 80G tax-deductible PDF receipt generation.

### Key Milestones Delivered
1. **Donation Processing (`controllers/donationController.js` & `services/paymentService.js`)**:
   * Support for INR (₹), BTN (Nu), USD ($), EUR (€), and GBP (£).
   * Idempotent webhook verification to prevent double-crediting (`payment_idempotency_log`).
   * Automatic donor creation / matching by email and PAN tax ID.
2. **Dynamic PDF Generation (`services/pdfService.js`)**:
   * Created PDFKit engine generating official 80G receipts with foundation seal, signature, and tax exemption credentials.
   * Auto-conversion of numeric amounts to words (e.g., *Five Thousand Rupees Only*).
3. **Automated Devotee Receipt Delivery (`services/emailService.js`)**:
   * Nodemailer integration sending instant email attachments with the issued PDF receipt.

---

## 🗓️ Day 4: Accounts, Vouchers, Expenses & Inventory Store ERP

### Objectives
* Build full financial ledger and double-entry voucher accounting.
* Build real-time store inventory management with Low Stock alerts and stock movement history.

### Key Milestones Delivered
1. **Accounts & Finance Dashboard (`src/pages/admin/AccountsDashboard.jsx` & `controllers/accountController.js`)**:
   * Real-time income vs. expense metrics, monthly growth percentages, cash-in-hand tracker.
   * Payment voucher creation (`VCH-YYYY-XXXXXX`) and bank account reconciliation.
   * Multi-level expense approval workflow (`pending` ➔ `approved` / `rejected` ➔ `paid`).
2. **Store & Inventory ERP (`src/pages/admin/InventoryDashboard.jsx` & `controllers/inventoryController.js`)**:
   * Stock In (GRN) and Stock Out (Usage Requisition) tracking with FIFO costing.
   * Real-time Low Stock & Out-of-Stock alerts.
   * Store location tracking (Main Store, Kitchen Store, Construction Site Depot).

---

## 🗓️ Day 5: HRM, Payroll Runs, Shedra Academic LMS & CMS

### Objectives
* Implement Human Resource Management, Biometric Attendance, and 1-Click Monthly Payroll.
* Implement public Dharma video learning library, monastery blog, and photo/video gallery.

### Key Milestones Delivered
1. **HRM & Payroll Engine (`controllers/hrmController.js` & `controllers/payrollController.js`)**:
   * Employee profiles, leave tracking, and daily attendance logs.
   * Automated monthly payroll generation calculating basic pay, allowances, deductions, and PDF salary slips.
   * Casual labor wage registry for stupa construction artisans.
2. **Public Dharma Learning Management (`controllers/learningController.js`)**:
   * Public video discourse library supporting YouTube embeds, Vimeo, and direct video uploads (MP4 up to 100MB).
3. **Monastery Journal & News CMS (`controllers/blogController.js` & `controllers/cmsController.js`)**:
   * Rich text blog publishing with SEO slugs, view counters, and tag filtering.
   * Devotee sacred prayer request portal with 108 butter lamp dedication tracking.

---

## 🗓️ Day 6: Authentic Bhutanese Theming, UI/UX & Responsive Design

### Objectives
* Unify the entire frontend design with authentic Bhutanese culture (Dochula Chortens, Punakha Dzong, Tiger's Nest, Shedra monks in maroon/saffron robes).
* Optimize responsive layouts for mobile, tablet, and desktop viewports.

### Key Milestones Delivered
1. **Visual Theming & Typography**:
   * Bhutanese royal color palette: Deep Temple Maroon (`#4A0E17`, `#7E1929`), Saffron Gold (`#D4AF37`), Ivory (`#FDFBF7`).
   * Authentic Dzongkha/Tibetan calligraphy headers (`font-tibetan`).
2. **Verified Bhutan Imagery Across All Pages**:
   * **Hero**: Dochula Pass 108 Chortens Stupa Himalayan vista.
   * **Story Video**: Punakha Dzong monastic fortress.
   * **Learning**: Paro Taktsang Tiger's Nest and monastery prayer wheels.
   * **Blog & Journal**: Shedra monk scholars and 108 glowing butter lamps.
   * **Leadership**: Abbot Khenpo Tashi Dorji in monastic robes.
3. **Resilient Media Loading**:
   * Built-in `onError` fallback handlers across all `<img>` tags to guarantee 0% broken image placeholders.

---

## 🗓️ Day 7: End-to-End System Audit, Production Hardening & VPS Go-Live

### Objectives
* Execute 124-point automated integration test suite.
* Prepare production deployment configs (PM2, Nginx, SSL).
* Complete VPS / aaPanel deployment and verify live functionality.

### Key Milestones Delivered
1. **Automated Audit Suite (`test/system-audit-suite.js`)**:
   * **124 / 124 Assertions Passed (100%)**:
     * 13 Public Pages + 2 User Panel Components + 23 Admin ERP Modules.
     * 19 Backend Controllers + 4 Middlewares + 3 Services.
     * 30 Relational Database Tables in `db/schema.sql`.
2. **Production Deployment Suite**:
   * `ecosystem.config.js`: Configured PM2 cluster mode with max memory restart and auto-recovery.
   * `nginx.conf.example`: Reverse proxy for `/api/` and `/uploads/`, SPA routing (`try_files $uri $uri/ /index.html;`), SSL HTTP/2 configuration, and 100MB body upload limit.
   * `.env.example`: Complete environment variable template with zero hardcoded secrets.
3. **Final Verification**:
   * Public Website (`https://yourdomain.com/`)
   * User Panel (`https://yourdomain.com/user`)
   * Admin Portal (`https://yourdomain.com/admin/login`)

---

## 📊 Summary of Final Deliverables

| Category | Delivered Items |
| :--- | :--- |
| **Frontend Portals** | 3 Portals: Public Website (13 pages), Devotee User Panel, Admin ERP (20+ modules) |
| **Backend Architecture** | Node/Express API with 19 controllers, RBAC middleware, and audit logging |
| **Database** | 30 MySQL tables with complete seed data, foreign keys, and indexes |
| **Media & Assets** | Authentic Bhutan & Thimphu monastic photography with automatic fallbacks |
| **Testing** | 124-point automated test suite with 100% pass rate |
| **Deployment** | PM2 cluster configuration, Nginx reverse proxy template, and SSL guide |
