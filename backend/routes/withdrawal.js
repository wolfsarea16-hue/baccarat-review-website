// backend/routes/withdrawal.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

// Get withdrawal details/info for current user
router.get('/details', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if withdrawal details are set
    if (!user.withdrawalInfo || !user.withdrawalInfo.walletAddress) {
      return res.json({
        isLocked: false,
        hasDetails: false
      });
    }

    // Return withdrawal info
    res.json({
      isLocked: user.withdrawalInfo.isLocked,
      hasDetails: true,
      username: user.username,
      walletAddress: user.withdrawalInfo.walletAddress,
      currency: user.withdrawalInfo.currency,
      network: user.withdrawalInfo.network
    });
  } catch (err) {
    console.error('Error fetching withdrawal details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set withdrawal details
router.post('/set-details', authMiddleware, async (req, res) => {
  try {
    const { walletAddress, currency, network } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already locked
    if (user.withdrawalInfo && user.withdrawalInfo.isLocked) {
      return res.status(400).json({ 
        message: 'Withdrawal details are locked. Contact admin to unlock.' 
      });
    }

    // Validate wallet address
    if (!walletAddress || walletAddress.length < 10) {
      return res.status(400).json({ message: 'Invalid wallet address' });
    }

    // Set withdrawal info and lock it
    user.withdrawalInfo = {
      walletAddress,
      currency: currency || 'USDT',
      network: network || 'TRC20',
      isLocked: true
    };

    await user.save();

    res.json({ 
      message: 'Withdrawal details saved and locked successfully',
      withdrawalInfo: user.withdrawalInfo
    });
  } catch (err) {
    console.error('Error setting withdrawal details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit withdrawal request
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate withdrawal permission
    if (!user.canWithdraw) {
      return res.status(403).json({ 
        message: 'Withdrawal is disabled for your account. Contact admin.' 
      });
    }

    // Validate reviews completed
    if (user.reviewsCompleted < user.totalReviewsAssigned) {
      return res.status(400).json({ 
        message: `You must complete all ${user.totalReviewsAssigned} reviews before withdrawing. Currently completed: ${user.reviewsCompleted}` 
      });
    }

    // Validate balance
    if (user.accountBalance <= 0) {
      return res.status(400).json({ message: 'Insufficient balance to withdraw' });
    }

    // Validate withdrawal details are set
    if (!user.withdrawalInfo || !user.withdrawalInfo.walletAddress) {
      return res.status(400).json({ 
        message: 'Please set your withdrawal details first' 
      });
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId: user._id,
      amount: user.accountBalance,
      walletAddress: user.withdrawalInfo.walletAddress,
      currency: user.withdrawalInfo.currency,
      network: user.withdrawalInfo.network,
      status: 'pending'
    });

    await withdrawal.save();

    // Reset user balance and commission
    user.accountBalance = 0;
    user.currentSessionCommission = 0;
    await user.save();

    res.json({ 
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        amount: withdrawal.amount,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt
      }
    });
  } catch (err) {
    console.error('Error submitting withdrawal request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get withdrawal history for current user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.userId })
      .sort({ requestedAt: -1 });

    res.json(withdrawals);
  } catch (err) {
    console.error('Error fetching withdrawal history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 