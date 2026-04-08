const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/AuthController');
const materialController = require('../controllers/MaterialController');
const subController = require('../controllers/SubscriptionController');
const analyticsController = require('../controllers/AnalyticsController');
const userManagementController = require('../controllers/UserManagementController');
const exportController = require('../controllers/ExportController');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/admin');
const upload = require('../config/multer');
// ========== ROTAS PÚBLICAS ==========
router.post('/register', authController.register);
router.post('/login', authController.login);

// ========== ROTAS AUTENTICADAS ==========
router.get('/materials', authMiddleware, materialController.getMaterials);
router.post('/materials', authMiddleware, upload.single('file'), materialController.createMaterial);
router.post('/subscribe', authMiddleware, subController.createCheckout);
router.get('/categories', (req, res) => res.json({ status: "ok" }));

// ========== ROTAS ADMIN - ANALYTICS ==========
router.get('/admin/analytics/dashboard', authMiddleware, adminMiddleware, analyticsController.getDashboardStats);
router.get('/admin/analytics/user-growth', authMiddleware, adminMiddleware, analyticsController.getUserGrowth);
router.get('/admin/analytics/materials-by-subject', authMiddleware, adminMiddleware, analyticsController.getMaterialsBySubject);
router.get('/admin/analytics/materials-by-grade', authMiddleware, adminMiddleware, analyticsController.getMaterialsByGrade);
router.get('/admin/analytics/materials-by-condition', authMiddleware, adminMiddleware, analyticsController.getMaterialsByCondition);
router.get('/admin/analytics/recent-activity', authMiddleware, adminMiddleware, analyticsController.getRecentActivity);

// ========== ROTAS ADMIN - GESTÃO DE USUÁRIOS ==========
router.get('/admin/users', authMiddleware, adminMiddleware, userManagementController.getAllUsers);
router.get('/admin/users/:id', authMiddleware, adminMiddleware, userManagementController.getUserById);
router.put('/admin/users/:id', authMiddleware, adminMiddleware, userManagementController.updateUser);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, userManagementController.deleteUser);
router.patch('/admin/users/:id/upgrade-premium', authMiddleware, adminMiddleware, userManagementController.upgradeToPremium);
router.patch('/admin/users/:id/downgrade-free', authMiddleware, adminMiddleware, userManagementController.downgradeToFree);
router.patch('/admin/users/:id/promote-admin', authMiddleware, adminMiddleware, userManagementController.promoteToAdmin);
router.patch('/admin/users/:id/demote-user', authMiddleware, adminMiddleware, userManagementController.demoteToUser);

// ========== ROTAS ADMIN - EXPORTAÇÕES ==========
router.get('/admin/export/users/excel', authMiddleware, adminMiddleware, exportController.exportUsersToExcel);
router.get('/admin/export/users/csv', authMiddleware, adminMiddleware, exportController.exportUsersToCSV);
router.get('/admin/export/materials/excel', authMiddleware, adminMiddleware, exportController.exportMaterialsToExcel);
router.get('/admin/export/report/pdf', authMiddleware, adminMiddleware, exportController.generatePDFReport);

module.exports = router;
