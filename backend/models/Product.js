// backend/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  mainImage: {
    type: String,
    default: 'https://via.placeholder.com/400'
  },
  additionalImages: [{
    type: String
  }],
  baseCommissionRate: {
    type: Number,
    default: 0.6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);