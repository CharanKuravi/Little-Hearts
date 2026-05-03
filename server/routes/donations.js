const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route POST /api/donations
router.post('/', protect, async (req, res) => {
  try {
    const { recipient, request, bloodType, units, hospital, notes } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      recipient,
      request,
      bloodType,
      units,
      hospital,
      notes
    });

    // Update donor stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalDonations: 1 },
      lastDonated: new Date()
    });

    res.status(201).json({ success: true, donation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route GET /api/donations/my
router.get('/my', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('recipient', 'name phone bloodType')
      .sort({ donatedAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/donations/stats
router.get('/stats', async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const totalUnits = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$units' } } }
    ]);

    res.json({
      success: true,
      totalDonations,
      totalUnits: totalUnits[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/donations/:id
// Delete a donation record (only donor can delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      donor: req.user._id
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found or you are not authorized to delete it' });
    }

    await Donation.findByIdAndDelete(req.params.id);

    // Update donor stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalDonations: -1 }
    });

    res.json({ success: true, message: 'Donation deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
