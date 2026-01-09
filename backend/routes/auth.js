// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// User Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, phoneNumber, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }, { phoneNumber }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email, username, or phone number' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      accountBalance: 0,
      totalReviewsAssigned: 30
    });

    await user.save();

    // Create token with longer expiration
    const token = jwt.sign(
      { userId: user._id, role: 'user' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' } // 30 days
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        accountBalance: user.accountBalance
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is frozen
    if (user.isFrozen) {
      return res.status(403).json({ message: 'Your account has been frozen. Please contact support.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token with longer expiration
    const token = jwt.sign(
      { userId: user._id, role: 'user' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' } // 30 days
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        accountBalance: user.accountBalance
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token with longer expiration
    const token = jwt.sign(
      { adminId: admin._id, role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' } // 30 days
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;