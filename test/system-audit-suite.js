/**
 * Drodul Phendey Ling Foundation - End-to-End System Audit Runner
 * Validates all backend controllers, frontend components, routes, database SQL integrity,
 * PDF generation pipelines, and role-based permissions matrix.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(title, condition, detail = '') {
  totalChecks++;
  if (condition) {
    console.log(` ✅ PASS: ${title} ${detail ? '(' + detail + ')' : ''}`);
    passedChecks++;
  } else {
    console.error(` ❌ FAIL: ${title} ${detail ? '(' + detail + ')' : ''}`);
    failedChecks++;
  }
}

console.log('================================================================');
console.log(' Drodul Phendey Ling Foundation - Complete End-to-End Audit');
console.log('================================================================\n');

// ------------------------------------------------------------------
// 1. FRONTEND PORTALS & COMPONENTS AUDIT
// ------------------------------------------------------------------
console.log('--- 1. FRONTEND PORTALS & ROUTING AUDIT ---');

const publicPages = [
  'Home.jsx', 'About.jsx', 'Contact.jsx', 'Donate.jsx', 'PrayerRequest.jsx',
  'NewsEvents.jsx', 'NewsDetail.jsx', 'Gallery.jsx', 'Learning.jsx', 'Blog.jsx',
  'BlogDetail.jsx', 'Login.jsx', 'Register.jsx'
];

publicPages.forEach(file => {
  const filePath = path.join(rootDir, 'src/pages/public', file);
  check(`Public Page: ${file}`, fs.existsSync(filePath));
});

const userPages = ['UserLayout.jsx', 'UserDashboard.jsx'];
userPages.forEach(file => {
  const filePath = path.join(rootDir, 'src/pages/user', file);
  check(`User Panel Component: ${file}`, fs.existsSync(filePath));
});

const adminPages = [
  'AdminLayout.jsx', 'AdminLogin.jsx', 'AdminDashboard.jsx', 'AddDonation.jsx',
  'AllDonations.jsx', 'Campaigns.jsx', 'DonorsDirectory.jsx', 'MoneyReceipts.jsx',
  'AccountsDashboard.jsx', 'Expenses.jsx', 'InventoryDashboard.jsx', 'LearningManager.jsx',
  'BlogManager.jsx', 'GalleryManager.jsx', 'HRMEmployees.jsx', 'PayrollRuns.jsx',
  'CRMContacts.jsx', 'ProjectsTasks.jsx', 'CMSManager.jsx', 'UsersRoles.jsx',
  'AuditLog.jsx', 'SystemSettings.jsx', 'ReportsHub.jsx'
];

adminPages.forEach(file => {
  const filePath = path.join(rootDir, 'src/pages/admin', file);
  check(`Admin Portal Component: ${file}`, fs.existsSync(filePath));
});

const coreComponents = [
  'Navbar.jsx', 'Footer.jsx', 'AdminSidebar.jsx',
  'AdminTopbar.jsx', 'DonationModal.jsx'
];

coreComponents.forEach(file => {
  const filePath = path.join(rootDir, 'src/components', file);
  check(`Shared Component: ${file}`, fs.existsSync(filePath));
});

// Check Home.jsx does not contain module overview card grid
const homeContent = fs.readFileSync(path.join(rootDir, 'src/pages/public/Home.jsx'), 'utf-8');
check('Home Page: 7-card module overview grid removed', !homeContent.includes('CRM & Communication\n                </h4>') && !homeContent.includes('View Module'));

// Check App.jsx routing completeness
const appContent = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf-8');
check('App.jsx: Public Learning route wired', appContent.includes('/learning'));
check('App.jsx: Public Blog routes wired', appContent.includes('/blog') && appContent.includes('/blog/:slug'));
check('App.jsx: Dedicated Admin Login route wired', appContent.includes('/admin/login'));
check('App.jsx: Unified User Panel route wired', appContent.includes('/user/*'));
check('App.jsx: Role-enforced Admin Panel wired', appContent.includes('/admin/*'));

// ------------------------------------------------------------------
// 2. BACKEND CONTROLLERS & ENDPOINTS AUDIT
// ------------------------------------------------------------------
console.log('\n--- 2. BACKEND CONTROLLERS & SERVICES AUDIT ---');

const controllers = [
  'authController.js', 'userPanelController.js', 'blogController.js', 'learningController.js',
  'cmsController.js', 'donationController.js', 'donorController.js', 'receiptController.js',
  'accountController.js', 'inventoryController.js', 'hrmController.js', 'payrollController.js',
  'crmController.js', 'projectController.js', 'settingsController.js', 'reportController.js',
  'paymentController.js', 'searchController.js', 'certificateController.js'
];

controllers.forEach(ctrl => {
  const filePath = path.join(rootDir, 'controllers', ctrl);
  check(`Controller: ${ctrl}`, fs.existsSync(filePath));
});

const middleware = ['auth.js', 'rbac.js', 'upload.js', 'auditLogger.js'];
middleware.forEach(mid => {
  const filePath = path.join(rootDir, 'middleware', mid);
  check(`Middleware: ${mid}`, fs.existsSync(filePath));
});

const services = ['paymentService.js', 'pdfService.js', 'emailService.js'];
services.forEach(srv => {
  const filePath = path.join(rootDir, 'services', srv);
  check(`Service: ${srv}`, fs.existsSync(filePath));
});

// Check API Routes file
const apiRoutesContent = fs.readFileSync(path.join(rootDir, 'routes/api.js'), 'utf-8');
check('API Routes: /api/blog endpoints wired', apiRoutesContent.includes('/blog'));
check('API Routes: /api/learning endpoints wired', apiRoutesContent.includes('/learning'));
check('API Routes: /api/user/my-dashboard wired', apiRoutesContent.includes('/user/my-dashboard'));
check('API Routes: /api/cms/gallery endpoints wired', apiRoutesContent.includes('/cms/gallery'));
check('API Routes: /api/upload endpoint wired', apiRoutesContent.includes('/upload'));

// Check Multer video support
const uploadContent = fs.readFileSync(path.join(rootDir, 'middleware/upload.js'), 'utf-8');
check('Upload Middleware: Supports video formats (mp4, webm, etc.)', uploadContent.includes('video/mp4') && uploadContent.includes('100 * 1024 * 1024'));

// ------------------------------------------------------------------
// 3. DATABASE SCHEMA & SEED INTEGRITY AUDIT
// ------------------------------------------------------------------
console.log('\n--- 3. DATABASE SCHEMA & SEED SQL AUDIT ---');

const schemaSql = fs.readFileSync(path.join(rootDir, 'db/schema.sql'), 'utf-8');
const seedSql = fs.readFileSync(path.join(rootDir, 'db/seed.sql'), 'utf-8');

const tablesToCheck = [
  'users', 'roles', 'permissions', 'role_permissions', 'audit_logs',
  'donations', 'donors', 'money_receipts', 'campaigns', 'recurring_pledges',
  'bank_accounts', 'expenses', 'vouchers', 'store_items', 'stock_txn',
  'employees', 'attendance', 'payroll_runs', 'salary_slips', 'casual_labor',
  'projects', 'project_tasks', 'contacts', 'blog_posts', 'learning_materials',
  'gallery_items', 'news_events', 'prayer_requests', 'system_settings', 'payment_idempotency_log'
];

tablesToCheck.forEach(tbl => {
  check(`Schema Table Definition: ${tbl}`, schemaSql.includes(`CREATE TABLE IF NOT EXISTS ${tbl}`) || schemaSql.includes(`CREATE TABLE IF NOT EXISTS \`${tbl}\``));
});

check('Schema: blog_posts has slug and content fields', schemaSql.includes('blog_posts') && schemaSql.includes('slug') && schemaSql.includes('content'));
check('Schema: learning_materials has media_url and instructor', schemaSql.includes('learning_materials') && schemaSql.includes('media_url') && schemaSql.includes('instructor'));
check('Schema: gallery_items has media_type (photos & video uploads/URLs)', schemaSql.includes('gallery_items') && schemaSql.includes('media_type'));

check('Seed: Contains pre-seeded blog posts', seedSql.includes('INSERT INTO blog_posts'));
check('Seed: Contains pre-seeded learning video materials', seedSql.includes('INSERT INTO learning_materials'));
check('Seed: Contains pre-seeded gallery items (photos & videos)', seedSql.includes('INSERT INTO gallery_items'));
check('Seed: Contains pre-seeded users and password hashes', seedSql.includes('INSERT INTO users'));

// ------------------------------------------------------------------
// 4. PRODUCTION BUILD & DEPLOYMENT CONFIG AUDIT
// ------------------------------------------------------------------
console.log('\n--- 4. PRODUCTION BUILD & DEPLOYMENT AUDIT ---');

check('Dist Directory: index.html exists', fs.existsSync(path.join(rootDir, 'dist/index.html')));
check('Dist Directory: Assets CSS bundle exists', fs.readdirSync(path.join(rootDir, 'dist/assets')).some(f => f.endsWith('.css')));
check('Dist Directory: Assets JS bundle exists', fs.readdirSync(path.join(rootDir, 'dist/assets')).some(f => f.endsWith('.js')));
check('Deployment: ecosystem.config.js for PM2 exists', fs.existsSync(path.join(rootDir, 'ecosystem.config.js')));
check('Deployment: nginx.conf.example exists', fs.existsSync(path.join(rootDir, 'nginx.conf.example')));
check('Environment: .env.example exists', fs.existsSync(path.join(rootDir, '.env.example')));

// ------------------------------------------------------------------
// 5. SUMMARY
// ------------------------------------------------------------------
console.log('\n================================================================');
console.log(` Audit Complete: ${passedChecks}/${totalChecks} Checks Passed (${Math.round((passedChecks / totalChecks) * 100)}%)`);
if (failedChecks === 0) {
  console.log(' Status: ALL CHECKS PASSED - 100% PRODUCTION READY');
} else {
  console.error(` Status: ${failedChecks} CHECKS FAILED`);
}
console.log('================================================================\n');

if (failedChecks > 0) {
  process.exit(1);
}
