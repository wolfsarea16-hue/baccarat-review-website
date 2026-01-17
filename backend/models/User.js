// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String, // Base64 encoded image
    default: null
  },
  accountBalance: {
    type: Number,
    default: 0
  },
  totalReviewsAssigned: {
    type: Number,
    default: 30
  },
  reviewsCompleted: {
    type: Number,
    default: 0
  },
  currentReviewPosition: {
    type: Number,
    default: 0
  },
  currentSessionCommission: {
    type: Number,
    default: 0
  },
  targetBalance: {
    type: Number,
    default: null // null means no target balance restriction
  },
  pendingReview: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productPrice: Number,
    commission: Number,
    uniqueCode: String,
    startedAt: Date
  },
  specialReviews: [{
    position: Number,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    price: Number,
    commission: Number // Stored as percentage (e.g., 20 for 20%)
  }],
  withdrawalInfo: {
    walletAddress: String,
    currency: {
      type: String,
      default: 'USDT'
    },
    network: {
      type: String,
      default: 'TRC20'
    },
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  canWithdraw: {
    type: Boolean,
    default: true
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);