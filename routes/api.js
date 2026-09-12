const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireRole, requirePermission, requirePermissionOrRole } = require('../middleware/rbac');
const { upload } = require('../middleware/upload');

// Rate Limiters for Sensitive API Endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Reasonable threshold to allow admin work while preventing brute-force
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false }
});

const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Payment gateway rate limit reached. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false }
});

const publicFormRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many submissions. Please wait before submitting again.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false }
});

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
const volunteerCtrl = require('../controllers/volunteerController');
const newsletterCtrl = require('../controllers/newsletterController');
const healthCtrl = require('../controllers/healthController');
const trackingCtrl = require('../controllers/trackingController');

// ==========================================
// 0. SYSTEM HEALTH & DIAGNOSTICS
// ==========================================
router.get('/health', healthCtrl.getHealth);

// ==========================================
// 1. AUTHENTICATION & PORTAL LOGINS (Phase 1 Hardened)
// ==========================================
router.post('/auth/login', authRateLimiter, authCtrl.login);
router.post('/auth/register', authRateLimiter, authCtrl.register);
router.get('/auth/me', authenticateToken, authCtrl.me);
router.put('/auth/profile', authenticateToken, authCtrl.updateProfile);

// 2FA & Session Management
router.post('/auth/2fa/setup', authenticateToken, authCtrl.setup2FA);
router.post('/auth/2fa/verify', authenticateToken, authCtrl.verify2FA);
router.post('/auth/2fa/disable', authenticateToken, authCtrl.disable2FA);
router.post('/auth/refresh-token', authCtrl.refreshToken);
router.post('/auth/logout', optionalAuth, authCtrl.logout);
router.post('/auth/forgot-password', authRateLimiter, authCtrl.forgotPassword);
router.post('/auth/reset-password', authRateLimiter, authCtrl.resetPassword);

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
router.post('/blog', authenticateToken, requirePermissionOrRole('cms:blog', 'super_admin', 'staff'), blogCtrl.createBlogPost);
router.put('/blog/:id', authenticateToken, requirePermissionOrRole('cms:blog', 'super_admin', 'staff'), blogCtrl.updateBlogPost);
router.delete('/blog/:id', authenticateToken, requirePermissionOrRole('cms:blog', 'super_admin', 'staff'), blogCtrl.deleteBlogPost);

// ==========================================
// 4. LEARNING & DHARMA VIDEOS (Public & Admin)
// ==========================================
router.get('/learning', learningCtrl.getLearningMaterials);
router.post('/learning', authenticateToken, requirePermissionOrRole('cms:learning', 'super_admin', 'staff'), learningCtrl.createLearningMaterial);
router.put('/learning/:id', authenticateToken, requirePermissionOrRole('cms:learning', 'super_admin', 'staff'), learningCtrl.updateLearningMaterial);
router.delete('/learning/:id', authenticateToken, requirePermissionOrRole('cms:learning', 'super_admin', 'staff'), learningCtrl.deleteLearningMaterial);

// ==========================================
// 5. DONATIONS & CAMPAIGNS
// ==========================================
router.get('/campaigns/public', donationCtrl.getCampaigns);
router.post('/donations/public-offering', publicFormRateLimiter, donationCtrl.submitPublicOffering);
router.get('/tracking/:query', trackingCtrl.trackOffering);
router.get('/tracking', trackingCtrl.trackOffering);
router.get('/donations/campaigns', authenticateToken, donationCtrl.getCampaigns);
router.post('/donations/campaigns', authenticateToken, requirePermission('donations:campaigns'), donationCtrl.createCampaign);
router.put('/donations/campaigns/:id', authenticateToken, requirePermission('donations:campaigns'), donationCtrl.updateCampaign);
router.delete('/donations/campaigns/:id', authenticateToken, requirePermission('donations:campaigns'), donationCtrl.deleteCampaign);
router.put('/donations/campaigns/:id/status', authenticateToken, requirePermission('donations:campaigns'), donationCtrl.toggleCampaignStatus);

router.post('/donations', authenticateToken, requirePermission('donations:create'), donationCtrl.addDonation);
router.get('/donations', authenticateToken, requirePermission('donations:view'), donationCtrl.getAllDonations);
router.post('/donations/:id/refund', authenticateToken, requirePermissionOrRole('donations:refund', 'super_admin', 'accountant'), donationCtrl.refundDonation);
router.put('/donations/:id/verify', authenticateToken, requirePermissionOrRole('donations:create', 'super_admin', 'accountant'), donationCtrl.verifyDonationPayment);
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
router.put('/donors/:id', authenticateToken, requirePermission('donors:edit'), donorCtrl.updateDonor);
router.delete('/donors/:id', authenticateToken, requirePermission('donors:delete'), donorCtrl.deleteDonor);

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
router.get('/accounts/income', authenticateToken, requirePermission('accounts:view'), accountCtrl.getIncomeLedger);
router.get('/accounts/banks', authenticateToken, accountCtrl.getBankAccounts);
router.get('/accounts/categories', authenticateToken, accountCtrl.getExpenseCategories);
router.get('/accounts/expenses', authenticateToken, accountCtrl.getExpenses);
router.post('/accounts/expenses', authenticateToken, requirePermissionOrRole('accounts:expenses_submit', 'super_admin', 'accountant'), accountCtrl.submitExpense);
router.put('/accounts/expenses/:id', authenticateToken, requirePermissionOrRole('accounts:expenses_submit', 'super_admin', 'accountant'), accountCtrl.updateExpense);
router.delete('/accounts/expenses/:id', authenticateToken, requirePermissionOrRole('accounts:expenses_approve', 'super_admin', 'accountant'), accountCtrl.deleteExpense);
router.post('/accounts/expenses/:id/approve', authenticateToken, requirePermissionOrRole('accounts:expenses_approve', 'super_admin', 'accountant'), accountCtrl.approveExpense);
router.get('/accounts/vouchers', authenticateToken, accountCtrl.getVouchers);
router.post('/accounts/vouchers', authenticateToken, requirePermission('accounts:vouchers'), accountCtrl.createVoucher);

// ==========================================
// 9. INVENTORY & STORE
// ==========================================
router.get('/inventory/dashboard', authenticateToken, inventoryCtrl.getInventoryDashboard);
router.get('/inventory/items', authenticateToken, inventoryCtrl.getItems);
router.post('/inventory/items', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.createItem);
router.put('/inventory/items/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.updateStoreItem);
router.delete('/inventory/items/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.deleteStoreItem);
router.post('/inventory/stock-in', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.stockIn);
router.post('/inventory/stock-out', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.stockOut);
router.get('/inventory/transactions', authenticateToken, inventoryCtrl.getTransactions);
router.post('/inventory/transactions', authenticateToken, requirePermission('inventory:stock_txn'), inventoryCtrl.createTransaction);
router.get('/inventory/low-stock', authenticateToken, inventoryCtrl.getLowStockAlerts);

// Inventory Lookups CRUD (Categories, Units, Suppliers, Locations)
router.get('/inventory/categories', authenticateToken, inventoryCtrl.getCategories);
router.post('/inventory/categories', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.createCategory);
router.put('/inventory/categories/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.updateCategory);
router.delete('/inventory/categories/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.deleteCategory);

router.get('/inventory/units', authenticateToken, inventoryCtrl.getUnits);
router.post('/inventory/units', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.createUnit);
router.put('/inventory/units/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.updateUnit);
router.delete('/inventory/units/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.deleteUnit);

router.get('/inventory/suppliers', authenticateToken, inventoryCtrl.getSuppliers);
router.post('/inventory/suppliers', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.createSupplier);
router.put('/inventory/suppliers/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.updateSupplier);
router.delete('/inventory/suppliers/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.deleteSupplier);

router.get('/inventory/locations', authenticateToken, inventoryCtrl.getLocations);
router.post('/inventory/locations', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.createLocation);
router.put('/inventory/locations/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.updateLocation);
router.delete('/inventory/locations/:id', authenticateToken, requirePermission('inventory:manage_items'), inventoryCtrl.deleteLocation);

// ==========================================
// 10. CERTIFICATES
// ==========================================
router.get('/certificates/verify/:certNumber', publicFormRateLimiter, certCtrl.verifyCertificate);
router.get('/certificates', authenticateToken, certCtrl.getCertificates);
router.post('/certificates/issue', authenticateToken, requirePermissionOrRole('lms:issue_certificate', 'super_admin', 'admin'), certCtrl.issueCertificate);
router.put('/certificates/:id', authenticateToken, requirePermissionOrRole('lms:issue_certificate', 'super_admin', 'admin'), certCtrl.updateCertificate);
router.delete('/certificates/:id', authenticateToken, requirePermissionOrRole('lms:issue_certificate', 'super_admin', 'admin'), certCtrl.deleteCertificate);
router.get('/certificates/:id/pdf', certCtrl.downloadCertificatePdf);
router.post('/certificates/:id/revoke', authenticateToken, requireRole('super_admin'), certCtrl.revokeCertificate);
router.put('/certificates/:id/revoke', authenticateToken, requireRole('super_admin'), certCtrl.revokeCertificate);

// ==========================================
// 10.1. SHEDRA MONASTIC ACADEMY & LMS
// ==========================================
router.get('/courses/public', lmsCtrl.getPublicCourses);
router.get('/lms/overview', authenticateToken, lmsCtrl.getLmsOverview);
router.get('/lms/courses', authenticateToken, lmsCtrl.getCourses);
router.get('/lms/courses/:id', authenticateToken, lmsCtrl.getCourseById);
router.post('/lms/courses', authenticateToken, requirePermissionOrRole('lms:courses', 'super_admin', 'admin'), lmsCtrl.createCourse);
router.put('/lms/courses/:id', authenticateToken, requirePermissionOrRole('lms:courses', 'super_admin', 'admin'), lmsCtrl.updateCourse);
router.delete('/lms/courses/:id', authenticateToken, requirePermissionOrRole('lms:courses', 'super_admin', 'admin'), lmsCtrl.deleteCourse);
router.get('/lms/batches', authenticateToken, lmsCtrl.getBatches);
router.post('/lms/batches', authenticateToken, requirePermissionOrRole('lms:batches', 'super_admin', 'admin'), lmsCtrl.createBatch);
router.put('/lms/batches/:id', authenticateToken, requirePermissionOrRole('lms:batches', 'super_admin', 'admin'), lmsCtrl.updateBatch);
router.delete('/lms/batches/:id', authenticateToken, requirePermissionOrRole('lms:batches', 'super_admin', 'admin'), lmsCtrl.deleteBatch);
router.get('/lms/enrollments', authenticateToken, lmsCtrl.getEnrollments);
router.post('/lms/enrollments', authenticateToken, requirePermissionOrRole('lms:enrollments', 'super_admin', 'admin'), lmsCtrl.createEnrollment);
router.put('/lms/enrollments/:id/progress', authenticateToken, lmsCtrl.updateEnrollmentProgress);
router.delete('/lms/enrollments/:id', authenticateToken, requirePermissionOrRole('lms:enrollments', 'super_admin', 'admin'), lmsCtrl.deleteEnrollment);
router.get('/lms/students', authenticateToken, lmsCtrl.getStudents);
router.post('/lms/students', authenticateToken, requirePermissionOrRole('lms:students', 'super_admin', 'admin'), lmsCtrl.createStudent);
router.put('/lms/students/:id', authenticateToken, requirePermissionOrRole('lms:students', 'super_admin', 'admin'), lmsCtrl.updateStudent);
router.delete('/lms/students/:id', authenticateToken, requirePermissionOrRole('lms:students', 'super_admin', 'admin'), lmsCtrl.deleteStudent);

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
router.post('/hrm/employees', authenticateToken, requirePermissionOrRole('hrm:manage_employees', 'super_admin', 'admin'), hrmCtrl.createEmployee);
router.put('/hrm/employees/:id', authenticateToken, requirePermissionOrRole('hrm:manage_employees', 'super_admin', 'admin'), hrmCtrl.updateEmployee);
router.delete('/hrm/employees/:id', authenticateToken, requirePermissionOrRole('hrm:manage_employees', 'super_admin', 'admin'), hrmCtrl.deleteEmployee);
router.get('/hrm/attendance', authenticateToken, hrmCtrl.getAttendance);
router.post('/hrm/attendance', authenticateToken, requirePermissionOrRole('hrm:attendance', 'super_admin', 'admin'), hrmCtrl.markAttendance);
router.get('/hrm/leave', authenticateToken, hrmCtrl.getLeaveRequests);
router.post('/hrm/leave', authenticateToken, hrmCtrl.submitLeaveRequest);
router.post('/hrm/leave/:id/approve', authenticateToken, requirePermissionOrRole('hrm:leave_approve', 'super_admin', 'admin'), hrmCtrl.approveLeaveRequest);

// ==========================================
// 12. PAYROLL & CASUAL LABOR
// ==========================================
router.get('/payroll/runs', authenticateToken, payrollCtrl.getPayrollRuns);
router.post('/payroll/generate', authenticateToken, requirePermissionOrRole('payroll:manage', 'super_admin', 'accountant'), payrollCtrl.generatePayrollRun);
router.post('/payroll/runs/:id/void', authenticateToken, requirePermissionOrRole('payroll:manage', 'super_admin', 'accountant'), payrollCtrl.voidPayrollRun);
router.get('/payroll/runs/:id/slips', authenticateToken, payrollCtrl.getSalarySlipsByRun);
router.put('/payroll/slips/:id', authenticateToken, requirePermissionOrRole('payroll:manage', 'super_admin', 'accountant'), payrollCtrl.updateSalarySlip);
router.get('/payroll/slips/:id/pdf', payrollCtrl.downloadSalarySlipPdf);
router.get('/payroll/casual-labor', authenticateToken, payrollCtrl.getCasualLabor);
router.post('/payroll/casual-labor', authenticateToken, requirePermissionOrRole('payroll:casual_labor', 'super_admin', 'accountant'), payrollCtrl.createCasualLabor);

// ==========================================
// 13. CRM & COMMUNICATIONS
// ==========================================
router.post('/crm/inquiries', publicFormRateLimiter, crmCtrl.submitPublicInquiry);
router.post('/contacts', publicFormRateLimiter, crmCtrl.submitPublicInquiry);
router.get('/crm/contacts', authenticateToken, crmCtrl.getContacts);
router.post('/crm/contacts', authenticateToken, requirePermissionOrRole('crm:manage_contacts', 'super_admin', 'admin'), crmCtrl.createContact);
router.put('/crm/contacts/:id', authenticateToken, requirePermissionOrRole('crm:manage_contacts', 'super_admin', 'admin'), crmCtrl.updateContact);
router.delete('/crm/contacts/:id', authenticateToken, requirePermissionOrRole('crm:manage_contacts', 'super_admin', 'admin'), crmCtrl.deleteContact);
router.get('/crm/contacts/:id/communications', authenticateToken, crmCtrl.getCommunicationsByContact);
router.post('/crm/contacts/:id/communications', authenticateToken, crmCtrl.addCommunication);
router.get('/crm/campaigns', authenticateToken, crmCtrl.getEmailCampaigns);
router.post('/crm/campaigns/broadcast', authenticateToken, requirePermissionOrRole('crm:campaigns', 'super_admin', 'admin'), crmCtrl.broadcastCampaign);

// ==========================================
// 14. PROJECTS, TASKS, DOCUMENTS & NOTICES
// ==========================================
router.get('/projects', projectCtrl.getProjects);
router.post('/projects', authenticateToken, requirePermissionOrRole('projects:manage', 'super_admin', 'admin'), projectCtrl.createProject);
router.put('/projects/:id', authenticateToken, requirePermissionOrRole('projects:manage', 'super_admin', 'admin'), projectCtrl.updateProject);
router.delete('/projects/:id', authenticateToken, requirePermissionOrRole('projects:manage', 'super_admin', 'admin'), projectCtrl.deleteProject);

router.get('/projects/tasks', authenticateToken, projectCtrl.getAllTasks);
router.post('/projects/tasks', authenticateToken, requirePermissionOrRole('projects:manage', 'super_admin', 'admin'), projectCtrl.createTask);
router.get('/projects/:id/tasks', authenticateToken, projectCtrl.getTasksByProject);
router.put('/projects/tasks/:taskId', authenticateToken, projectCtrl.updateTaskStatus);
router.delete('/projects/tasks/:taskId', authenticateToken, requirePermissionOrRole('projects:manage', 'super_admin', 'admin'), projectCtrl.deleteTask);

router.get('/documents', authenticateToken, projectCtrl.getDocuments);
router.post('/documents', authenticateToken, requirePermissionOrRole('projects:manage', 'super_admin', 'admin'), upload.single('file'), projectCtrl.createDocument);
router.put('/documents/:id', authenticateToken, requirePermissionOrRole('projects:manage', 'super_admin', 'admin'), projectCtrl.updateDocument);
router.delete('/documents/:id', authenticateToken, requirePermissionOrRole('projects:manage', 'super_admin', 'admin'), projectCtrl.deleteDocument);

router.get('/notices', projectCtrl.getNotices);
router.post('/notices', authenticateToken, requirePermissionOrRole('cms:manage', 'super_admin', 'admin'), projectCtrl.createNotice);
router.put('/notices/:id', authenticateToken, requirePermissionOrRole('cms:manage', 'super_admin', 'admin'), projectCtrl.updateNotice);
router.delete('/notices/:id', authenticateToken, requirePermissionOrRole('cms:manage', 'super_admin', 'admin'), projectCtrl.deleteNotice);

// ==========================================
// 15. CMS (NEWS, GALLERY, PRAYER REQUESTS)
// ==========================================
router.get('/cms/news-events', cmsCtrl.getNewsEvents);
router.get('/cms/news-events/:slug', cmsCtrl.getNewsEventBySlug);
router.post('/cms/news-events', authenticateToken, requirePermissionOrRole('cms:manage', 'super_admin', 'admin', 'staff'), cmsCtrl.createNewsEvent);
router.put('/cms/news-events/:id', authenticateToken, requirePermissionOrRole('cms:manage', 'super_admin', 'admin', 'staff'), cmsCtrl.updateNewsEvent);
router.delete('/cms/news-events/:id', authenticateToken, requirePermissionOrRole('cms:manage', 'super_admin', 'admin', 'staff'), cmsCtrl.deleteNewsEvent);

router.get('/cms/gallery', cmsCtrl.getGallery);
router.post('/cms/gallery', authenticateToken, cmsCtrl.createGalleryItem);
router.put('/cms/gallery/:id', authenticateToken, cmsCtrl.updateGalleryItem);
router.delete('/cms/gallery/:id', authenticateToken, cmsCtrl.deleteGalleryItem);

router.post('/cms/prayer-requests', publicFormRateLimiter, cmsCtrl.submitPrayerRequest);
router.get('/cms/prayer-requests', authenticateToken, cmsCtrl.getPrayerRequests);
router.put('/cms/prayer-requests/:id/dedicate', authenticateToken, cmsCtrl.dedicatePrayerRequest);
router.put('/cms/prayer-requests/:id/status', authenticateToken, cmsCtrl.dedicatePrayerRequest);

// Event RSVPs
router.post('/cms/events/:eventId/rsvp', publicFormRateLimiter, cmsCtrl.submitEventRsvp);
router.post('/cms/events/rsvp', publicFormRateLimiter, cmsCtrl.submitEventRsvp);
router.get('/cms/events/:eventId/rsvps', authenticateToken, cmsCtrl.getEventRsvps);
router.put('/cms/rsvps/:id/status', authenticateToken, requirePermissionOrRole('cms:manage', 'super_admin', 'admin'), cmsCtrl.updateRsvpStatus);

// ==========================================
// 15.1. VOLUNTEERS & COMMUNITY
// ==========================================
router.post('/volunteers/apply', publicFormRateLimiter, volunteerCtrl.applyVolunteer);
router.get('/volunteers', authenticateToken, requirePermissionOrRole('volunteers:view', 'super_admin', 'admin', 'staff'), volunteerCtrl.getVolunteers);
router.get('/volunteers/:id', authenticateToken, requirePermissionOrRole('volunteers:view', 'super_admin', 'admin', 'staff'), volunteerCtrl.getVolunteerById);
router.put('/volunteers/:id/status', authenticateToken, requirePermissionOrRole('volunteers:manage', 'super_admin', 'admin'), volunteerCtrl.updateVolunteerStatus);
router.delete('/volunteers/:id', authenticateToken, requirePermissionOrRole('volunteers:manage', 'super_admin', 'admin'), volunteerCtrl.deleteVolunteer);

// ==========================================
// 15.2. NEWSLETTER & DHARMA DISPATCHES
// ==========================================
router.post('/newsletter/subscribe', publicFormRateLimiter, newsletterCtrl.subscribe);
router.post('/newsletter/unsubscribe', newsletterCtrl.unsubscribe);
router.get('/newsletter/unsubscribe', newsletterCtrl.unsubscribe);
router.get('/newsletter/subscribers', authenticateToken, requirePermissionOrRole('crm:campaigns', 'super_admin', 'admin'), newsletterCtrl.getSubscribers);

// ==========================================
// 16. GENERIC MEDIA UPLOAD (Videos, Docs & Images)
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
// 17. PAYMENTS & WEBHOOKS (Rate Limited & Timing-Safe)
// ==========================================
router.post('/payments/create-order', paymentRateLimiter, paymentCtrl.createPaymentOrder);
router.post('/payments/verify', paymentRateLimiter, paymentCtrl.verifyPayment);
router.post('/payments/webhook', paymentCtrl.handleWebhook);
router.post('/payments/reconcile/:orderId', authenticateToken, paymentCtrl.reconcilePayment);

// ==========================================
// 18. SETTINGS, USERS, AUDIT LOG & REPORTS
// ==========================================
router.get('/settings', settingsCtrl.getSettings);
router.put('/settings', authenticateToken, requirePermissionOrRole('settings:edit', 'super_admin', 'admin'), settingsCtrl.updateSettings);
router.post('/settings', authenticateToken, requirePermissionOrRole('settings:edit', 'super_admin', 'admin'), settingsCtrl.updateSettings);
router.get('/users', authenticateToken, requireRole('super_admin'), settingsCtrl.getUsers);
router.post('/users', authenticateToken, requireRole('super_admin'), settingsCtrl.createUser);
router.put('/users/:id', authenticateToken, requireRole('super_admin'), settingsCtrl.updateUser);
router.delete('/users/:id', authenticateToken, requireRole('super_admin'), settingsCtrl.deleteUser);
router.post('/users/:id/reset-password', authenticateToken, requireRole('super_admin'), settingsCtrl.resetUserPasswordByAdmin);
router.put('/users/:id/status', authenticateToken, requireRole('super_admin'), settingsCtrl.toggleUserStatus);
router.put('/users/:id/role', authenticateToken, requireRole('super_admin'), settingsCtrl.changeUserRole);
router.get('/users/:id/sessions', authenticateToken, requireRole('super_admin'), settingsCtrl.getUserSessions);
router.post('/users/:id/revoke-sessions', authenticateToken, requireRole('super_admin'), settingsCtrl.revokeAllUserSessions);
router.delete('/sessions/:sessionId', authenticateToken, requireRole('super_admin'), settingsCtrl.revokeSession);
router.post('/sessions/kill-all', authenticateToken, requireRole('super_admin'), settingsCtrl.revokeAllSessionsGlobal);
router.get('/roles-permissions', authenticateToken, settingsCtrl.getRolesAndPermissions);
router.put('/roles/:id/permissions', authenticateToken, requireRole('super_admin'), settingsCtrl.updateRolePermissions);
router.get('/audit-logs', authenticateToken, requireRole('super_admin'), settingsCtrl.getAuditLogs);
router.get('/settings/audit-logs', authenticateToken, requireRole('super_admin'), settingsCtrl.getAuditLogs);
router.get('/audit-logs/verify', authenticateToken, requireRole('super_admin'), settingsCtrl.verifyAuditLogs);
router.post('/backup', authenticateToken, requireRole('super_admin'), settingsCtrl.triggerBackup);
router.post('/settings/backup', authenticateToken, requireRole('super_admin'), settingsCtrl.triggerBackup);
router.get('/reports', authenticateToken, reportCtrl.getReports);
router.get('/reports/:module/export', authenticateToken, reportCtrl.getReports);
router.get('/admin/dashboard', authenticateToken, reportCtrl.getAdminDashboardMetrics);
router.get('/admin/notifications', authenticateToken, reportCtrl.getAdminNotifications);
router.get('/search', authenticateToken, searchCtrl.globalSearch);

module.exports = router;
