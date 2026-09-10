# NGO CRM — Dev Commands & Workflow

## Quick Start (Development)

```bash
# 1. Install all dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# 3. Create database and run schema
npm run db:migrate

# 4. Populate seed data
npm run db:seed

# 5a. Development mode (Vite hot-reload frontend ONLY)
npm run dev

# 5b. Development mode (Express backend with nodemon)
npm run dev:server

# For full dev: run both in separate terminals
```

## Build & Production

```bash
# Build React frontend bundle to /dist
npm run build

# Start unified Express server (serves API + built frontend)
npm start
# → http://localhost:5000
```

## Database Operations

```bash
# Re-run schema migrations (safe — CREATE TABLE IF NOT EXISTS)
npm run db:migrate

# Re-seed data (idempotent for admin accounts)
npm run db:seed

# Export timestamped SQL backup to /backups/
npm run db:backup
```

## Testing

```bash
# Run integration assertion tests
npm test
```

## PM2 (Production)

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs drodul-phendey-ling

# Reload after code changes (zero-downtime)
pm2 reload drodul-phendey-ling
```

---

## Environment Variables Reference

| Variable | Example | Required |
|---|---|---|
| `PORT` | `5000` | Yes |
| `NODE_ENV` | `development` / `production` | Yes |
| `DB_HOST` | `127.0.0.1` | Yes |
| `DB_PORT` | `3306` | Yes |
| `DB_USER` | `root` | Yes |
| `DB_PASSWORD` | `<password>` | Yes |
| `DB_NAME` | `drodul_phendey_ling_db` | Yes |
| `JWT_SECRET` | `<64-char random string>` | Yes |
| `UPLOAD_DIR` | `./uploads` | Yes |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | For payments |
| `RAZORPAY_KEY_SECRET` | `<secret>` | For payments |
| `SMTP_HOST` | `smtp.gmail.com` | For email |
| `SMTP_PORT` | `465` | For email |
| `SMTP_USER` | `noreply@...` | For email |
| `SMTP_PASS` | `<app password>` | For email |

---

## Important Notes for AI Agents

1. **Single root** — backend and frontend share one `package.json`. Never split them.
2. **MySQL only** — do not suggest PostgreSQL migrations; schema is MySQL InnoDB.
3. **JavaScript only** — frontend is JSX (no TypeScript). Do not add `.ts`/`.tsx` files.
4. **Tailwind only** — no CSS modules, no styled-components. Use Tailwind utility classes.
5. **PDFKit for PDFs** — do not introduce puppeteer or other PDF libraries.
6. **No ORM** — raw MySQL2 queries with parameterised inputs. Do not add Prisma or Sequelize.
7. **Uploads persist** — never delete or gitignore `/uploads` contents. It holds live user files.
8. **Receipt voiding** requires ≥ 10 char reason — enforce server-side, always.
9. **Sidebar is role-driven** — add new admin routes to role check in `AdminSidebar.jsx`.
10. **Audit log** — every mutation on donations, receipts, users, payroll must log to `audit_logs`.
