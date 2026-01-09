// backend/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    required: true
  },
  uniqueCode: {
    type: String,
    required: true
  },
  reviewText: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  reviewPosition: {
    type: Number
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Review', ReviewSchema);