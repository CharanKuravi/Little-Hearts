const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route GET /api/users/donors
// Search donors by blood type
router.get('/donors', async (req, res) => {
  try {
    const { bloodType, city, page = 1, limit = 20 } = req.query;
    const viewerId = req.user?._id; // Optional auth

    const query = { role: { $in: ['donor', 'both'] }, isAvailable: true };
    if (bloodType) query.bloodType = bloodType;
    if (city) query.city = new RegExp(city, 'i');

    const donors = await User.find(query)
      .select('-password')
      .sort({ totalDonations: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Return public profiles (hide phone/city unless connected)
    const publicDonors = donors.map(donor => donor.getPublicProfile(viewerId));

    res.json({
      success: true,
      donors: publicDonors,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/stats
// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: { $in: ['donor', 'both'] } });
    const totalRecipients = await User.countDocuments({ role: { $in: ['recipient', 'both'] } });
    const totalUsers = await User.countDocuments();

    // Blood type distribution
    const bloodTypeStats = await User.aggregate([
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalDonors,
        totalRecipients,
        totalUsers,
        bloodTypeStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
