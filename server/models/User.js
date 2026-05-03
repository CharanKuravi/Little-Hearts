const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be less than 20 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  aadhar: {
    type: String,
    required: [true, 'Aadhar number is required'],
    unique: true,
    trim: true,
    minlength: [12, 'Aadhar must be 12 digits'],
    maxlength: [12, 'Aadhar must be 12 digits']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  bloodType: {
    type: String,
    required: [true, 'Blood type is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  role: {
    type: String,
    enum: ['donor', 'recipient', 'both', 'admin'],
    default: 'donor'
  },
  city: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 18,
    max: 65
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastDonated: {
    type: Date
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    maxlength: 200
  },
  avatar: {
    type: String,
    default: ''
  },
  // Privacy & Connection System
  connections: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Get public profile (hides phone and city unless connected)
userSchema.methods.getPublicProfile = function(viewerId) {
  const obj = this.toJSON();
  
  // Check if viewer is connected
  const isConnected = this.connections.some(
    conn => conn.user.toString() === viewerId?.toString() && conn.status === 'accepted'
  );
  
  if (!isConnected) {
    // Hide sensitive info
    delete obj.phone;
    delete obj.city;
    delete obj.aadhar;
    delete obj.email;
    obj.phoneHidden = true;
    obj.cityHidden = true;
  }
  
  delete obj.connections; // Don't expose connections list
  return obj;
};

// Check if two users are connected
userSchema.methods.isConnectedWith = function(userId) {
  return this.connections.some(
    conn => conn.user.toString() === userId.toString() && conn.status === 'accepted'
  );
};

// Get connection status with another user
userSchema.methods.getConnectionStatus = function(userId) {
  const connection = this.connections.find(
    conn => conn.user.toString() === userId.toString()
  );
  return connection ? connection.status : null;
};

module.exports = mongoose.model('User', userSchema);
