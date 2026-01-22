// backend/routes/user.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile image
router.post('/profile/image', authMiddleware, async (req, res) => {
  try {
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileImage = profileImage;
    await user.save();

    res.json({
      message: 'Profile image updated successfully',
      profileImage: user.profileImage
    });
  } catch (err) {
    console.error('Error updating profile image:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's group link
router.get('/group-link', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('groupLink');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ groupLink: user.groupLink || '' });
  } catch (err) {
    console.error('Error fetching group link:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;