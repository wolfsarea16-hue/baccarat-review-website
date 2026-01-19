// backend/models/Withdrawal.js
const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
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
    default: 'USDT'
  },
  network: {
    type: String,
    default: 'TRC20'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  commissionSnapshot: {
    type: Number,
    default: 0
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);