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
const blogCtrl = require('../controllers/blogController');
const learningCtrl = require('../controllers/learningController');
const userPanelCtrl = require('../controllers/userPanelController');
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
// 2. UNIFIED USER PANEL (For Donors & Members)
// ==========================================
router.get('/user/my-dashboard', authenticateToken, userPanelCtrl.getUserDashboard);
router.put('/user/my-profile', authenticateToken, userPanelCtrl.updateUserProfile);

// ==========================================
// 3. BLOG POSTS (Public & Admin)
// ==========================================
router.get('/blog', optionalAuth, blogCtrl.getBlogPosts);
router.get('/blog/:slug', blogCtrl.getBlogPostBySlug);
router.post('/blog', authenticateToken, requirePermission('cms:blog') || requireRole('super_admin', 'staff'), blogCtrl.createBlogPost);
router.put('/blog/:id', authenticateToken, requirePermission('cms:blog') || requireRole('super_admin', 'staff'), blogCtrl.updateBlogPost);
router.delete('/blog/:id', authenticateToken, requirePermission('cms:blog') || requireRole('super_admin', 'staff'), blogCtrl.deleteBlogPost);

// ==========================================
// 4. LEARNING & DHARMA VIDEOS (Public & Admin)
// ==========================================
router.get('/learning', learningCtrl.getLearningMaterials);
router.post('/learning', authenticateToken, requirePermission('cms:learning') || requireRole('super_admin', 'staff'), learningCtrl.createLearningMaterial);
router.put('/learning/:id', authenticateToken, requirePermission('cms:learning') || requireRole('super_admin', 'staff'), learningCtrl.updateLearningMaterial);
router.delete('/learning/:id', authenticateToken, requirePermission('cms:learning') || requireRole('super_admin', 'staff'), learningCtrl.deleteLearningMaterial);

// ==========================================
// 5. DONATIONS & CAMPAIGNS
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
// 6. DONORS DIRECTORY
// ==========================================
router.get('/donors', authenticateToken, donorCtrl.getDonors);
router.post('/donors', authenticateToken, donorCtrl.createDonor);
router.get('/donors/:id', authenticateToken, donorCtrl.getDonorById);

// Donor Portal Backward Compatibility
router.get('/donor/my-dashboard', authenticateToken, userPanelCtrl.getUserDashboard);
router.get('/donor/my-donations', authenticateToken, donorCtrl.getMyDonations);
router.put('/donor/my-profile', authenticateToken, userPanelCtrl.updateUserProfile);

// ==========================================
// 7. MONEY RECEIPTS & PDF
// ==========================================
router.post('/receipts/issue', authenticateToken, requirePermission('receipts:issue'), receiptCtrl.issueReceipt);
router.get('/receipts', authenticateToken, requirePermission('receipts:view'), receiptCtrl.getReceipts);
router.get('/receipts/:id', authenticateToken, receiptCtrl.getReceiptById);
router.get('/receipts/:id/pdf', receiptCtrl.downloadReceiptPdf);
router.post('/receipts/:id/void', authenticateToken, requirePermission('receipts:void'), receiptCtrl.voidReceipt);

// ==========================================
// 8. ACCOUNTS & FINANCE
// ==========================================
router.get('/accounts/dashboard', authenticateToken, requirePermission('accounts:view'), accountCtrl.getAccountsDashboard);
router.get('/accounts/banks', authenticateToken, accountCtrl.getBankAccounts);
router.get('/accounts/categories', authenticateToken, accountCtrl.getExpenseCategories);
router.get('/accounts/expenses', authenticateToken, accountCtrl.getExpenses);
router.post('/accounts/expenses', authenticateToken, requirePermission('accounts:expenses_submit'), accountCtrl.submitExpense);
router.post('/accounts/expenses/:id/approve', authenticateToken, requirePermission('accounts:expenses_approve'), accountCtrl.approveExpense);
router.get('/accounts/vouchers', authenticateToken, accountCtrl.getVouchers);
router.post('/accounts/vouchers', authenticateToken, requirePermission('accounts:vouchers'), accountCtrl.createVoucher);

// ==========================================
// 9. INVENTORY & STORE
// ==========================================
router.get('/inventory/items', authenticateToken, inventoryCtrl.getItems);
router.post('/inventory/items', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.createItem);
router.get('/inventory/transactions', authenticateToken, inventoryCtrl.getTransactions);
router.post('/inventory/transactions', authenticateToken, requirePermission('inventory:stock_txn'), inventoryCtrl.createTransaction);
router.get('/inventory/low-stock', authenticateToken, inventoryCtrl.getLowStockAlerts);

// ==========================================
// 10. CERTIFICATES
// ==========================================
router.get('/certificates/verify/:certNumber', certCtrl.verifyCertificate);
router.get('/certificates', authenticateToken, certCtrl.getCertificates);
router.post('/certificates/issue', authenticateToken, certCtrl.issueCertificate);
router.get('/certificates/:id/pdf', certCtrl.downloadCertificatePdf);
router.post('/certificates/:id/revoke', authenticateToken, requireRole('super_admin'), certCtrl.revokeCertificate);

// ==========================================
// 10.1. SHEDRA MONASTIC ACADEMY & LMS
// ==========================================
router.get('/lms/overview', authenticateToken, lmsCtrl.getLmsOverview);
router.get('/lms/courses', authenticateToken, lmsCtrl.getCourses);
router.get('/lms/courses/:id', authenticateToken, lmsCtrl.getCourseById);
router.post('/lms/courses', authenticateToken, lmsCtrl.createCourse);
router.get('/lms/batches', authenticateToken, lmsCtrl.getBatches);
router.post('/lms/batches', authenticateToken, lmsCtrl.createBatch);
router.get('/lms/enrollments', authenticateToken, lmsCtrl.getEnrollments);
router.post('/lms/enrollments', authenticateToken, lmsCtrl.createEnrollment);
router.put('/lms/enrollments/:id/progress', authenticateToken, lmsCtrl.updateEnrollmentProgress);
router.get('/lms/students', authenticateToken, lmsCtrl.getStudents);
router.post('/lms/students', authenticateToken, lmsCtrl.createStudent);

// ==========================================
// 10.2. MONASTIC STUDENT & SCHOLAR PORTAL
// ==========================================
router.get('/student/dashboard', authenticateToken, lmsCtrl.getStudentDashboard);
router.get('/student/courses', authenticateToken, lmsCtrl.getStudentCourses);
router.get('/student/courses/:id', authenticateToken, lmsCtrl.getStudentCourseById);
router.post('/student/enroll', authenticateToken, lmsCtrl.studentSelfEnroll);
router.post('/student/courses/:id/progress', authenticateToken, lmsCtrl.updateStudentLessonProgress);
router.get('/student/certificates', authenticateToken, lmsCtrl.getStudentCertificates);

// ==========================================
// 11. HRM & ATTENDANCE
// ==========================================
router.get('/hrm/employees', authenticateToken, hrmCtrl.getEmployees);
router.post('/hrm/employees', authenticateToken, requirePermission('hrm:manage_employees'), hrmCtrl.createEmployee);
router.get('/hrm/attendance', authenticateToken, hrmCtrl.getAttendance);
router.post('/hrm/attendance', authenticateToken, requirePermission('hrm:attendance'), hrmCtrl.markAttendance);
router.get('/hrm/leave', authenticateToken, hrmCtrl.getLeaveRequests);
router.post('/hrm/leave', authenticateToken, hrmCtrl.submitLeaveRequest);
router.post('/hrm/leave/:id/approve', authenticateToken, requirePermission('hrm:leave_approve'), hrmCtrl.approveLeaveRequest);

// ==========================================
// 12. PAYROLL & CASUAL LABOR
// ==========================================
router.get('/payroll/runs', authenticateToken, payrollCtrl.getPayrollRuns);
router.post('/payroll/generate', authenticateToken, requirePermission('payroll:manage'), payrollCtrl.generatePayrollRun);
router.get('/payroll/runs/:id/slips', authenticateToken, payrollCtrl.getSalarySlipsByRun);
router.get('/payroll/slips/:id/pdf', payrollCtrl.downloadSalarySlipPdf);
router.get('/payroll/casual-labor', authenticateToken, payrollCtrl.getCasualLabor);
router.post('/payroll/casual-labor', authenticateToken, requirePermission('payroll:casual_labor'), payrollCtrl.createCasualLabor);

// ==========================================
// 13. CRM & COMMUNICATIONS
// ==========================================
router.get('/crm/contacts', authenticateToken, crmCtrl.getContacts);
router.post('/crm/contacts', authenticateToken, requirePermission('crm:manage_contacts'), crmCtrl.createContact);
router.get('/crm/contacts/:id/communications', authenticateToken, crmCtrl.getCommunicationsByContact);
router.post('/crm/contacts/:id/communications', authenticateToken, crmCtrl.addCommunication);
router.post('/crm/campaigns/broadcast', authenticateToken, requirePermission('crm:campaigns'), crmCtrl.broadcastCampaign);

// ==========================================
// 14. PROJECTS, TASKS, DOCUMENTS & NOTICES
// ==========================================
router.get('/projects', projectCtrl.getProjects);
router.post('/projects', authenticateToken, requirePermission('projects:manage'), projectCtrl.createProject);
router.get('/projects/tasks', authenticateToken, projectCtrl.getAllTasks);
router.post('/projects/tasks', authenticateToken, requirePermission('projects:manage'), projectCtrl.createTask);
router.get('/projects/:id/tasks', authenticateToken, projectCtrl.getTasksByProject);
router.put('/projects/tasks/:taskId', authenticateToken, projectCtrl.updateTaskStatus);
router.get('/documents', authenticateToken, projectCtrl.getDocuments);
router.get('/notices', projectCtrl.getNotices);

// ==========================================
// 15. CMS (NEWS, GALLERY, PRAYER REQUESTS)
// ==========================================
router.get('/cms/news-events', cmsCtrl.getNewsEvents);
router.get('/cms/news-events/:slug', cmsCtrl.getNewsEventBySlug);

router.get('/cms/gallery', cmsCtrl.getGallery);
router.post('/cms/gallery', authenticateToken, cmsCtrl.createGalleryItem);
router.put('/cms/gallery/:id', authenticateToken, cmsCtrl.updateGalleryItem);
router.delete('/cms/gallery/:id', authenticateToken, cmsCtrl.deleteGalleryItem);

router.post('/cms/prayer-requests', cmsCtrl.submitPrayerRequest);
router.get('/cms/prayer-requests', authenticateToken, cmsCtrl.getPrayerRequests);
router.put('/cms/prayer-requests/:id/dedicate', authenticateToken, cmsCtrl.dedicatePrayerRequest);

// ==========================================
// 16. GENERIC MEDIA UPLOAD (Videos & Images)
// ==========================================
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// ==========================================
// 17. PAYMENTS & WEBHOOKS
// ==========================================
router.post('/payments/create-order', paymentCtrl.createPaymentOrder);
router.post('/payments/verify', paymentCtrl.verifyPayment);
router.post('/payments/webhook', paymentCtrl.handleWebhook);
router.post('/payments/reconcile/:orderId', authenticateToken, paymentCtrl.reconcilePayment);

// ==========================================
// 18. SETTINGS, USERS, AUDIT LOG & REPORTS
// ==========================================
router.get('/settings', settingsCtrl.getSettings);
router.put('/settings', authenticateToken, requireRole('super_admin'), settingsCtrl.updateSettings);
router.get('/users', authenticateToken, requireRole('super_admin'), settingsCtrl.getUsers);
router.post('/users', authenticateToken, requireRole('super_admin'), settingsCtrl.createUser);
router.get('/roles-permissions', authenticateToken, settingsCtrl.getRolesAndPermissions);
router.get('/audit-logs', authenticateToken, requireRole('super_admin'), settingsCtrl.getAuditLogs);
router.post('/backup', authenticateToken, requireRole('super_admin'), settingsCtrl.triggerBackup);
router.get('/reports', authenticateToken, reportCtrl.getReports);
router.get('/reports/:module/export', authenticateToken, reportCtrl.getReports);
router.get('/admin/dashboard', authenticateToken, reportCtrl.getAdminDashboardMetrics);
router.get('/search', authenticateToken, searchCtrl.globalSearch);

module.exports = router;
