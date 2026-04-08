const tf = require('@tensorflow/tfjs');
// Note: In production, you might want to use tfjs-node for better performance
// const tf = require('@tensorflow/tfjs-node');
const mongoose = require('mongoose');
const Order = require('../database/models/order-model');
const Service = require('../database/models/service-model');
const { ItemEmbedding, CoOccurrence, ModelMetadata, UserPreference } = require('../database/models/recommendation-model');
const logger = require('./logger');

class RecommendationEngine {
  constructor() {
    this.model = null;
    this.itemIndexMap = new Map(); // Maps item IDs to tensor indices
    this.indexItemMap = new Map(); // Maps tensor indices to item IDs
    this.embeddingDimension = 32; // Dimension of item embeddings
    this.isModelLoaded = false;
    this.isTraining = false;
  }

  // Initialize the recommendation engine
  async initialize() {
    try {
      logger.info('Initializing recommendation engine...');
      
      // Load or create item index mappings
      await this.buildItemIndexMappings();
      
      // Load the latest trained model
      const loaded = await this.loadLatestModel();
      if (!loaded) {
        await this.trainModel();
      }
      
      logger.info('Recommendation engine initialized successfully');
    } catch (error) {
      logger.error('Error initializing recommendation engine:', error);
      throw error;
    }
  }

  // Build mappings between item IDs and tensor indices
  async buildItemIndexMappings() {
    try {
      const services = await Service.find({ available: true });
      
      this.itemIndexMap.clear();
      this.indexItemMap.clear();
      
      services.forEach((service, index) => {
        this.itemIndexMap.set(service._id.toString(), index);
        this.indexItemMap.set(index, service._id.toString());
      });
      
      logger.info(`Built index mappings for ${services.length} items`);
    } catch (error) {
      logger.error('Error building item index mappings:', error);
      throw error;
    }
  }

  // Create and train the neural network model
  async trainModel() {
    if (this.isTraining) {
      logger.warn('Model training already in progress');
      return;
    }

    this.isTraining = true;
    
    try {
      logger.info('Starting model training...');
      
      // Get training data
      const trainingData = await this.prepareTrainingData();
      
      if (trainingData.length === 0) {
        logger.warn('No training data available');
        this.isTraining = false;
        return;
      }

      // Create the model
      this.model = this.createModel();
      
      // Prepare tensors
      const { inputTensor, targetTensor } = this.prepareTensors(trainingData);
      
      // Train the model
      await this.model.fit(inputTensor, targetTensor, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            logger.info(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
          }
        }
      });

      // Save the model
      await this.saveModel();
      
      // Update co-occurrence statistics
      await this.updateCoOccurrenceStats();
      
      // Update item embeddings
      await this.updateItemEmbeddings();
      
      this.isModelLoaded = true;
      logger.info('Model training completed successfully');
      
    } catch (error) {
      logger.error('Error training model:', error);
      throw error;
    } finally {
      this.isTraining = false;
    }
  }

  // Create the neural network architecture
  createModel() {
    const model = tf.sequential();
    
    // Input layer - multi-hot encoded order vectors
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      inputShape: [this.itemIndexMap.size]
    }));
    
    // Hidden layers
    model.add(tf.layers.dropout(0.3));
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout(0.2));
    model.add(tf.layers.dense({
      units: this.embeddingDimension,
      activation: 'relu'
    }));
    
    // Output layer - predicts item probabilities
    model.add(tf.layers.dense({
      units: this.itemIndexMap.size,
      activation: 'sigmoid'
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  // Prepare training data from historical orders
  async prepareTrainingData() {
    try {
      // Get completed orders from the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const orders = await Order.find({
        status: { $in: ['Delivered','Not Process', 'Processing'] },
        createdAt: { $gte: sixMonthsAgo }
      }).populate('products.service');
      
      logger.info(`Fetched ${orders.length} orders for training`);
      
      const trainingData = [];
      
      orders.forEach(order => {
        if (!order.products || order.products.length === 0) {
          logger.warn(`Order ${order._id} has no products`);
          return;
        }
        // Create multi-hot encoded vector for this order
        const orderVector = new Array(this.itemIndexMap.size).fill(0);
        const targetVector = new Array(this.itemIndexMap.size).fill(0);
        
        order.products.forEach(product => {
          const itemId = product.service._id.toString();
          const index = this.itemIndexMap.get(itemId);
          
          if (index !== undefined) {
            orderVector[index] = 1;
            targetVector[index] = 1;
          }
        });
        
        // Create training samples with partial order information
        if (order.products.length > 1) {
          for (let i = 0; i < order.products.length; i++) {
            const partialVector = [...orderVector];
            const removedIndex = this.itemIndexMap.get(order.products[i].service._id.toString());
            
            if (removedIndex !== undefined) {
              partialVector[removedIndex] = 0;
              trainingData.push({
                input: partialVector,
                target: targetVector
              });
            }
          }
        }
      });
      
      logger.info(`Prepared ${trainingData.length} training samples from ${orders.length} orders`);
      return trainingData;
      
    } catch (error) {
      logger.error('Error preparing training data:', error);
      throw error;
    }
  }

  // Prepare tensors for training
  prepareTensors(trainingData) {
    const inputData = trainingData.map(sample => sample.input);
    const targetData = trainingData.map(sample => sample.target);
    
    const inputTensor = tf.tensor2d(inputData);
    const targetTensor = tf.tensor2d(targetData);
    
    return { inputTensor, targetTensor };
  }

  // Save the trained model metadata
  async saveModel() {
    try {
      const modelConfig = {
        embeddingDimension: this.embeddingDimension,
        itemCount: this.itemIndexMap.size,
        architecture: 'dense_sequential'
      };
      
      await ModelMetadata.findOneAndUpdate(
        { modelType: 'hybrid', isActive: true },
        {
          modelType: 'hybrid',
          version: `v${Date.now()}`,
          trainingDataSize: this.itemIndexMap.size,
          lastTrained: new Date(),
          modelConfig,
          isActive: true
        },
        { upsert: true, new: true }
      );
      
      logger.info('Model metadata saved successfully');
    } catch (error) {
      logger.error('Error saving model metadata:', error);
      throw error;
    }
  }

  // Load the latest trained model
  async loadLatestModel() {
    try {
      const metadata = await ModelMetadata.findOne({ 
        modelType: 'hybrid', 
        isActive: true 
      });
      
      if (metadata) {
        // For now, we'll retrain the model each time
        // In production, you might want to save/load the actual model weights
        logger.info('Latest model metadata found, will retrain for fresh recommendations');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error loading latest model:', error);
      return false;
    }
  }

  // Update co-occurrence statistics
  async updateCoOccurrenceStats() {
    try {
      logger.info('Updating co-occurrence statistics...');
      
      // Get all completed orders
      const orders = await Order.find({
        status: { $in: ['Delivered','Not Process', 'Processing'] }
      }).populate('products.service');
      
      const coOccurrenceMap = new Map();
      
      // Calculate co-occurrence frequencies
      orders.forEach(order => {
        const items = order.products.map(p => p.service._id.toString());
        
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const key = [items[i], items[j]].sort().join('|');
            coOccurrenceMap.set(key, (coOccurrenceMap.get(key) || 0) + 1);
          }
        }
      });
      
      // Calculate item frequencies
      const itemFrequencies = new Map();
      orders.forEach(order => {
        order.products.forEach(product => {
          const itemId = product.service._id.toString();
          itemFrequencies.set(itemId, (itemFrequencies.get(itemId) || 0) + 1);
        });
      });
      
      // Save co-occurrence data
      const coOccurrenceData = [];
      coOccurrenceMap.forEach((frequency, key) => {
        const [item1, item2] = key.split('|');
        const item1Freq = itemFrequencies.get(item1) || 0;
        const item2Freq = itemFrequencies.get(item2) || 0;
        
        const confidence = item1Freq > 0 ? frequency / item1Freq : 0;
        const lift = item1Freq > 0 && item2Freq > 0 ? 
          (frequency * orders.length) / (item1Freq * item2Freq) : 0;
        
        coOccurrenceData.push({
          item1: new mongoose.Types.ObjectId(item1),
          item2: new mongoose.Types.ObjectId(item2),
          frequency,
          confidence,
          lift,
          lastUpdated: new Date()
        });
      });
      
      // Clear existing data and insert new
      await CoOccurrence.deleteMany({});
      if (coOccurrenceData.length > 0) {
        await CoOccurrence.insertMany(coOccurrenceData);
      }
      
      logger.info(`Updated co-occurrence statistics for ${coOccurrenceData.length} item pairs`);
    } catch (error) {
      logger.error('Error updating co-occurrence statistics:', error);
      throw error;
    }
  }

  // Update item embeddings using the trained model
  async updateItemEmbeddings() {
    try {
      logger.info('Updating item embeddings...');
      
      const services = await Service.find({ available: true });
      const embeddings = [];
      
      // Generate embeddings for each item
      for (const service of services) {
        const itemIndex = this.itemIndexMap.get(service._id.toString());
        
        if (itemIndex !== undefined) {
          // Create a one-hot encoded vector for this item
          const itemVector = new Array(this.itemIndexMap.size).fill(0);
          itemVector[itemIndex] = 1;
          
          // Get the embedding from the hidden layer
          const inputTensor = tf.tensor2d([itemVector]);
          const embeddingLayer = this.model.layers[3]; // The embedding layer
          const embedding = embeddingLayer.apply(inputTensor);
          const embeddingArray = await embedding.array();
          
          // Get item statistics
          const itemOrders = await Order.find({
            'products.service': service._id,
            status: { $in: ['Delivered','Not Process', 'Processing'] }
          });
          
          const popularity = itemOrders.length;
          const avgOrderValue = popularity > 0 ? 
            itemOrders.reduce((sum, order) => sum + order.amount, 0) / popularity : 0;
          
          embeddings.push({
            serviceId: service._id,
            embedding: embeddingArray[0],
            features: {
              category: service.category,
              price: service.price,
              vegetarian: service.vegetarian,
              spicy: service.spicy,
              popularity,
              avgOrderValue
            },
            lastUpdated: new Date()
          });
          
          // Clean up tensors
          inputTensor.dispose();
          embedding.dispose();
        }
      }
      
      // Clear existing embeddings and insert new ones
      await ItemEmbedding.deleteMany({});
      if (embeddings.length > 0) {
        await ItemEmbedding.insertMany(embeddings);
      }
      
      logger.info(`Updated embeddings for ${embeddings.length} items`);
    } catch (error) {
      logger.error('Error updating item embeddings:', error);
      throw error;
    }
  }

  // Get real-time recommendations based on current cart
  async getRecommendations(cartItems, userId = null, limit = 5) {
    try {
      if (!this.isModelLoaded) {
        logger.warn('Model not loaded, returning basic recommendations');
        return await this.getBasicRecommendations(cartItems, limit);
      }
      
      // Defensive: handle array of objects or strings
      const itemIds = cartItems.map(item => typeof item === 'object' && item.service ? item.service : item);
      
      // Create input vector from cart items
      const inputVector = new Array(this.itemIndexMap.size).fill(0);
      itemIds.forEach(itemId => {
        const index = this.itemIndexMap.get(itemId.toString());
        if (index !== undefined) {
          inputVector[index] = 1;
        }
      });
      
      // Get predictions from model
      const inputTensor = tf.tensor2d([inputVector]);
      const predictions = this.model.predict(inputTensor);
      const predictionArray = await predictions.array();
      
      // Get top recommendations
      const scores = predictionArray[0].map((score, index) => ({
        itemId: this.indexItemMap.get(index),
        score
      }));
      
      // Filter out items already in cart and sort by score
      const recommendations = scores
        .filter(item => !itemIds.includes(item.itemId))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      
      // Get full item details
      const recommendedItems = await Service.find({
        _id: { $in: recommendations.map(r => r.itemId) },
        available: true
      });
      
      // Clean up tensors
      inputTensor.dispose();
      predictions.dispose();
      
      // Add user-specific filtering if userId provided
      if (userId) {
        const userPrefs = await UserPreference.findOne({ userId });
        if (userPrefs) {
          // Filter based on user preferences
          recommendedItems = recommendedItems.filter(item => {
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
        }
      }
      
      if (recommendedItems.length === 0) {
        logger.warn('No basic recommendations found for cart:', cartItems);
      }
      
      return recommendedItems.map(item => ({
        ...item.toObject(),
        recommendationScore: recommendations.find(r => r.itemId === item._id.toString())?.score || 0
      }));
      
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      return await this.getBasicRecommendations(cartItems, limit);
    }
  }

  // Get basic recommendations using co-occurrence statistics
  async getBasicRecommendations(cartItems, limit = 5) {
    try {
      const recommendations = await CoOccurrence.aggregate([
        {
          $match: {
            $or: [
              { item1: { $in: cartItems.map(id => new mongoose.Types.ObjectId(id)) } },
              { item2: { $in: cartItems.map(id => new mongoose.Types.ObjectId(id)) } }
            ]
          }
        },
        {
          $addFields: {
            recommendedItem: {
              $cond: {
                if: { $in: ['$item1', cartItems.map(id => new mongoose.Types.ObjectId(id))] },
                then: '$item2',
                else: '$item1'
              }
            }
          }
        },
        {
          $match: {
            recommendedItem: { $nin: cartItems.map(id => new mongoose.Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: '$recommendedItem',
            totalFrequency: { $sum: '$frequency' },
            avgConfidence: { $avg: '$confidence' },
            avgLift: { $avg: '$lift' }
          }
        },
        {
          $sort: { totalFrequency: -1, avgLift: -1 }
        },
        {
          $limit: limit
        }
      ]);
      
      const recommendedItems = await Service.find({
        _id: { $in: recommendations.map(r => r._id) },
        available: true
      });
      
      if (recommendedItems.length === 0) {
        logger.warn('No basic recommendations found for cart:', cartItems);
      }
      
      return recommendedItems.map(item => ({
        ...item.toObject(),
        recommendationScore: recommendations.find(r => r._id.toString() === item._id.toString())?.avgLift || 0
      }));
      
    } catch (error) {
      logger.error('Error getting basic recommendations:', error);
      return [];
    }
  }

  // Update user preferences based on order history
  async updateUserPreferences(userId) {
    try {
      const userOrders = await Order.find({
        buyer: userId,
        status: { $in: ['Delivered','Not Process', 'Processing'] }
      }).populate('products.service');
      
      if (userOrders.length === 0) return;
      
      // Calculate user preferences
      const categories = new Map();
      const favoriteItems = new Map();
      const prices = [];
      let totalOrderValue = 0;
      
      userOrders.forEach(order => {
        totalOrderValue += order.amount;
        prices.push(order.amount);
        
        order.products.forEach(product => {
          // Track categories
          const category = product.service.category;
          categories.set(category, (categories.get(category) || 0) + 1);
          
          // Track favorite items
          const itemId = product.service._id.toString();
          const current = favoriteItems.get(itemId) || { frequency: 0, lastOrdered: null };
          favoriteItems.set(itemId, {
            frequency: current.frequency + 1,
            lastOrdered: order.createdAt
          });
        });
      });
      
      // Determine dietary preferences
      const dietaryRestrictions = [];
      const allItems = userOrders.flatMap(order => order.products);
      const vegetarianCount = allItems.filter(item => item.service.vegetarian).length;
      const spicyCount = allItems.filter(item => item.service.spicy).length;
      
      if (vegetarianCount > allItems.length * 0.7) {
        dietaryRestrictions.push('vegetarian');
      }
      if (spicyCount < allItems.length * 0.3) {
        dietaryRestrictions.push('non-spicy');
      }
      
      // Update user preferences
      await UserPreference.findOneAndUpdate(
        { userId },
        {
          userId,
          preferences: {
            categories: Array.from(categories.keys()),
            priceRange: {
              min: Math.min(...prices),
              max: Math.max(...prices)
            },
            dietaryRestrictions,
            favoriteItems: Array.from(favoriteItems.entries()).map(([serviceId, data]) => ({
              serviceId: new mongoose.Types.ObjectId(serviceId),
              frequency: data.frequency,
              lastOrdered: data.lastOrdered
            }))
          },
          behavior: {
            totalOrders: userOrders.length,
            avgOrderValue: totalOrderValue / userOrders.length,
            visitFrequency: userOrders.length / 30, // Assuming monthly frequency
            lastVisit: userOrders[userOrders.length - 1].createdAt
          },
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      
      logger.info(`Updated preferences for user ${userId}`);
    } catch (error) {
      logger.error('Error updating user preferences:', error);
    }
  }

  // Get model status and statistics
  async getModelStatus() {
    try {
      const metadata = await ModelMetadata.findOne({ isActive: true });
      const itemCount = await Service.countDocuments({ available: true });
      const orderCount = await Order.countDocuments({ 
        status: { $in: ['Delivered','Not Process', 'Processing'] } 
      });
      
      return {
        isModelLoaded: this.isModelLoaded,
        isTraining: this.isTraining,
        metadata,
        statistics: {
          totalItems: itemCount,
          totalOrders: orderCount,
          itemEmbeddings: await ItemEmbedding.countDocuments(),
          coOccurrencePairs: await CoOccurrence.countDocuments(),
          userPreferences: await UserPreference.countDocuments()
        }
      };
    } catch (error) {
      logger.error('Error getting model status:', error);
      throw error;
    }
  }
}

module.exports = RecommendationEngine; 