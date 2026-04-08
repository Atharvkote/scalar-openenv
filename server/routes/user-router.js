const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const { validate, validateQuery, validateParams } = require('../middlewares/validate-middleware');
const { 
    updateProfileSchema, 
    orderHistoryQuerySchema, 
    sessionIdSchema 
} = require('../validators/user-validator');

// Get all sessions for the logged-in user
router.get('/sessions', authMiddleware, userController.getAllSessions);

// Get all orders for a specific session
router.get('/session/:sessionId/orders', 
    authMiddleware, 
    validateParams(sessionIdSchema), 
    userController.getOrdersBySession
);

// Get the current active session for the user
router.get('/active-session', authMiddleware, userController.getActiveSession);

// Get user profile
router.get('/profile', authMiddleware, userController.getUserProfile);

// Update user profile
router.put('/profile', 
    authMiddleware, 
    validate(updateProfileSchema), 
    userController.updateUserProfile
);

// Get order history with pagination
router.get('/orders', 
    authMiddleware, 
    validateQuery(orderHistoryQuerySchema), 
    userController.getOrderHistory
);

module.exports = router;
