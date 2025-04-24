const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  // Basic info
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  
  // User type and roles
  userType: {
    type: String,
    enum: ['admin', 'camper', 'chaplain'],
    default: 'camper'
  },
  
  // Personal details
  title: {
    type: String,
    enum: ['Mr', 'Mrs', 'Miss', 'Dr', 'Rev', 'Prof', 'Canon'],
    required: function() { return this.userType !== 'admin'; }
  },
  firstName: {
    type: String,
    required: function() { return this.userType !== 'admin'; }
  },
  surname: {
    type: String,
    required: function() { return this.userType !== 'admin'; }
  },
  otherName: {
    type: String
  },
  name: {
    type: String,
    required: function() { return this.userType === 'admin'; }
  },
  phoneNumber: {
    type: String,
    required: function() { return this.userType !== 'admin'; },
    unique: true
  },
  
  // Church details
  archdeaconry: {
    type: String,
    required: function() { return this.userType !== 'admin'; }
  },
  parish: {
    type: String,
    required: function() { return this.userType !== 'admin'; }
  },
  
  // Registration details
  registrationCode: {
    type: String,
    unique: true,
    sparse: true
  },
  qrCode: {
    type: String
  },
  photoUrl: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['registered', 'passed', 'stopped'],
    default: 'registered'
  },
  
  // Payment details
  // paymentRef: {
  //   type: String,
  //   sparse: true
  // },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
 
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update the timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT token
UserSchema.methods.getSignedToken = function() {
  return jwt.sign(
    { id: this._id, userType: this.userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = mongoose.model('User', UserSchema);