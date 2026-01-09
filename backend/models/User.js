// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
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
  isFrozen: {
    type: Boolean,
    default: false
  },
  pendingReview: {
    productId: mongoose.Schema.Types.ObjectId,
    productPrice: Number,
    commission: Number,
    uniqueCode: String,
    startedAt: Date
  },
  specialReviews: [{
    position: Number,
    productId: mongoose.Schema.Types.ObjectId,
    price: Number,
    commission: Number
  }],
  currentSessionCommission: {
    type: Number,
    default: 0
  },
  canWithdraw: {
    type: Boolean,
    default: false
  },
  targetBalance: {
    type: Number,
    default: 0
  },
  withdrawalInfo: {
    walletAddress: String,
    walletAddressConfirm: String,
    currency: String,
    network: String,
    isLocked: {
      type: Boolean,
      default: false
    },
    lockedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);