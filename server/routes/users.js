const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route GET /api/users/donors
router.get('/donors', async (req, res) => {
  try {
    const { bloodType, city, page = 1, limit = 20 } = req.query;
    const viewerId = req.user?._id;

    const query = { role: { $in: ['donor', 'both'] }, isAvailable: true };
    if (bloodType) query.bloodType = bloodType;
    if (city) query.city = new RegExp(city, 'i');

    const donors = await User.find(query)
      .select('-password')
      .sort({ totalDonations: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);
    const publicDonors = donors.map(donor => donor.getPublicProfile(viewerId));

    res.json({ success: true, donors: publicDonors, total, pages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/stats
router.get('/stats', async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: { $in: ['donor', 'both'] } });
    const totalRecipients = await User.countDocuments({ role: { $in: ['recipient', 'both'] } });
    const totalUsers = await User.countDocuments();
    const bloodTypeStats = await User.aggregate([
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, stats: { totalDonors, totalRecipients, totalUsers, bloodTypeStats } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/thalassemia — list all thalassemia patients
router.get('/thalassemia', protect, async (req, res) => {
  try {
    const patients = await User.find({ role: 'thalassemia' })
      .select('name bloodType city transfusionSchedule karmaScore totalDonations')
      .sort({ 'transfusionSchedule.nextTransfusionDate': 1 });

    // Auto-advance past transfusion dates
    const now = new Date();
    const result = patients.map(p => {
      const obj = p.toObject();
      if (obj.transfusionSchedule?.nextTransfusionDate) {
        let next = new Date(obj.transfusionSchedule.nextTransfusionDate);
        const freq = obj.transfusionSchedule.frequencyWeeks || 3;
        while (next < now) {
          next = new Date(next.getTime() + freq * 7 * 24 * 60 * 60 * 1000);
        }
        obj.transfusionSchedule.nextTransfusionDate = next;
        const daysUntil = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
        obj.daysUntilTransfusion = daysUntil;
      }
      return obj;
    });

    res.json({ patients: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/:id/badges — public, no auth
router.get('/:id/badges', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('badges donationStreak karmaScore totalDonations name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      badges: user.badges || [],
      donationStreak: user.donationStreak || 0,
      karmaScore: user.karmaScore || 0,
      totalDonations: user.totalDonations || 0,
      name: user.name,
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
