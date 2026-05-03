const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_REGISTER',
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_UPDATE',
      'USER_DELETE',
      'REQUEST_CREATE',
      'REQUEST_UPDATE',
      'REQUEST_DELETE',
      'REQUEST_RESPOND',
      'DONATION_CREATE',
      'DONATION_DELETE',
      'CONNECTION_REQUEST',
      'CONNECTION_ACCEPT',
      'CONNECTION_REJECT',
      'CONNECTION_DELETE',
      'ADMIN_LOGIN',
      'ADMIN_ACTION'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
