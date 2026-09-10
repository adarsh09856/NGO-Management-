# AI AGENT RULES — Drodul Phendey Ling NGO CRM
# READ THIS FILE FIRST. EVERY SESSION. WITHOUT EXCEPTION.

---

## STEP 0 — Session Start Protocol (Mandatory)

Before writing a single line of code, read these files in order:

1. `.mind/RULES.md`        ← this file
2. `.mind/OVERVIEW.md`     ← project identity, stack, portals, modules
3. `.mind/ARCHITECTURE.md` ← directory structure, conventions, constraints
4. `.mind/ROADMAP.md`      ← what is done, what is pending, what is forbidden
5. `.mind/COMMANDS.md`     ← dev/build/DB/deploy commands

Only after reading all five files may you begin work.

---

## STEP 1 — Understand Before You Build

- Identify the **minimum relevant files** for this request. Do not scan the entire repo.
- Re-use existing patterns, utilities, controllers, and components.
- Never introduce a new library if the existing stack already solves the problem.
- If the request is ambiguous, ask ONE clarifying question before proceeding.

---

## STEP 2 — Plan the Smallest Correct Change

- Identify the minimum files that need to change.
- Prefer targeted edits over file rewrites.
- Do not modify unrelated code.
- Do not add abstraction layers for theoretical future use.
- Preserve backward compatibility.

---

## STEP 3 — Implementation Rules (Non-Negotiable)

### Stack rules — never violate
- Backend: **Node.js + Express only** — no other framework
- Database: **MySQL 8.0 only** — no PostgreSQL, no SQLite, no ORM
- Frontend: **React 18 JSX + Vite** — no TypeScript, no Next.js
- Styling: **Tailwind CSS classes only** — no inline styles, no CSS modules
- PDF: **PDFKit only** — no Puppeteer or other PDF engines
- Queries: **raw MySQL2 with parameterised inputs** — no Prisma, no Sequelize
- Auth: **JWT + bcryptjs + RBAC middleware** — do not bypass the auth chain

### Coding rules
- Follow existing naming conventions in every file you touch
- Re-use controllers, middleware, services, and React components
- No duplicate logic — check if a utility already exists before writing a new one
- Preserve all existing comments and docstrings unrelated to your change
- Every mutation on donations, receipts, users, payroll MUST log to `audit_logs`
- Receipt voiding MUST enforce ≥ 10 character justification — server-side, always
- New admin routes MUST be added to the RBAC role check in `AdminSidebar.jsx`
- All file uploads go through the existing Multer middleware — never bypass it
- All DB mutations inside controllers MUST use `withTransaction` for atomicity

### Security rules
- Never hardcode credentials, secrets, or passwords in any file
- Never expose raw DB error messages to the client
- Rate limiting is already applied to auth routes — do not remove it
- Audit logging middleware must remain on all POST/PUT/DELETE sensitive routes

---

## STEP 4 — Verify After Every Change

Run the relevant checks after implementing:

```bash
# Build check (React bundle)
npm run build

# Integration tests
npm test

# Manual: open http://localhost:5000 and verify the changed feature
```

Fix any build errors or test failures before declaring work done.

---

## STEP 5 — UPDATE .mind AFTER EVERY CHANGE (Mandatory)

**After completing any feature, fix, or significant change, you MUST update the relevant `.mind` files.**

### What to update and when:

| Change type | Files to update |
|---|---|
| New controller or route added | `ARCHITECTURE.md` (add to controller list or route prefix table) |
| New admin module or JSX page | `OVERVIEW.md` (add to Admin ERP Modules table) |
| New DB table or schema change | `OVERVIEW.md` (update DB section), `ARCHITECTURE.md` (table groups) |
| New env variable added | `COMMANDS.md` (env var reference table) |
| Phase of roadmap completed | `ROADMAP.md` (mark `[x]`, move to Delivered) |
| New known gap or constraint identified | `ROADMAP.md` (add to Known Gaps or Constraints) |
| New agent rule discovered | `RULES.md` (add to Step 3 rules) |
| New npm dependency added | `OVERVIEW.md` (update Tech Stack table) |
| Deployment config changed | `COMMANDS.md` (update PM2 / deployment section) |

### How to update:
- Edit ONLY the sections that changed — do not rewrite the entire file
- Be precise and concise — these files are read at the start of every future session
- Timestamp significant additions with `(added YYYY-MM-DD)` if helpful for tracking

---

## Project-Specific Hard Rules

These rules are absolute. No exceptions, no workarounds:

1. **Single unified root** — backend and frontend share one `package.json` and one directory. Never propose splitting them.
2. **MySQL InnoDB only** — the 47-table schema is canonical. Never suggest a database change.
3. **No TypeScript** — this project is JavaScript (JSX). Do not create `.ts` or `.tsx` files.
4. **No ORM** — raw MySQL2 queries with parameterised inputs only.
5. **Uploads directory is sacred** — `/uploads` contains live user files. Never delete, never gitignore its contents.
6. **Receipts are immutable** — once voided, a receipt can never be re-activated. The audit trail is permanent.
7. **Sidebar is role-driven** — any new admin page must be registered in the role visibility config.
8. **80G receipts must include donor PAN** — this is a legal requirement for Indian tax exemption.
9. **Donation amounts are stored as integers (paise)** — never use floats for money.
10. **DB backups via `npm run db:backup`** — never delete the `/backups` directory.

---

## Commit Rules

- Never commit `.env`, `.env.example` with real secrets, or any credential file
- Never commit the `/uploads` directory contents (binary user files)
- Never commit the `/backups` directory contents (SQL dumps)
- Never commit `node_modules/`
- Commit messages: `<type>(<scope>): <description>` format preferred
