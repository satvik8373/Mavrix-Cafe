const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'staff', 'admin'],
    default: 'user',
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  phoneNumber: {
    type: String,
    required: function() { return this.role === 'user'; },
    unique: true,
    sparse: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
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
  }
});

// Index for phone number lookups
userSchema.index({ phoneNumber: 1 });

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
