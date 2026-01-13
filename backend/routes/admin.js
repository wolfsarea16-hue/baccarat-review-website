// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/users/search', adminMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details
router.get('/users/:userId', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reviews = await Review.find({ userId: user._id })
      .populate('productId')
      .sort({ createdAt: -1 });

    res.json({ user, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user details
router.put('/users/:userId', adminMiddleware, async (req, res) => {
  try {
    const { username, email, phoneNumber, accountBalance, totalReviewsAssigned, isFrozen } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (accountBalance !== undefined) user.accountBalance = accountBalance;
    if (totalReviewsAssigned !== undefined) user.totalReviewsAssigned = totalReviewsAssigned;
    if (isFrozen !== undefined) user.isFrozen = isFrozen;

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Adjust user balance
router.post('/users/:userId/balance', adminMiddleware, async (req, res) => {
  try {
    const { amount, operation } = req.body; // operation: 'add' or 'deduct'

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (operation === 'add') {
      user.accountBalance += amount;
    } else if (operation === 'deduct') {
      user.accountBalance -= amount;
      if (user.accountBalance < 0) user.accountBalance = 0;
    }

    await user.save();

    res.json({ 
      message: 'Balance updated successfully', 
      newBalance: user.accountBalance 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set target balance
router.post('/users/:userId/target-balance', adminMiddleware, async (req, res) => {
  try {
    const { targetBalance } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.targetBalance = targetBalance;
    await user.save();

    res.json({ 
      message: 'Target balance set successfully', 
      targetBalance: user.targetBalance 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear target balance
router.post('/users/:userId/clear-target-balance', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.targetBalance = 0;
    await user.save();

    res.json({ 
      message: 'Target balance cleared successfully', 
      targetBalance: user.targetBalance 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign special review
router.post('/users/:userId/special-review', adminMiddleware, async (req, res) => {
  try {
    const { position, productId, price, commission } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove existing special review at this position if any
    user.specialReviews = user.specialReviews.filter(sr => sr.position !== position);

    // Add new special review
    user.specialReviews.push({
      position,
      productId,
      price,
      commission
    });

    await user.save();

    res.json({ 
      message: 'Special review assigned successfully', 
      specialReviews: user.specialReviews 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle freeze account
router.post('/users/:userId/freeze', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isFrozen = !user.isFrozen;
    await user.save();

    res.json({ 
      message: user.isFrozen ? 'Account frozen' : 'Account unfrozen', 
      isFrozen: user.isFrozen 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user account
router.post('/users/:userId/reset', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset account to initial state
    user.accountBalance = 0;
    user.reviewsCompleted = 0;
    user.currentReviewPosition = 0;
    user.currentSessionCommission = 0;
    user.pendingReview = {};
    user.specialReviews = [];

    await user.save();

    // Delete all reviews for this user
    await Review.deleteMany({ userId: user._id });

    res.json({ 
      message: 'User account reset successfully',
      user: {
        accountBalance: user.accountBalance,
        reviewsCompleted: user.reviewsCompleted,
        currentReviewPosition: user.currentReviewPosition
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle withdrawal permission
router.post('/users/:userId/toggle-withdrawal', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.canWithdraw = !user.canWithdraw;
    await user.save();

    res.json({ 
      message: user.canWithdraw ? 'Withdrawal enabled' : 'Withdrawal disabled', 
      canWithdraw: user.canWithdraw 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlock withdrawal details (allow user to change)
router.post('/users/:userId/unlock-withdrawal', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.withdrawalInfo.isLocked = false;
    await user.save();

    res.json({ 
      message: 'Withdrawal details unlocked. User can now update their information.',
      withdrawalInfo: user.withdrawalInfo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change user password
router.post('/users/:userId/change-password', adminMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ 
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all withdrawal requests
router.get('/withdrawals', adminMiddleware, async (req, res) => {
  try {
    const Withdrawal = require('../models/Withdrawal');
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'username email')
      .sort({ requestedAt: -1 });

    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get withdrawal requests for specific user
router.get('/users/:userId/withdrawals', adminMiddleware, async (req, res) => {
  try {
    const Withdrawal = require('../models/Withdrawal');
    const withdrawals = await Withdrawal.find({ userId: req.params.userId })
      .sort({ requestedAt: -1 });

    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update withdrawal status
router.put('/withdrawals/:withdrawalId', adminMiddleware, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const Withdrawal = require('../models/Withdrawal');
    
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    withdrawal.status = status;
    withdrawal.adminNotes = adminNotes || withdrawal.adminNotes;
    withdrawal.processedAt = new Date();

    await withdrawal.save();

    res.json({ 
      message: 'Withdrawal status updated',
      withdrawal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products
router.get('/products', adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product
router.post('/products', adminMiddleware, async (req, res) => {
  try {
    const { name, description, mainImage, additionalImages } = req.body;

    const product = new Product({
      name,
      description,
      mainImage,
      additionalImages: additionalImages || []
    });

    await product.save();

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;