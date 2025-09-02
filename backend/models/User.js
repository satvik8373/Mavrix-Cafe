const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: function() { return this.role === 'user'; },
    unique: false,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'staff'],
    default: 'user',
    index: true
  },
  username: {
    type: String,
    required: function() { return this.role !== 'user'; },
    unique: false,
    trim: true
  },
  passwordHash: {
    type: String,
    required: function() { return this.role !== 'user'; }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    required: false
  },
  verificationExpiry: {
    type: Date,
    required: false
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Indexes
userSchema.index({ phoneNumber: 1 });
userSchema.index({ username: 1, role: 1 });

// Method to check if verification code is expired
userSchema.methods.isVerificationExpired = function() {
  return this.verificationExpiry && new Date() > this.verificationExpiry;
};

// Method to generate new verification code
userSchema.methods.generateVerificationCode = function() {
  this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return this.verificationCode;
};

module.exports = mongoose.model('User', userSchema);
