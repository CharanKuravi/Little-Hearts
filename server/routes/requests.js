const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const { protect } = require('../middleware/auth');
const { getMatchesForRequest } = require('../services/matchingEngine');

// @route GET /api/requests
router.get('/', async (req, res) => {
  try {
    const { bloodType, urgency, city, status = 'open', page = 1, limit = 20 } = req.query;

    const query = { status };
    if (bloodType) query.bloodType = bloodType;
    if (urgency) query.urgency = urgency;
    if (city) query.city = new RegExp(city, 'i');

    const requests = await BloodRequest.find(query)
      .populate('recipient', 'name phone bloodType city')
      .sort({ urgency: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BloodRequest.countDocuments(query);

    res.json({
      success: true,
      requests,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/requests
router.post('/', protect, async (req, res) => {
  try {
    const { bloodType, urgency, units, hospital, city, description } = req.body;

    const request = await BloodRequest.create({
      recipient: req.user._id,
      bloodType,
      urgency,
      units,
      hospital,
      city,
      description
    });

    await request.populate('recipient', 'name phone bloodType city');

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route POST /api/requests/:id/respond
// Donor responds to a request
router.post('/:id/respond', protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Check if already responded
    const alreadyResponded = request.respondedDonors.find(
      r => r.donor.toString() === req.user._id.toString()
    );
    if (alreadyResponded) {
      return res.status(400).json({ message: 'You have already responded to this request' });
    }

    request.respondedDonors.push({ donor: req.user._id });
    if (request.status === 'open') request.status = 'in-progress';
    await request.save();

    await request.populate('recipient', 'name phone bloodType city');
    await request.populate('respondedDonors.donor', 'name phone bloodType city');

    res.json({ success: true, request });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route PUT /api/requests/:id
// Update request status
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();

    res.json({ success: true, request });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route GET /api/requests/:id/matches
// Get top-10 matched donors for a blood request (must be before GET /:id)
router.get('/:id/matches', protect, async (req, res) => {
  try {
    const result = await getMatchesForRequest(req.params.id, req.user._id);
    res.json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
});

// @route GET /api/requests/:id
// Get single request details
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('recipient', 'name phone bloodType city')
      .populate('respondedDonors.donor', 'name phone bloodType city');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/requests/my
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ recipient: req.user._id })
      .populate('respondedDonors.donor', 'name phone bloodType city')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/requests/:id
// Delete a blood request (only owner can delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or you are not authorized to delete it' });
    }

    await BloodRequest.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
