# NGO CRM — Architecture & Conventions

## Directory Structure

```
ngo/
├── config/db.js             MySQL connection pool & transaction helper (withTransaction)
├── controllers/             16 modular backend controllers
├── db/
│   ├── schema.sql           Canonical 47-table InnoDB DDL
│   ├── seed.sql             Realistic monastery seed data
│   ├── migrate.js           DDL runner
│   ├── seed.js              Seed runner
│   └── backup.js            DB backup CLI → /backups/*.sql
├── middleware/
│   ├── auth.js              JWT verify middleware
│   ├── rbac.js              Role-based access control
│   └── auditLogger.js       Auto audit: userID, IP, timestamp, action, payload
├── routes/                  Express API routers (/api/...)
├── services/                PDFKit generators, Nodemailer, Razorpay settlement
├── uploads/                 Persistent: receipts, certificates, news banners
├── src/                     React 18 frontend
│   ├── App.jsx              Master route tree (React Router DOM v6)
│   ├── components/          Navbar, Footer, AdminSidebar, Topbar, Modals
│   ├── context/             AuthContext, ToastContext
│   ├── pages/
│   │   ├── admin/           26 admin JSX pages
│   │   ├── donor/           Donor dashboard, donations, pledges
│   │   ├── public/          Home, About, Contact, Donate, News, Gallery, Prayer
│   │   └── student/         Courses, attendance, certificates
│   └── services/            Axios API client
├── server.js                Express master server (API + SPA serving on port 5000)
├── vite.config.js           Vite build config
├── tailwind.config.js       Monastery colour palette
└── ecosystem.config.js      PM2 config for aaPanel
```

---

## Key Conventions

### Backend
- All controllers export async named handler functions
- All DB queries use the MySQL2 pool from `config/db.js`
- Mutations inside controllers use `withTransaction(conn, async () => {...})` for atomicity
- All protected routes apply `middleware/auth.js` then `middleware/rbac.js` in that order
- File uploads go through Multer, stored in `/uploads/<type>/`
- Audit logging middleware wraps all POST/PUT/DELETE on sensitive routes automatically

### Frontend
- React Router DOM v6 — all routes defined in `src/App.jsx`
- AuthContext (`src/context/AuthContext.jsx`) provides user state + token storage
- All API calls go through `src/services/api.js` (Axios instance with JWT header injection)
- Admin sidebar visibility per-role driven by role string in AuthContext
- Tailwind CSS classes only — no inline styles except dynamic colours
- JSX files (not TSX) — this project is JavaScript, not TypeScript

### PDF Generation
- All PDFs (80G receipts, salary slips, certificates) generated server-side via PDFKit
- PDF routes are in `routes/` and stream directly to response with `Content-Type: application/pdf`
- PDF templates live in `services/` alongside their data-fetching logic

### Money / Receipts
- All donation amounts are stored as integers (paise for INR)
- Receipt numbers are sequential, auto-incremented, never reused
- Voiding a receipt requires a justification string of ≥ 10 characters (enforced server-side)
- 80G receipts include donor PAN number field

---

## RBAC Roles

| Role | Access |
|---|---|
| `super_admin` | All 18+ ERP modules + system settings |
| `accountant` | Donations, Receipts, Accounts, General Ledger only |
| `hr_manager` | Staff Directory, Attendance, Payroll Runs only |
| `staff` | Inventory, Projects, LMS, CRM Broadcasts only |
| `donor_user` | Donor Portal only |
| `student_user` | Student Portal only |

---

## API Route Prefix

All backend API routes are under `/api/`:
```
/api/auth/...
/api/donations/...
/api/receipts/...
/api/hrm/...
/api/payroll/...
/api/lms/...
/api/inventory/...
/api/accounts/...
/api/projects/...
/api/cms/...
/api/crm/...
/api/reports/...
/api/certificates/...
/api/payments/...
/api/search/...
/api/settings/...
```

---

## Production Deployment (aaPanel)

```
VPS directory:   /www/wwwroot/drodulphendeyling
Port:            5000
PM2 app name:    drodul-phendey-ling
nginx:           proxy_pass to localhost:5000
DB name:         drodul_phendey_ling_db
Uploads persist: /uploads (exclude from redeploys)
Backups cron:    npm run db:backup (daily via aaPanel Cron)
```

---

## Security Notes

- JWT tokens are signed with `JWT_SECRET` from `.env` — rotate for production
- bcrypt with salt rounds 10 for all password hashing
- speakeasy TOTP for optional 2FA (shared secret per user)
- Helmet.js security headers applied at Express level
- CORS configured in `server.js` — restrict `origin` for production
- Rate limiting via `express-rate-limit` on auth routes
- File upload MIME type validation in Multer middleware
