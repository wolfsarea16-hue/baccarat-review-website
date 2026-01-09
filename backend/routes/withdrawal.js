// backend/routes/withdrawal.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

// Get user withdrawal info
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      accountBalance: user.accountBalance,
      canWithdraw: user.canWithdraw,
      withdrawalInfo: user.withdrawalInfo,
      username: user.username,
      reviewsCompleted: user.reviewsCompleted,
      totalReviewsAssigned: user.totalReviewsAssigned
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set withdrawal details (can only be done once unless admin changes)
router.post('/set-details', authMiddleware, async (req, res) => {
  try {
    const { walletAddress, walletAddressConfirm, currency, network } = req.body;

    // Validate inputs
    if (!walletAddress || !walletAddressConfirm || !currency || !network) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (walletAddress !== walletAddressConfirm) {
      return res.status(400).json({ message: 'Wallet addresses do not match' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already locked
    if (user.withdrawalInfo.isLocked) {
      return res.status(400).json({ 
        message: 'Withdrawal details are locked. Please contact admin to make changes.' 
      });
    }

    // Set withdrawal info and lock it
    user.withdrawalInfo = {
      walletAddress,
      walletAddressConfirm,
      currency,
      network,
      isLocked: true,
      lockedAt: new Date()
    };

    await user.save();

    res.json({ 
      message: 'Withdrawal details saved and locked successfully',
      withdrawalInfo: user.withdrawalInfo
    });
  } catch (err) {
    console.error(err);
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

    // Check if withdrawal is enabled for this user
    if (!user.canWithdraw) {
      return res.status(403).json({ 
        message: 'Withdrawal is not enabled for your account. Please contact admin.' 
      });
    }

    // Check if all reviews are completed
    if (user.reviewsCompleted < user.totalReviewsAssigned) {
      return res.status(400).json({ 
        message: `You must complete all assigned reviews before withdrawing. Completed: ${user.reviewsCompleted}/${user.totalReviewsAssigned}` 
      });
    }

    // Check if withdrawal details are set and locked
    if (!user.withdrawalInfo.isLocked) {
      return res.status(400).json({ 
        message: 'Please set and confirm your withdrawal details first.' 
      });
    }

    // Check if user has balance
    if (user.accountBalance <= 0) {
      return res.status(400).json({ 
        message: 'Insufficient balance for withdrawal.' 
      });
    }

    const withdrawalAmount = user.accountBalance;

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId: user._id,
      username: user.username,
      amount: withdrawalAmount,
      walletAddress: user.withdrawalInfo.walletAddress,
      currency: user.withdrawalInfo.currency,
      network: user.withdrawalInfo.network,
      status: 'pending'
    });

    await withdrawal.save();

    // Zero out user balance
    user.accountBalance = 0;
    await user.save();

    res.json({ 
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get withdrawal history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.userId })
      .sort({ requestedAt: -1 });

    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;