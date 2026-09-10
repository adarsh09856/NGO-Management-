# NGO CRM — Roadmap & Status

## Project Status: COMPLETE (Production-Ready)

All 7-day milestone targets have been delivered. The platform is deployment-ready on aaPanel VPS.

---

## Delivered (All Phases Complete)

### Day 1 — Database & Architecture
- [x] 47-table InnoDB MySQL schema designed and migrated
- [x] Seed data generator with realistic monastery records
- [x] Express server with MySQL pool, Helmet, CORS, JSON middleware

### Day 2 — Authentication & RBAC
- [x] Isolated `/admin/login` and `/login` (public devotee) routes
- [x] JWT issuance + bcrypt password hashing
- [x] Server-enforced RBAC middleware per role
- [x] Audit logging subsystem (IP, user, action, timestamp)
- [x] Role-based dynamic admin sidebar (Super Admin / Accountant / Staff / HR)

### Day 3 — Donation Engine & 80G PDFs
- [x] 3-section Add Donation form (matches reference screenshot)
- [x] Live amount-to-words conversion (Indian number system)
- [x] 80G tax receipt PDF auto-generation via PDFKit
- [x] Sequential receipt numbering — never reused
- [x] Recurring pledge management
- [x] Campaign management

### Day 4 — Finance & Inventory
- [x] Monthly income vs expense chart (Recharts)
- [x] General ledger, vouchers, bank accounts
- [x] Tabbed inventory — items, stock-in/out, supplier logs
- [x] Minimum stock alert system

### Day 5 — HRM, Payroll & CMS
- [x] Employee directory with attendance register
- [x] Monthly payroll generator with salary-slip PDF
- [x] Shedra LMS — courses, progress tracking
- [x] Auto-issuance of PDF graduation certificates
- [x] Blog/news, gallery, prayer request CMS

### Day 6 — Public Website (Bhutan UI/UX)
- [x] Hero banner with Tibetan calligraphy
- [x] Floating donation widget (Razorpay checkout)
- [x] About DPL Foundation — video modal, mission, Buddha quote card
- [x] Online Prayer & Butter Lamp Dedication desk
- [x] News, Pujas, Dharma Teachings, Lightbox Photo Gallery
- [x] Donor Portal — lifetime giving, 80G deductions, PDF receipts
- [x] Student Portal — enrolled courses, attendance, certificate PDFs

### Day 7 — Audit, Security & Deployment
- [x] Receipt voiding with mandatory 10-char justification
- [x] One-click DB backup engine
- [x] PM2 + nginx aaPanel production config
- [x] Environment variable production template
- [x] Integration assertion tests passing

---

## Known Gaps / Future Enhancements

These were not in the original scope but are candidate future work:

| Gap | Notes |
|---|---|
| Email notifications | Nodemailer wired but SMTP credentials needed for live delivery |
| Razorpay webhooks | Payment settlement currently polled; add webhook endpoint for reliability |
| Mobile responsiveness | Admin portal is desktop-optimised; mobile polish needed |
| 2FA enforcement | speakeasy TOTP available in deps but per-user 2FA UI not wired |
| CSV exports | Reports are PDF-only; CSV export for donations/payroll would be useful |
| Image optimisation | Uploaded images stored raw; no thumbnail/resize pipeline |

---

## Important Constraints

- Do NOT change the database from MySQL to any other engine
- Do NOT split the unified root structure into separate frontend/backend repos
- Do NOT add TypeScript to the frontend (stays JSX)
- Do NOT add an ORM — queries stay raw MySQL2 with parameterisation
- Receipts once voided must NEVER be re-activated — immutable audit trail
- The `uploads/` directory must always be excluded from clean redeploys
