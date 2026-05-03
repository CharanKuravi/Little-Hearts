const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, phone, aadhar, email, password, bloodType, role, city, age } = req.body;

    // Validate username
    if (!username || username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: 'Username must be 3-20 characters' });
    }

    // Validate aadhar
    if (!aadhar || aadhar.length !== 12 || !/^\d{12}$/.test(aadhar)) {
      return res.status(400).json({ message: 'Aadhar must be exactly 12 digits' });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const existingAadhar = await User.findOne({ aadhar });
    if (existingAadhar) {
      return res.status(400).json({ message: 'Aadhar number already registered' });
    }

    const user = await User.create({
      name, username: username.toLowerCase(), phone, aadhar, email, password, bloodType, role, city, age
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @route PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, city, age, bio, isAvailable, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, city, age, bio, isAvailable, role },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/auth/account
// Delete user account (with all associated data)
router.delete('/account', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user's blood requests
    await require('../models/BloodRequest').deleteMany({ recipient: userId });

    // Delete user's donations
    await require('../models/Donation').deleteMany({ donor: userId });

    // Remove user from respondedDonors in other requests
    await require('../models/BloodRequest').updateMany(
      { 'respondedDonors.donor': userId },
      { $pull: { respondedDonors: { donor: userId } } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
