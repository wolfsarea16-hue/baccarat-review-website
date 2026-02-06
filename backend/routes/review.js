// backend/routes/review.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const LEVELS = require('../config/levels');

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
      return res.status(400).json({ message: 'You already have a pending audit' });
    }

    // Check if user has completed all reviews
    if (user.reviewsCompleted >= user.totalReviewsAssigned) {
      return res.status(400).json({ message: 'You have completed all assigned audits' });
    }

    // MINIMUM BALANCE CHECK - Must have at least $50
    if (user.accountBalance < 50) {
      return res.status(400).json({
        message: 'Minimum balance of $50 required to start audits.',
        currentBalance: user.accountBalance,
        requiredBalance: 50
      });
    }

    const nextPosition = user.currentReviewPosition + 1;

    // Get level configuration
    const userLevel = user.level || 'Beginner';
    const levelConfig = LEVELS[userLevel];

    // Check if there's a special review at this position
    const specialReview = user.specialReviews.find(sr => sr.position === nextPosition);

    let product, productPrice, commission, hasSpecialProduct = false;

    // Testing Account Logic Override
    if (user.isTestingAccount) {
      const beginnerConfig = LEVELS.Beginner;
      const normalRate = beginnerConfig.normalCommission / 100;
      const specialRate = beginnerConfig.specialCommission / 100;

      if (specialReview) {
        hasSpecialProduct = true;
        product = await Product.findById(specialReview.productId);
        productPrice = user.accountBalance + specialReview.negativeAmount;
        commission = productPrice * specialRate;
      } else {
        // Get random product
        const productCount = await Product.countDocuments();
        const randomIndex = Math.floor(Math.random() * productCount);
        product = await Product.findOne().skip(randomIndex);

        // Price Throttling for all normal reviews to stay between $236-$250 total commission
        // 32 normal reviews x ~$250 price x 0.6% = ~$48 total
        // 1 special review x $1000 price x 20% = $200
        // Result: ~$248 total commission
        productPrice = Math.floor(Math.random() * (300 - 200) + 200);
        commission = productPrice * normalRate;
      }
    } else if (specialReview) {
      hasSpecialProduct = true;
      product = await Product.findById(specialReview.productId);
      if (!product) {
        return res.status(404).json({ message: 'Exclusive Audit not found' });
      }

      // Calculate price to make balance negative by negativeAmount
      // productPrice = currentBalance + negativeAmount
      productPrice = user.accountBalance + specialReview.negativeAmount;

      // Level-based special commission
      commission = (levelConfig.specialCommission / 100) * productPrice;

      // IMPORTANT: Clear target balance when special product is encountered
      if (user.targetBalance) {
        user.targetBalance = null;
      }
    } else {
      // Get random product
      const productCount = await Product.countDocuments();
      const randomIndex = Math.floor(Math.random() * productCount);
      product = await Product.findOne().skip(randomIndex);

      if (!product) {
        return res.status(404).json({ message: 'No audits available' });
      }

      // Check if user had a special product previously
      const hadSpecialProduct = user.specialReviews.some(
        sr => sr.position <= user.currentReviewPosition
      );

      // Level-based normal commission rate
      const commissionRate = levelConfig.normalCommission / 100;

      // If targetBalance exists AND user hasn't had special products, use target-based calculation
      if (user.targetBalance && user.targetBalance > 0 && !hadSpecialProduct) {
        const reviewsRemaining = user.totalReviewsAssigned - user.currentReviewPosition;
        const targetProfit = user.targetBalance - user.accountBalance;

        let calculatedPrice = targetProfit / (reviewsRemaining * commissionRate);

        // Add randomness (±15%)
        const randomFactor = 0.85 + Math.random() * 0.3;
        calculatedPrice = calculatedPrice * randomFactor;

        // Ensure price doesn't exceed 90% of current balance
        const maxPrice = user.accountBalance * 0.9;
        productPrice = Math.min(Math.floor(calculatedPrice), maxPrice);

        // Ensure minimum price of 10
        productPrice = Math.max(productPrice, 10);

        commission = productPrice * commissionRate;
      } else {
        // No target balance OR user had special products - use balance-based calculation
        // After special products, products should scale with new balance
        const minPrice = user.accountBalance * 0.40; // 40% of balance
        const maxPrice = user.accountBalance * 0.70; // 70% of balance

        productPrice = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
        commission = productPrice * commissionRate;
      }
    }

    // Deduct balance
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
      isSpecial: hasSpecialProduct
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
      newBalance: user.accountBalance,
      isSpecial: hasSpecialProduct
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
      return res.status(404).json({ message: 'No pending audits' });
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
      isBalanceNegative: user.accountBalance < 0,
      isSpecial: review.isSpecial
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
      return res.status(400).json({ message: 'No pending audit' });
    }

    // Check if balance is negative
    if (user.accountBalance < 0) {
      return res.status(400).json({
        message: 'Cannot submit audit with negative balance.',
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