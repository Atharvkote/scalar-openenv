const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for storing item embeddings and features
const itemEmbeddingSchema = new Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    unique: true
  },
  embedding: {
    type: [Number], // Vector representation of the item
    required: true
  },
  features: {
    category: String,
    price: Number,
    vegetarian: Boolean,
    spicy: Boolean,
    popularity: Number, // How often this item is ordered
    avgOrderValue: Number // Average order value when this item is included
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Schema for storing co-occurrence statistics
const coOccurrenceSchema = new Schema({
  item1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  item2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  frequency: {
    type: Number,
    default: 0
  },
  confidence: {
    type: Number,
    default: 0
  },
  lift: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Schema for storing model metadata
const modelMetadataSchema = new Schema({
  modelType: {
    type: String,
    enum: ['collaborative_filtering', 'content_based', 'hybrid'],
    required: true
  },
  version: {
    type: String,
    required: true
  },
  accuracy: {
    type: Number,
    default: 0
  },
  trainingDataSize: {
    type: Number,
    default: 0
  },
  lastTrained: {
    type: Date,
    default: Date.now
  },
  modelConfig: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Schema for storing user preferences and behavior
const userPreferenceSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  preferences: {
    categories: [String],
    priceRange: {
      min: Number,
      max: Number
    },
    dietaryRestrictions: [String], // ['vegetarian', 'non-spicy', etc.]
    favoriteItems: [{
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      },
      frequency: Number,
      lastOrdered: Date
    }]
  },
  behavior: {
    totalOrders: {
      type: Number,
      default: 0
    },
    avgOrderValue: {
      type: Number,
      default: 0
    },
    visitFrequency: {
      type: Number,
      default: 0
    },
    lastVisit: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better performance
itemEmbeddingSchema.index({ serviceId: 1 });
coOccurrenceSchema.index({ item1: 1, item2: 1 });
coOccurrenceSchema.index({ frequency: -1 });
userPreferenceSchema.index({ userId: 1 });

const ItemEmbedding = mongoose.model('ItemEmbedding', itemEmbeddingSchema);
const CoOccurrence = mongoose.model('CoOccurrence', coOccurrenceSchema);
const ModelMetadata = mongoose.model('ModelMetadata', modelMetadataSchema);
const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

module.exports = {
  ItemEmbedding,
  CoOccurrence,
  ModelMetadata,
  UserPreference
}; 