const express = require('express');
const router = express.Router();

const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const { upload } = require('../middleware/upload');

// Import Controllers
const authCtrl = require('../controllers/authController');
const donationCtrl = require('../controllers/donationController');
const donorCtrl = require('../controllers/donorController');
const receiptCtrl = require('../controllers/receiptController');
const accountCtrl = require('../controllers/accountController');
const inventoryCtrl = require('../controllers/inventoryController');
const lmsCtrl = require('../controllers/lmsController');
const certCtrl = require('../controllers/certificateController');
const hrmCtrl = require('../controllers/hrmController');
const payrollCtrl = require('../controllers/payrollController');
const crmCtrl = require('../controllers/crmController');
const projectCtrl = require('../controllers/projectController');
const cmsCtrl = require('../controllers/cmsController');
const settingsCtrl = require('../controllers/settingsController');
const reportCtrl = require('../controllers/reportController');
const paymentCtrl = require('../controllers/paymentController');
const searchCtrl = require('../controllers/searchController');

// ==========================================
// 1. AUTHENTICATION & PORTAL LOGINS
// ==========================================
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);
router.get('/auth/me', authenticateToken, authCtrl.me);
router.put('/auth/profile', authenticateToken, authCtrl.updateProfile);

// ==========================================
// 2. DONATIONS & CAMPAIGNS
// ==========================================
router.get('/campaigns/public', donationCtrl.getCampaigns);
router.get('/donations/campaigns', authenticateToken, donationCtrl.getCampaigns);
router.post('/donations/campaigns', authenticateToken, requirePermission('donations:campaigns'), donationCtrl.createCampaign);
router.put('/donations/campaigns/:id', authenticateToken, requirePermission('donations:campaigns'), donationCtrl.updateCampaign);

router.post('/donations', authenticateToken, requirePermission('donations:create'), donationCtrl.addDonation);
router.get('/donations', authenticateToken, requirePermission('donations:view'), donationCtrl.getAllDonations);
router.get('/donations/recurring', authenticateToken, donationCtrl.getRecurringPledges);
router.post('/donations/recurring/:id/status', authenticateToken, donationCtrl.updatePledgeStatus);
router.get('/donations/:id', authenticateToken, donationCtrl.getDonationById);
router.delete('/donations/:id', authenticateToken, requirePermission('donations:delete'), donationCtrl.deleteDonation);

// ==========================================
// 3. DONORS DIRECTORY & DONOR PORTAL
// ==========================================
router.get('/donors', authenticateToken, donorCtrl.getDonors);
router.post('/donors', authenticateToken, donorCtrl.createDonor);
router.get('/donors/:id', authenticateToken, donorCtrl.getDonorById);

// Donor Portal Self-Service
router.get('/donor/my-dashboard', authenticateToken, donorCtrl.getMyDashboard);
router.get('/donor/my-donations', authenticateToken, donorCtrl.getMyDonations);
router.put('/donor/my-profile', authenticateToken, donorCtrl.updateMyProfile);

// ==========================================
// 4. MONEY RECEIPTS & PDF ENGINE
// ==========================================
router.get('/receipts', authenticateToken, requirePermission('receipts:view'), receiptCtrl.getReceipts);
router.get('/receipts/:id', authenticateToken, receiptCtrl.getReceiptById);
router.get('/receipts/:id/pdf', receiptCtrl.downloadReceiptPdf);
router.post('/receipts/:id/void', authenticateToken, requirePermission('receipts:void'), receiptCtrl.voidReceipt);

// ==========================================
// 5. ACCOUNTS & FINANCE
// ==========================================
router.get('/accounts/dashboard', authenticateToken, accountCtrl.getAccountsDashboard);
router.get('/accounts/ledger', authenticateToken, accountCtrl.getIncomeLedger);
router.get('/accounts/expenses', authenticateToken, accountCtrl.getExpenses);
router.post('/accounts/expenses', authenticateToken, accountCtrl.createExpense);
router.post('/accounts/expenses/:id/approve', authenticateToken, requirePermission('accounts:expenses_approve'), accountCtrl.approveExpense);
router.get('/accounts/expense-categories', authenticateToken, accountCtrl.getExpenseCategories);
router.get('/accounts/bank-accounts', authenticateToken, accountCtrl.getBankAccounts);
router.get('/accounts/vouchers', authenticateToken, accountCtrl.getVouchers);

// ==========================================
// 6. INVENTORY & STORE
// ==========================================
router.get('/inventory/dashboard', authenticateToken, inventoryCtrl.getInventoryDashboard);
router.get('/inventory/items', authenticateToken, inventoryCtrl.getStoreItems);
router.post('/inventory/items', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.createStoreItem);
router.put('/inventory/items/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.updateStoreItem);
router.post('/inventory/stock-in', authenticateToken, requirePermission('inventory:stock_txn'), inventoryCtrl.stockIn);
router.post('/inventory/stock-out', authenticateToken, requirePermission('inventory:stock_txn'), inventoryCtrl.stockOut);
router.get('/inventory/categories', authenticateToken, inventoryCtrl.getCategories);
router.get('/inventory/units', authenticateToken, inventoryCtrl.getUnits);
router.get('/inventory/suppliers', authenticateToken, inventoryCtrl.getSuppliers);
router.get('/inventory/locations', authenticateToken, inventoryCtrl.getLocations);

// ==========================================
// 7. TRAINING & LMS
// ==========================================
router.get('/lms/overview', authenticateToken, lmsCtrl.getLmsOverview);
router.get('/lms/courses', lmsCtrl.getCourses);
router.post('/lms/courses', authenticateToken, requirePermission('lms:manage_courses'), lmsCtrl.createCourse);
router.get('/lms/batches', authenticateToken, lmsCtrl.getBatches);
router.get('/lms/enrollments', authenticateToken, lmsCtrl.getEnrollments);
router.put('/lms/enrollments/:id/progress', authenticateToken, requirePermission('lms:attendance'), lmsCtrl.updateEnrollmentProgress);
router.get('/lms/students', authenticateToken, lmsCtrl.getStudents);
router.post('/lms/students', authenticateToken, lmsCtrl.createStudent);

// Student/Monk Portal Self-Service
router.get('/student/my-dashboard', authenticateToken, lmsCtrl.getStudentDashboard);
router.get('/student/my-certificates', authenticateToken, lmsCtrl.getStudentCertificates);

// ==========================================
// 8. CERTIFICATES & PDF ENGINE
// ==========================================
router.get('/certificates', authenticateToken, certCtrl.getCertificates);
router.get('/certificates/:id/pdf', certCtrl.downloadCertificatePdf);
router.post('/certificates/:id/revoke', authenticateToken, requireRole('super_admin'), certCtrl.revokeCertificate);

// ==========================================
// 9. HRM & ATTENDANCE
// ==========================================
router.get('/hrm/employees', authenticateToken, hrmCtrl.getEmployees);
router.post('/hrm/employees', authenticateToken, requirePermission('hrm:manage_employees'), hrmCtrl.createEmployee);
router.get('/hrm/attendance', authenticateToken, hrmCtrl.getAttendance);
router.post('/hrm/attendance', authenticateToken, requirePermission('hrm:attendance'), hrmCtrl.markAttendance);
router.get('/hrm/leave', authenticateToken, hrmCtrl.getLeaveRequests);
router.post('/hrm/leave', authenticateToken, hrmCtrl.submitLeaveRequest);
router.post('/hrm/leave/:id/approve', authenticateToken, requirePermission('hrm:leave_approve'), hrmCtrl.approveLeaveRequest);

// ==========================================
// 10. PAYROLL & CASUAL LABOR
// ==========================================
router.get('/payroll/runs', authenticateToken, payrollCtrl.getPayrollRuns);
router.post('/payroll/generate', authenticateToken, requirePermission('payroll:manage'), payrollCtrl.generatePayrollRun);
router.get('/payroll/runs/:id/slips', authenticateToken, payrollCtrl.getSalarySlipsByRun);
router.get('/payroll/slips/:id/pdf', payrollCtrl.downloadSalarySlipPdf);
router.get('/payroll/casual-labor', authenticateToken, payrollCtrl.getCasualLabor);
router.post('/payroll/casual-labor', authenticateToken, requirePermission('payroll:casual_labor'), payrollCtrl.createCasualLabor);

// ==========================================
// 11. CRM & COMMUNICATIONS
// ==========================================
router.get('/crm/contacts', authenticateToken, crmCtrl.getContacts);
router.post('/crm/contacts', authenticateToken, requirePermission('crm:manage_contacts'), crmCtrl.createContact);
router.get('/crm/contacts/:id/communications', authenticateToken, crmCtrl.getCommunicationsByContact);
router.post('/crm/contacts/:id/communications', authenticateToken, crmCtrl.addCommunication);
router.post('/crm/campaigns/broadcast', authenticateToken, requirePermission('crm:campaigns'), crmCtrl.broadcastCampaign);

// ==========================================
// 12. PROJECTS, TASKS, DOCUMENTS & NOTICES
// ==========================================
router.get('/projects', projectCtrl.getProjects);
router.post('/projects', authenticateToken, requirePermission('projects:manage'), projectCtrl.createProject);
router.get('/projects/:id/tasks', authenticateToken, projectCtrl.getTasksByProject);
router.put('/projects/tasks/:taskId', authenticateToken, projectCtrl.updateTaskStatus);
router.get('/documents', authenticateToken, projectCtrl.getDocuments);
router.get('/notices', projectCtrl.getNotices);

// ==========================================
// 13. CMS (NEWS, GALLERY, PRAYER REQUESTS)
// ==========================================
router.get('/cms/news-events', cmsCtrl.getNewsEvents);
router.get('/cms/news-events/:slug', cmsCtrl.getNewsEventBySlug);
router.get('/cms/gallery', cmsCtrl.getGallery);
router.post('/cms/prayer-requests', cmsCtrl.submitPrayerRequest);
router.get('/cms/prayer-requests', authenticateToken, cmsCtrl.getPrayerRequests);
router.put('/cms/prayer-requests/:id/dedicate', authenticateToken, cmsCtrl.dedicatePrayerRequest);

// ==========================================
// 14. PAYMENTS & WEBHOOKS
// ==========================================
router.post('/payments/create-order', paymentCtrl.createPaymentOrder);
router.post('/payments/verify', paymentCtrl.verifyPayment);
router.post('/payments/webhook', paymentCtrl.handleWebhook);
router.post('/payments/reconcile/:orderId', authenticateToken, paymentCtrl.reconcilePayment);

// ==========================================
// 15. SETTINGS, USERS, AUDIT LOG & REPORTS
// ==========================================
router.get('/settings', settingsCtrl.getSettings);
router.put('/settings', authenticateToken, requireRole('super_admin'), settingsCtrl.updateSettings);
router.get('/users', authenticateToken, requireRole('super_admin'), settingsCtrl.getUsers);
router.post('/users', authenticateToken, requireRole('super_admin'), settingsCtrl.createUser);
router.get('/roles-permissions', authenticateToken, settingsCtrl.getRolesAndPermissions);
router.get('/audit-logs', authenticateToken, requireRole('super_admin'), settingsCtrl.getAuditLogs);
router.post('/backup', authenticateToken, requireRole('super_admin'), settingsCtrl.triggerBackup);
router.get('/reports', authenticateToken, reportCtrl.getReports);
router.get('/search', authenticateToken, searchCtrl.globalSearch);

module.exports = router;
