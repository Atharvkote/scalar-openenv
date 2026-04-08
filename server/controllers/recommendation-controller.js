const RecommendationEngine = require('../utils/recommendation-engine');
const Service = require('../database/models/service-model');
const UserPreference = require('../database/models/recommendation-model').UserPreference;
const logger = require('../utils/logger');

// Initialize the recommendation engine (moved to server.js after DB connection)
const recommendationEngine = new RecommendationEngine();

// Export an async function to initialize the engine
async function initializeRecommendationEngine() {
  try {
    await recommendationEngine.initialize();
    logger.info('Recommendation engine initialized successfully (from exported function)');
  } catch (error) {
    logger.error('Failed to initialize recommendation engine:', error);
  }
}

// Get recommendations based on current cart
const getRecommendations = async (req, res, next) => {
  try {
    const { cartItems, limit = 5 } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: 'Cart items array is required'
      });
    }

    logger.info(`Getting recommendations for cart with ${cartItems.length} items`);

    const recommendations = await recommendationEngine.getRecommendations(
      cartItems,
      userId,
      limit
    );

    res.status(200).json({
      success: true,
      data: recommendations,
      message: 'Recommendations retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting recommendations:', error);
    next(error);
  }
};

// Get popular items (fallback when no cart items)
const getPopularItems = async (req, res, next) => {
  try {
    const { limit = 10, category } = req.query;
    const userId = req.user?.id;

    let query = { available: true };
    if (category) {
      query.category = category;
    }

    // Get items with their popularity scores
    const popularItems = await Service.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'products.service',
          as: 'orderCount'
        }
      },
      {
        $addFields: {
          popularity: { $size: '$orderCount' }
        }
      },
      { $sort: { popularity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Filter based on user preferences if available
    if (userId) {
      const userPrefs = await UserPreference.findOne({ userId });
      if (userPrefs) {
        const filteredItems = popularItems.filter(item => {
          // Check dietary restrictions
          if (userPrefs.preferences.dietaryRestrictions.includes('vegetarian') && !item.vegetarian) {
            return false;
          }
          if (userPrefs.preferences.dietaryRestrictions.includes('non-spicy') && item.spicy) {
            return false;
          }
          
          // Check price range
          if (item.price < userPrefs.preferences.priceRange.min || 
              item.price > userPrefs.preferences.priceRange.max) {
            return false;
          }
          
          return true;
        });
        
        return res.status(200).json({
          success: true,
          data: filteredItems,
          message: 'Popular items retrieved successfully'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: popularItems,
      message: 'Popular items retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting popular items:', error);
    next(error);
  }
};

// Get user-specific recommendations based on order history
const getUserRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?._id.toString() || req.user?.id; // From auth middleware
    console.log('User ID:', userId);
    const { limit = 5 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Get user preferences
    const userPrefs = await UserPreference.findOne({ userId });
    
    if (!userPrefs || userPrefs.preferences.favoriteItems.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No user preferences available'
      });
    }

    // Get recommendations based on favorite items
    const favoriteItemIds = userPrefs.preferences.favoriteItems
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map(item => item.serviceId.toString());

    const recommendations = await recommendationEngine.getRecommendations(
      favoriteItemIds,
      userId,
      limit
    );

    res.status(200).json({
      success: true,
      data: recommendations,
      message: 'User recommendations retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting user recommendations:', error);
    next(error);
  }
};

// Get similar items to a specific item
const getSimilarItems = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { limit = 5 } = req.query;
    const userId = req.user?.id;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Get similar items using co-occurrence
    const similarItems = await recommendationEngine.getRecommendations(
      [itemId],
      userId,
      limit
    );

    res.status(200).json({
      success: true,
      data: similarItems,
      message: 'Similar items retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting similar items:', error);
    next(error);
  }
};

// Retrain the recommendation model
const retrainModel = async (req, res, next) => {
  try {
    // Check if user is admin (you might want to add admin middleware)
    if (!req.user?.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    logger.info('Starting model retraining...');

    // Start retraining in background
    recommendationEngine.trainModel()
      .then(() => {
        logger.info('Model retraining completed successfully');
      })
      .catch((error) => {
        logger.error('Model retraining failed:', error);
      });

    res.status(200).json({
      success: true,
      message: 'Model retraining started successfully'
    });

  } catch (error) {
    logger.error('Error starting model retraining:', error);
    next(error);
  }
};

// Get model status and statistics
const getModelStatus = async (req, res, next) => {
  try {
    const status = await recommendationEngine.getModelStatus();

    res.status(200).json({
      success: true,
      data: status,
      message: 'Model status retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting model status:', error);
    next(error);
  }
};

// Update user preferences (called after order completion)
const updateUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    await recommendationEngine.updateUserPreferences(userId);

    res.status(200).json({
      success: true,
      message: 'User preferences updated successfully'
    });

  } catch (error) {
    logger.error('Error updating user preferences:', error);
    next(error);
  }
};

// Get recommendation analytics
const getRecommendationAnalytics = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user?.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { CoOccurrence, ItemEmbedding } = require('../database/models/recommendation-model');

    // Get top co-occurring item pairs
    const topCoOccurrences = await CoOccurrence.find()
      .sort({ frequency: -1 })
      .limit(10)
      .populate('item1', 'name category')
      .populate('item2', 'name category');

    // Get most popular items
    const popularItems = await ItemEmbedding.find()
      .sort({ 'features.popularity': -1 })
      .limit(10)
      .populate('serviceId', 'name category price');

    // Get category distribution
    const categoryStats = await Service.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topCoOccurrences,
        popularItems,
        categoryStats
      },
      message: 'Analytics retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting recommendation analytics:', error);
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getPopularItems,
  getUserRecommendations,
  getSimilarItems,
  retrainModel,
  getModelStatus,
  updateUserPreferences,
  getRecommendationAnalytics,
  recommendationEngine, // export the instance for use elsewhere
  initializeRecommendationEngine // export the init function
};
