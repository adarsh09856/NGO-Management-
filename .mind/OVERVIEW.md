# Drodul Phendey Ling Foundation — NGO CRM
## Project Overview & AI Engineering Context

**Organisation**: Drodul Phendey Ling (DPL) Foundation
**Location**: Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan
**Mission**: Constructs the Great Druk Wangyel Peace Stupa; operates the Shedra Monastic University
**Repo directory**: `e:\ai\bhutanprojects\ngo`
**License**: MIT | **Author**: Adarsh Nule

---

## Purpose

Enterprise-grade, unified full-stack CRM and Monastic Management System.
All backend REST APIs, MySQL models, PDF generators, and React 18 portals reside in a
**single unified root application** — streamlined for 1-click aaPanel / VPS deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 6 + Tailwind CSS 3 |
| Backend | Node.js 18+ + Express 4 |
| Database | MySQL 8.0 InnoDB — 47-table schema |
| Auth | JWT (jsonwebtoken) + bcryptjs + RBAC middleware |
| PDF Engine | PDFKit |
| 2FA | speakeasy (TOTP) |
| Email | Nodemailer (SMTP) |
| Payment | Razorpay |
| Charts | Recharts |
| Deployment | PM2 + nginx (aaPanel VPS) |

---

## Four Portals

| Route | Portal | Audience |
|---|---|---|
| `/` | Public Website | General devotees & public |
| `/admin` | Admin / Staff ERP | Super Admin, Accountant, HR, Staff |
| `/donor` | Donor Self-Service | Registered devotees / donors |
| `/student` | Student / Monk Portal | Shedra monastic scholars |

---

## Pre-Seeded Test Credentials (default password: `password123`)

| Role | Email |
|---|---|
| Super Admin | `admin@drodulphendeyling.org` |
| Accountant | `accountant@drodulphendeyling.org` |
| HR Manager | `hr@drodulphendeyling.org` |
| Staff | `staff@drodulphendeyling.org` |
| Donor | `tashi.phuntsho@email.com` |
| Monk Scholar | `tenzin.norbu@monastery.bt` |

---

## Admin ERP Modules (26 JSX files in `src/pages/admin/`)

| Module | File |
|---|---|
| Dashboard | `AdminDashboard.jsx` |
| Add Donation (3-section form) | `AddDonation.jsx` |
| All Donations | `AllDonations.jsx` |
| Donors Directory | `DonorsDirectory.jsx` |
| Campaigns | `Campaigns.jsx` |
| Accounts / Finance | `AccountsDashboard.jsx` |
| Expenses | `Expenses.jsx` |
| Inventory / Store | `InventoryDashboard.jsx` |
| HRM / Employees | `HRMEmployees.jsx` |
| Payroll Runs | `PayrollRuns.jsx` |
| LMS Overview | `LMSOverview.jsx` |
| Graduation Certificates PDF | `Certificates.jsx` |
| Money Receipts (sequential + void audit) | `MoneyReceipts.jsx` |
| CMS Manager | `CMSManager.jsx` |
| Gallery | `GalleryManager.jsx` |
| Blog | `BlogManager.jsx` |
| CRM Contacts | `CRMContacts.jsx` |
| Projects & Tasks | `ProjectsTasks.jsx` |
| Students / Monks | `StudentsMonks.jsx` |
| Users & Roles | `UsersRoles.jsx` |
| System Settings | `SystemSettings.jsx` |
| Reports Hub | `ReportsHub.jsx` |
| Audit Log | `AuditLog.jsx` |
| Learning Manager | `LearningManager.jsx` |

---

## Backend: 16 Controllers

```
controllers/
├── authController.js        JWT login/register, bcrypt, RBAC
├── donationController.js    Donation intake, 80G receipt PDF
├── receiptController.js     Sequential numbering, void with 10-char audit reason
├── hrmController.js         Employee directory, attendance
├── payrollController.js     Monthly payroll runs, salary-slip PDFs
├── lmsController.js         Shedra courses, progress, certificate PDFs
├── inventoryController.js   Store items, stock-in/out, min-stock alerts
├── accountController.js     General ledger, vouchers, bank accounts
├── projectController.js     Projects & tasks
├── cmsController.js         Blog, gallery, prayers, news/events
├── crmController.js         Devotee/donor CRM contacts
├── reportController.js      Aggregated financial reports
├── certificateController.js Graduation certificate PDF issuance
├── paymentController.js     Razorpay gateway integration
├── searchController.js      Global cross-module search
└── settingsController.js    System settings & DB backup
```

---

## Database

- **Schema**: `db/schema.sql` — 47 InnoDB tables
- **Seed**: `db/seed.sql` — realistic monastery data
- **Migration runner**: `db/migrate.js`
- **Backup engine**: `db/backup.js` — timestamped `.sql` exports to `/backups`

Key table groups:
- Auth: `users`, `roles`, `permissions`, `role_permissions`, `audit_logs`
- Finance: `donations`, `donors`, `money_receipts`, `campaigns`, `recurring_pledges`, `bank_accounts`, `expenses`, `vouchers`
- Operations: `store_items`, `stock_txn`, `employees`, `attendance`, `payroll_runs`, `salary_slips`
- Academic: `projects`, `project_tasks`, `contacts`
- CMS: `blog_posts`, `learning_materials`, `gallery_items`, `news_events`, `prayer_requests`, `system_settings`

---

## Environment Variables (`.env`)

```env
PORT=5000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<mysql_password>
DB_NAME=drodul_phendey_ling_db
JWT_SECRET=<64-char-secret>
UPLOAD_DIR=./uploads
```

---

## Status

- All 4 portals fully implemented
- 47-table MySQL schema migrated and seeded
- 80G PDF receipts, salary-slip PDFs, graduation certificate PDFs working
- Razorpay payment gateway integrated
- PM2 + nginx aaPanel production config present
- Audit logging on all critical operations
- RBAC with dynamic role-based navigation
