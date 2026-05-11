const express = require('express');
const router = express.Router();
const { sendMessage } = require('../services/chatService');
const { protect } = require('../middleware/auth');

// @route POST /api/chat/message
router.post('/message', protect, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: 'Message too long (max 1000 characters)' });
    }

    const response = await sendMessage(message.trim(), history || []);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
