const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route POST /api/connections/request/:userId
// Send connection request to another user
router.post('/request/:userId', protect, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const requesterId = req.user._id;

    if (targetUserId === requesterId.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if connection already exists
    const existingConnection = targetUser.connections.find(
      conn => conn.user.toString() === requesterId.toString()
    );

    if (existingConnection) {
      if (existingConnection.status === 'pending') {
        return res.status(400).json({ message: 'Connection request already sent' });
      }
      if (existingConnection.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected' });
      }
      if (existingConnection.status === 'rejected') {
        // Allow re-requesting after rejection
        existingConnection.status = 'pending';
        existingConnection.createdAt = new Date();
      }
    } else {
      // Add connection request to target user
      targetUser.connections.push({
        user: requesterId,
        status: 'pending',
        requestedBy: requesterId
      });
    }

    // Also add to requester's connections
    const requester = await User.findById(requesterId);
    const requesterConnection = requester.connections.find(
      conn => conn.user.toString() === targetUserId
    );

    if (!requesterConnection) {
      requester.connections.push({
        user: targetUserId,
        status: 'pending',
        requestedBy: requesterId
      });
      await requester.save();
    }

    await targetUser.save();

    res.json({ 
      success: true, 
      message: 'Connection request sent successfully',
      status: 'pending'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route PUT /api/connections/respond/:userId
// Accept or reject connection request
router.put('/respond/:userId', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const requesterId = req.params.userId;
    const currentUserId = req.user._id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update current user's connections
    const currentUser = await User.findById(currentUserId);
    const connection = currentUser.connections.find(
      conn => conn.user.toString() === requesterId && conn.requestedBy.toString() === requesterId
    );

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    connection.status = status;
    await currentUser.save();

    // Update requester's connections
    const requester = await User.findById(requesterId);
    const requesterConnection = requester.connections.find(
      conn => conn.user.toString() === currentUserId.toString()
    );

    if (requesterConnection) {
      requesterConnection.status = status;
      await requester.save();
    }

    res.json({ 
      success: true, 
      message: `Connection request ${status}`,
      status
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route GET /api/connections/requests
// Get all pending connection requests (both received and sent)
router.get('/requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'connections.user',
      select: 'name bloodType city age bio totalDonations'
    });

    // Return ALL pending requests with isSentByMe flag
    const pendingRequests = user.connections
      .filter(conn => conn.status === 'pending')
      .map(conn => ({
        _id: conn._id,
        user: conn.user,
        createdAt: conn.createdAt,
        isSentByMe: conn.requestedBy.toString() === req.user._id.toString()
      }));

    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/connections/list
// Get all accepted connections
router.get('/list', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'connections.user',
      select: 'name phone bloodType city age bio totalDonations email'
    });

    const acceptedConnections = user.connections
      .filter(conn => conn.status === 'accepted')
      .map(conn => conn.user);

    res.json(acceptedConnections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/connections/status/:userId
// Check connection status with a specific user
router.get('/status/:userId', protect, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const user = await User.findById(req.user._id);

    const connection = user.connections.find(
      conn => conn.user.toString() === targetUserId
    );

    if (!connection) {
      return res.json({ status: null, canRequest: true });
    }

    const isRequester = connection.requestedBy.toString() === req.user._id.toString();

    res.json({ 
      status: connection.status,
      isRequester,
      canRequest: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/connections/:userId
// Remove connection
router.delete('/:userId', protect, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Remove from current user
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { connections: { user: targetUserId } }
    });

    // Remove from target user
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { connections: { user: currentUserId } }
    });

    res.json({ success: true, message: 'Connection removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
