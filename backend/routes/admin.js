// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../middleware/auth'); // ← FIXED: Use adminMiddleware not adminAuth
const User = require('../models/User');
const Product = require('../models/Product');
const Withdrawal = require('../models/Withdrawal');
const Review = require('../models/Review');

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear target balance for a user
router.post('/users/:userId/clear-target-balance', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove target balance restriction
    user.targetBalance = null;

    await user.save();

    res.json({ 
      message: 'Target balance cleared successfully. User can now proceed normally.',
      user: {
        username: user.username,
        targetBalance: user.targetBalance
      }
    });
  } catch (err) {
    console.error('Error clearing target balance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set target balance for a user
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
    console.error('Error setting target balance:', err);
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
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');
    
    res.json(users);
  } catch (err) {
    console.error('Error searching users:', err);
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
    res.json(user);
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:userId', adminMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Adjust balance
router.post('/users/:userId/balance', adminMiddleware, async (req, res) => {
  try {
    const { amount, operation } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (operation === 'add') {
      user.accountBalance += parseFloat(amount);
    } else if (operation === 'subtract') {
      user.accountBalance -= parseFloat(amount);
    }

    await user.save();

    res.json({ 
      message: `Balance ${operation === 'add' ? 'added' : 'subtracted'} successfully`,
      newBalance: user.accountBalance
    });
  } catch (err) {
    console.error('Error adjusting balance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign special review with corrected commission handling
router.post('/users/:userId/special-review', adminMiddleware, async (req, res) => {
  try {
    const { position, productId, price, commission } = req.body;

    // Validate inputs
    if (!position || !productId || !price || commission === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    if (commission < 0 || commission > 100) {
      return res.status(400).json({ message: 'Commission must be between 0 and 100 percent' });
    }

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
    user.specialReviews = user.specialReviews.filter(sr => sr.position !== parseInt(position));

    // Add new special review
    // NOTE: commission is stored as percentage (e.g., 20 for 20%)
    user.specialReviews.push({
      position: parseInt(position),
      productId,
      price: parseFloat(price),
      commission: parseFloat(commission) // Store as percentage
    });

    await user.save();

    res.json({ 
      message: 'Special review added successfully',
      specialReview: {
        position,
        productId,
        price,
        commission,
        calculatedCommissionAmount: (parseFloat(commission) / 100) * parseFloat(price)
      }
    });
  } catch (err) {
    console.error('Error adding special review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle freeze
router.post('/users/:userId/freeze', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isFrozen = !user.isFrozen;
    await user.save();

    res.json({ 
      message: `User ${user.isFrozen ? 'frozen' : 'unfrozen'} successfully`,
      isFrozen: user.isFrozen
    });
  } catch (err) {
    console.error('Error toggling freeze:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset account (does NOT give $15 bonus)
router.post('/users/:userId/reset', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.accountBalance = 0;
    user.reviewsCompleted = 0;
    user.currentReviewPosition = 0;
    user.currentSessionCommission = 0;
    user.pendingReview = {};
    user.specialReviews = [];
    user.targetBalance = null;

    await user.save();

    res.json({ message: 'Account reset successfully' });
  } catch (err) {
    console.error('Error resetting account:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle withdrawal
router.post('/users/:userId/toggle-withdrawal', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.canWithdraw = !user.canWithdraw;
    await user.save();

    res.json({ 
      message: `Withdrawal ${user.canWithdraw ? 'enabled' : 'disabled'} successfully`,
      canWithdraw: user.canWithdraw
    });
  } catch (err) {
    console.error('Error toggling withdrawal:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlock withdrawal details
router.post('/users/:userId/unlock-withdrawal', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.withdrawalInfo) {
      user.withdrawalInfo.isLocked = false;
    }

    await user.save();

    res.json({ message: 'Withdrawal details unlocked successfully' });
  } catch (err) {
    console.error('Error unlocking withdrawal details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change user password
router.post('/users/:userId/change-password', adminMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products
router.get('/products', adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product
router.post('/products', adminMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all withdrawals
router.get('/withdrawals', adminMiddleware, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'username email')
      .sort({ requestedAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('Error fetching withdrawals:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user withdrawals
router.get('/users/:userId/withdrawals', adminMiddleware, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.params.userId })
      .sort({ requestedAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('Error fetching user withdrawals:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update withdrawal
router.put('/withdrawals/:withdrawalId', adminMiddleware, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.withdrawalId,
      { 
        status, 
        adminNotes,
        processedAt: status !== 'pending' ? new Date() : null
      },
      { new: true }
    );

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    res.json(withdrawal);
  } catch (err) {
    console.error('Error updating withdrawal:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviews with product price
router.get('/reviews', adminMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'username email')
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    // Format reviews to include all necessary info
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      username: review.userId?.username,
      productName: review.productId?.name,
      productPrice: review.productPrice, // Include product price
      commission: review.commission,
      uniqueCode: review.uniqueCode,
      status: review.status,
      isSpecial: review.isSpecial,
      reviewPosition: review.reviewPosition,
      createdAt: review.createdAt,
      completedAt: review.completedAt
    }));

    res.json(formattedReviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/users/:userId/update-reviews', adminMiddleware, async (req, res) => {
  try {
    const { totalReviewsAssigned } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!totalReviewsAssigned || totalReviewsAssigned < 1) {
      return res.status(400).json({ message: 'Total reviews must be at least 1' });
    }

    // Update total reviews - this only affects future progress
    user.totalReviewsAssigned = parseInt(totalReviewsAssigned);
    await user.save();

    res.json({ 
      message: 'Total reviews updated successfully. This will affect future reviews only.',
      totalReviewsAssigned: user.totalReviewsAssigned,
      reviewsCompleted: user.reviewsCompleted,
      reviewsRemaining: user.totalReviewsAssigned - user.reviewsCompleted
    });
  } catch (err) {
    console.error('Error updating total reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;