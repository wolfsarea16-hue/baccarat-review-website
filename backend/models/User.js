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
    default: 33
  },
  reviewsCompleted: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Proficient', 'Authority'],
    default: 'Beginner'
  },
  reputationPoints: {
    type: Number,
    default: 100
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
    negativeAmount: Number // Target negative balance amount
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
  groupLink: {
    type: String,
    default: ''
  },
  isTestingAccount: {
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