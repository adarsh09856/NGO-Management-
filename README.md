# NGO-Management-

# Drodul Phendey Ling Foundation — Monastery & NGO Management CRM

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Database: MySQL 8.0](https://img.shields.io/badge/Database-MySQL%208.0%20InnoDB-orange.svg)](https://www.mysql.com/)
[![Runtime: Node.js 18+](https://img.shields.io/badge/Runtime-Node.js%2018%2B-green.svg)](https://nodejs.org/)
[![Frontend: React 18 + Vite + Tailwind](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-blueviolet.svg)](https://react.dev/)
[![Author: Adarsh Nule](https://img.shields.io/badge/Author-Adarsh%20Nule-blue.svg)](https://www.linkedin.com/in/adarsh-nule/)

> **Keywords:** `ngo-management`, `monastery-crm`, `donation-management`, `80g-receipts`, `buddhist-monastery`, `bhutan`, `react`, `express`, `mysql`, `vite`, `tailwind-css`, `lms`, `payroll`, `inventory`, `aapanel-deployment`, `pm2`, `nginx`, `full-stack`

An enterprise-grade, **unified full-stack** CRM and Monastic Management System built for **Drodul Phendey Ling Foundation** (a Buddhist charitable institution in Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan, constructing the Great Druk Wangyel Peace Stupa and operating the Shedra Monastic University).

All backend REST APIs, MySQL models, PDF generators, and React 18 portals reside in a **single unified root application** with zero separate nested folders — streamlined for 1-click deployment on aaPanel / VPS hosting.

---

## 🏛️ System Portals & Architecture

The application comprises **four integrated portals**:

1. **Public Website (`/`)**:
   - Hero banner with Tibetan calligraphy `དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།`.
   - Floating donation widget with preset amounts, 80G tax receipt claims, and live payment gateway checkout.
   - 7 Core Module overview cards matching monastery operations.
   - About DPL Foundation story with video modal, mission bullets, and Buddha quote card.
   - Online Prayer & Butter Lamp Dedication request desk.
   - News, Pujas, Dharma Teachings & Lightbox Photo Gallery.

2. **Admin & Staff Portal (`/admin`)**:
   - Deep Burgundy (`#3B0A13`) sidebar and topbar with live global search across donors, students, and receipts.
   - **Donation Management**: 3-section Add Donation form (matches reference screenshot), live words conversion, receipt auto-generation, recurring pledges, and campaigns.
   - **Accounts & Finance**: Monthly income vs expense chart, general ledger, vouchers, and bank accounts.
   - **Inventory & Store**: Tabbed item inventory, minimum stock alerts, stock-in/stock-out movements, and supplier logs.
   - **Training & LMS**: Shedra curriculum courses, progress tracking, and **auto-issuance of PDF graduation certificates**.
   - **HRM & Payroll**: Employee directory, daily attendance register, monthly payroll generator, and **salary slip PDF generation**.
   - **Money Receipts**: Sequential numbering, PDF downloads, and **audited voiding with mandatory justification ($\ge 10$ chars)**.
   - **System Settings & Backups**: One-click database `.sql` backup engine and payment gateway credentials.

3. **Donor Portal (`/donor`)**:
   - Devotee self-service dashboard showing lifetime giving total, 80G tax deductions, active monthly pledges, and **direct PDF receipt downloads**.

4. **Student / Monk Portal (`/student`)**:
   - Monastic scholar dashboard showing enrolled Shedra courses, progress meters, attendance records, and **graduation certificates PDF downloads**.

---

## 📁 Single Unified Directory Structure

```text
./
├── config/                  # MySQL connection pool & transaction helper
│   └── db.js
├── controllers/             # All 16 modular backend controllers
│   ├── accountController.js
│   ├── authController.js
│   ├── certificateController.js
│   ├── cmsController.js
│   ├── crmController.js
│   ├── donationController.js
│   ├── donorController.js
│   ├── hrmController.js
│   ├── inventoryController.js
│   ├── lmsController.js
│   ├── paymentController.js
│   ├── payrollController.js
│   ├── projectController.js
│   ├── receiptController.js
│   ├── reportController.js
│   ├── searchController.js
│   └── settingsController.js
├── db/                      # Canonical SQL DDL and runner scripts
│   ├── backup.js            # DB Backup CLI (exports to /backups)
│   ├── migrate.js           # DDL runner
│   ├── schema.sql           # Canonical 47-table InnoDB schema
│   ├── seed.js              # Seeder runner
│   └── seed.sql             # Realistic seed data
├── middleware/              # Auth, RBAC, Audit Logger, Multer Upload
├── routes/                  # API router (/api/...)
├── services/                # PDFKit generators, Nodemailer SMTP, Payment settlement
├── src/                     # React 18 Frontend
│   ├── components/          # Navbar, Footer, Sidebar, Topbar, Modals
│   ├── context/             # AuthContext, ToastContext
│   ├── pages/
│   │   ├── admin/           # Admin Dashboard, Add Donation, Accounts, Inventory, etc.
│   │   ├── donor/           # Donor Dashboard, Donations, Pledges
│   │   ├── public/          # Home, About, Contact, Donate, News, Gallery, Prayer Request, Login
│   │   └── student/         # Student Dashboard, Courses, Attendance, Certificates
│   ├── services/            # Axios client
│   ├── App.jsx              # Master route tree
│   ├── index.css            # Custom monastery styling & scrollbars
│   └── main.jsx             # React entry point
├── uploads/                 # Persistent media, receipts, and certificates
├── .env                     # Environment variables
├── .env.example             # Production template
├── ecosystem.config.js      # PM2 configuration for aaPanel
├── index.html               # Main HTML template
├── nginx.conf.example       # aaPanel Nginx vhost config
├── package.json             # Single root dependencies & scripts
├── server.js                # Express master server (serves API & React SPA)
├── tailwind.config.js       # Tailwind monastery palette
└── vite.config.js           # Vite build config
```

---

## 🔑 Pre-Seeded Test Credentials

All pre-seeded user accounts use the default password: **`password123`**

| Portal / Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@drodulphendeyling.org` | `password123` | Full access to all 18 modules & system settings |
| **Accountant** | `accountant@drodulphendeyling.org` | `password123` | Donations, Receipts, Accounts, General Ledger |
| **HR Manager** | `hr@drodulphendeyling.org` | `password123` | Staff Directory, Attendance, Payroll Runs |
| **Monastery Staff** | `staff@drodulphendeyling.org` | `password123` | Inventory Store, Projects, LMS, CRM Broadcasts |
| **Devotee Donor** | `tashi.phuntsho@email.com` | `password123` | Donor Portal (Donation history & 80G receipts) |
| **Monk Scholar** | `tenzin.norbu@monastery.bt` | `password123` | Student Portal (Shedra courses & certificates) |

---

## 💻 Local Development Setup (Single Command Flow)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL Server**: 8.0 or 5.7 running locally

### 2. Configure Database & Environment
Edit `.env` in the project root:
```env
PORT=5000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=drodul_phendey_ling_db

JWT_SECRET=your_dev_jwt_secret_key_12345
```

### 3. Initialize Database
Run the canonical migration and seeder scripts from the root directory:
```bash
# Run migration to create all 47 InnoDB tables
npm run db:migrate

# Populate realistic seed data matching all screenshots
npm run db:seed
```

### 4. Install & Run Application
```bash
# 1. Install all dependencies in one command
npm install

# 2. Build React production bundle
npm run build

# 3. Start unified Express server (serves API & Frontend on http://localhost:5000)
npm start
```
Or for interactive Vite hot-reloading development:
```bash
npm run dev
```

---

## 🚀 aaPanel VPS Production Deployment Guide

Deploying Drodul Phendey Ling CRM in **aaPanel Node.js Project Manager** requires only a single directory setup:

### Step 1: Create MySQL Database in aaPanel
1. In aaPanel, navigate to **Databases** -> **Add Database**.
2. **DB Name**: `drodul_phendey_ling_db`
3. **DB Username**: `drodul_db_user`
4. **DB Password**: *(Generate a strong secure password)*
5. **Character Set**: `utf8mb4`
6. Click **Submit**.

---

### Step 2: Upload Files & Setup `.env`
1. Upload this project directly into `/www/wwwroot/drodulphendeyling`.
2. Create your `.env` in the root:
   ```bash
   cd /www/wwwroot/drodulphendeyling
   cp .env.example .env
   nano .env
   ```
3. Update database credentials in `.env`:
   ```env
   NODE_ENV=production
   PORT=5000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=drodul_db_user
   DB_PASSWORD=your_actual_aapanel_db_password
   DB_NAME=drodul_phendey_ling_db
   JWT_SECRET=generate_a_random_64_char_secret_for_production
   UPLOAD_DIR=/www/wwwroot/drodulphendeyling/uploads
   ```

---

### Step 3: Install, Migrate & Build
```bash
cd /www/wwwroot/drodulphendeyling

# Install dependencies
npm install

# Run database schema migrations and seeders
npm run db:migrate
npm run db:seed

# Build React frontend
npm run build
```

---

### Step 4: Add Node Project in aaPanel
1. In aaPanel, open **Website** -> **Node project** -> **Add Node project** (or use **PM2 Manager**).
2. **Project name**: `drodul-phendey-ling`
3. **Run directory**: `/www/wwwroot/drodulphendeyling`
4. **Startup file**: `server.js`
5. **Port**: `5000`
6. **Run opt**: `start` (or `node server.js`)
7. Click **Submit**.

---

### Step 5: Enable SSL in aaPanel
1. Go to the newly created website in aaPanel -> **SSL** -> **Let's Encrypt**.
2. Select your domain name and click **Apply** to activate automatic HTTPS encryption.

---

### Step 6: Automated Backups & Upload Persistence
- **Uploads Directory**: Uploaded receipts, certificates, and news banners reside in `/uploads` in root. Exclude this directory from redeployments to ensure user uploads are never overwritten.
- **Database Backup CLI**: Run `npm run db:backup` inside the root anytime to export a timestamped `.sql` file to `/backups`. In aaPanel **Cron**, you can schedule this command daily.

---

## 👤 Author & Maintainer

- **Developer**: **Adarsh Nule**
- **GitHub**: [@adarsh09856](https://github.com/adarsh09856)
- **LinkedIn**: [https://www.linkedin.com/in/adarsh-nule/](https://www.linkedin.com/in/adarsh-nule/)
- **Repository**: [https://github.com/adarsh09856/NGO-Management-](https://github.com/adarsh09856/NGO-Management-)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
