const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

// Admin authentication middleware
const adminOnly = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// @route GET /api/admin/stats
// Get dashboard statistics
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalRecipients,
      totalRequests,
      activeRequests,
      totalDonations,
      totalConnections,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ['donor', 'both'] } }),
      User.countDocuments({ role: { $in: ['recipient', 'both'] } }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'active' }),
      Donation.countDocuments(),
      User.aggregate([
        { $unwind: '$connections' },
        { $match: { 'connections.status': 'accepted' } },
        { $count: 'total' }
      ]),
      ActivityLog.find().sort({ timestamp: -1 }).limit(10).populate('user', 'name email')
    ]);

    // Blood type distribution
    const bloodTypeStats = await User.aggregate([
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Requests by urgency
    const urgencyStats = await BloodRequest.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    // Activity by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activityByDay = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalDonors,
        totalRecipients,
        totalRequests,
        activeRequests,
        totalDonations,
        totalConnections: totalConnections[0]?.total || 0
      },
      bloodTypeStats,
      urgencyStats,
      activityByDay,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/admin/users
// Get all users with pagination
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const bloodType = req.query.bloodType || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (bloodType) query.bloodType = bloodType;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/admin/requests
// Get all blood requests with pagination
router.get('/requests', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const urgency = req.query.urgency || '';
    const bloodType = req.query.bloodType || '';

    const query = {};
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodType) query.bloodType = bloodType;

    const requests = await BloodRequest.find(query)
      .populate('recipient', 'name email phone bloodType')
      .populate('respondedDonors', 'name bloodType')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await BloodRequest.countDocuments(query);

    res.json({
      requests,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/admin/logs
// Get activity logs with pagination
router.get('/logs', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const action = req.query.action || '';
    const userId = req.query.userId || '';

    const query = {};
    if (action) query.action = action;
    if (userId) query.user = userId;

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/admin/users/:id/status
// Update user status (ban/unban)
router.put('/users/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log admin action
    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_ACTION',
      details: {
        targetUser: user._id,
        action: isActive ? 'UNBAN_USER' : 'BAN_USER'
      }
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/admin/users/:id
// Delete user (admin only)
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's requests
    await BloodRequest.deleteMany({ recipient: user._id });

    // Delete user's donations
    await Donation.deleteMany({ donor: user._id });

    // Remove user from connections
    await User.updateMany(
      { 'connections.user': user._id },
      { $pull: { connections: { user: user._id } } }
    );

    // Delete user
    await user.deleteOne();

    // Log admin action
    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_ACTION',
      details: {
        targetUser: user._id,
        action: 'DELETE_USER',
        userName: user.name
      }
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/admin/requests/:id
// Delete blood request (admin only)
router.delete('/requests/:id', protect, adminOnly, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await request.deleteOne();

    // Log admin action
    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_ACTION',
      details: {
        targetRequest: request._id,
        action: 'DELETE_REQUEST'
      }
    });

    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
