const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getPopularItems,
  getUserRecommendations,
  getSimilarItems,
  retrainModel,
  getModelStatus,
  updateUserPreferences,
  getRecommendationAnalytics
} = require('../controllers/recommendation-controller');

const authMiddleware = require('../middlewares/auth-middleware');

// Get recommendations based on current cart items
router.post('/cart', getRecommendations);

// Get popular items (fallback when no cart items)
router.get('/popular', getPopularItems);

// Get user-specific recommendations based on order history
router.get('/user', authMiddleware,getUserRecommendations);

// Get similar items to a specific item
router.get('/similar/:itemId', getSimilarItems);

// Update user preferences (called after order completion)
router.post('/preferences', updateUserPreferences);

// Admin routes
// Retrain the recommendation model
router.post('/retrain', retrainModel);

// Get model status and statistics
router.get('/status', getModelStatus);

// Get recommendation analytics
router.get('/analytics', getRecommendationAnalytics);

module.exports = router; 