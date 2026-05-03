const ActivityLog = require('../models/ActivityLog');

// Middleware to log activities
const logActivity = (action) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function
    res.send = function(data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log activity asynchronously (don't block response)
        ActivityLog.create({
          user: req.user?._id || null,
          action,
          details: {
            method: req.method,
            path: req.path,
            params: req.params,
            query: req.query,
            body: sanitizeBody(req.body, action)
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent')
        }).catch(err => console.error('Failed to log activity:', err));
      }
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Remove sensitive data from logs
function sanitizeBody(body, action) {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // Remove passwords
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.currentPassword) sanitized.currentPassword = '[REDACTED]';
  if (sanitized.newPassword) sanitized.newPassword = '[REDACTED]';
  
  // Remove sensitive fields based on action
  if (action === 'USER_REGISTER' || action === 'USER_UPDATE') {
    if (sanitized.aadhar) sanitized.aadhar = '[REDACTED]';
  }
  
  return sanitized;
}

module.exports = { logActivity };
