const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const adminMiddleware = require('../middlewares/admin-middleware');

// Apply auth and admin middleware to all routes
// router.use(authMiddleware);
// router.use(adminMiddleware);

// ===========================================
// USER MANAGEMENT ROUTES
// ===========================================

// Get all users with pagination and filtering
router.get('/users', adminController.getAllUsers);

// Get user statistics
router.get('/users/stats', adminController.getUserStats);

// Get single user by ID
router.get('/users/:userId', adminController.getUserById);

// Create new user
router.post('/users', adminController.createUser);

// Update user
router.put('/users/:userId', adminController.updateUser);

// Delete user
router.delete('/users/:userId', adminController.deleteUser);

// ===========================================
// ORDER MANAGEMENT ROUTES
// ===========================================

// Update product status in order
router.patch('/orders/:orderId/products/:productId/status', adminController.updateProductStatus);

// ===========================================
// SESSION MANAGEMENT ROUTES
// ===========================================

// Get session management data
router.get('/sessions', adminController.getSessionManagementData);

module.exports = router; 