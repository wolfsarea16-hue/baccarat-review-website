// backend/routes/review.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

// Generate unique code
function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get review status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reviewsRemaining = user.totalReviewsAssigned - user.reviewsCompleted;

    res.json({
      accountBalance: user.accountBalance,
      totalReviewsAssigned: user.totalReviewsAssigned,
      reviewsCompleted: user.reviewsCompleted,
      reviewsRemaining,
      currentReviewPosition: user.currentReviewPosition,
      hasPendingReview: !!user.pendingReview.productId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a new review
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has pending review
    if (user.pendingReview.productId) {
      return res.status(400).json({ message: 'You already have a pending review' });
    }

    // Check if user has completed all reviews
    if (user.reviewsCompleted >= user.totalReviewsAssigned) {
      return res.status(400).json({ message: 'You have completed all assigned reviews' });
    }

    // Check if user has sufficient balance
    if (user.accountBalance <= 0) {
      return res.status(400).json({ message: 'Insufficient account balance' });
    }

    // Check if user has sufficient balance
    if (user.accountBalance <= 0) {
      return res.status(400).json({ message: 'Insufficient account balance. Please contact admin to add balance.' });
    }

    // Check if admin has set target balance
    if (!user.targetBalance || user.targetBalance <= 0) {
      return res.status(400).json({ 
        message: 'Target balance not set by admin. Please contact administrator to configure your account.' 
      });
    }

    const nextPosition = user.currentReviewPosition + 1;

    // Check if there's a special review at this position
    const specialReview = user.specialReviews.find(sr => sr.position === nextPosition);

    let product, productPrice, commission;

    if (specialReview) {
      product = await Product.findById(specialReview.productId);
      if (!product) {
        return res.status(404).json({ message: 'Special product not found' });
      }
      productPrice = specialReview.price;
      commission = (specialReview.commission / 100) * productPrice; // Calculate commission from percentage
    } else {
      // Get random product
      const productCount = await Product.countDocuments();
      const randomIndex = Math.floor(Math.random() * productCount);
      product = await Product.findOne().skip(randomIndex);

      if (!product) {
        return res.status(404).json({ message: 'No products available' });
      }

      // Calculate product price based on target balance
      const reviewsRemaining = user.totalReviewsAssigned - user.currentReviewPosition;
      const targetProfit = user.targetBalance - user.accountBalance;
      const commissionRate = product.baseCommissionRate / 100; // 0.6% = 0.006
      
      // Calculate average product price needed to reach target
      // Formula: targetProfit = reviewsRemaining * (productPrice * commissionRate)
      // Therefore: productPrice = targetProfit / (reviewsRemaining * commissionRate)
      let calculatedPrice = targetProfit / (reviewsRemaining * commissionRate);
      
      // Add some randomness (±20%) to make it less predictable
      const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
      calculatedPrice = calculatedPrice * randomFactor;
      
      // Ensure price doesn't exceed 90% of current balance
      const maxPrice = user.accountBalance * 0.9;
      productPrice = Math.min(Math.floor(calculatedPrice), maxPrice);
      
      // Ensure minimum price
      productPrice = Math.max(productPrice, 10);
      
      commission = productPrice * commissionRate;
    }

    // Always deduct balance, even if it goes negative
    // This allows users to see the product but not submit if balance is negative
    user.accountBalance -= productPrice;

    // Generate unique code
    const uniqueCode = generateUniqueCode();

    // Set pending review
    user.pendingReview = {
      productId: product._id,
      productPrice,
      commission,
      uniqueCode,
      startedAt: new Date()
    };

    user.currentReviewPosition = nextPosition;

    await user.save();

    // Create review record
    const review = new Review({
      userId: user._id,
      productId: product._id,
      productPrice,
      commission,
      uniqueCode,
      status: 'pending',
      reviewPosition: nextPosition,
      isSpecial: !!specialReview
    });

    await review.save();

    res.json({
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        mainImage: product.mainImage,
        additionalImages: product.additionalImages
      },
      productPrice,
      commission,
      uniqueCode,
      reviewId: review._id,
      newBalance: user.accountBalance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending review
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.pendingReview.productId) {
      return res.status(404).json({ message: 'No pending review' });
    }

    const product = await Product.findById(user.pendingReview.productId);
    const review = await Review.findOne({
      userId: user._id,
      productId: user.pendingReview.productId,
      status: 'pending'
    });

    res.json({
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        mainImage: product.mainImage,
        additionalImages: product.additionalImages
      },
      productPrice: user.pendingReview.productPrice,
      commission: user.pendingReview.commission,
      uniqueCode: user.pendingReview.uniqueCode,
      reviewId: review._id,
      currentBalance: user.accountBalance,
      isBalanceNegative: user.accountBalance < 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit review
router.post('/submit/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewText } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.pendingReview.productId) {
      return res.status(400).json({ message: 'No pending review' });
    }

    // Check if balance is negative - user cannot submit
    if (user.accountBalance < 0) {
      return res.status(400).json({ 
        message: 'Cannot submit review with negative balance. Please contact admin to add balance.',
        currentBalance: user.accountBalance,
        requiredAmount: Math.abs(user.accountBalance),
        productPrice: user.pendingReview.productPrice
      });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review || review.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update review
    review.reviewText = reviewText;
    review.status = 'completed';
    review.completedAt = new Date();
    await review.save();

    // Update user balance and stats
    user.accountBalance += user.pendingReview.productPrice + user.pendingReview.commission;
    user.reviewsCompleted += 1;
    user.currentSessionCommission += user.pendingReview.commission;
    user.pendingReview = {};

    await user.save();

    res.json({
      message: 'Review submitted successfully',
      newBalance: user.accountBalance,
      reviewsCompleted: user.reviewsCompleted,
      reviewsRemaining: user.totalReviewsAssigned - user.reviewsCompleted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get review history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.userId })
      .populate('productId')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;