// backend/models/Withdrawal.js
const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    enum: ['USDC', 'USDT', 'BTC', 'ETH']
  },
  network: {
    type: String,
    required: true,
    enum: ['TRC20', 'ERC20', 'BTC']
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);