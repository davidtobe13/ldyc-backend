// controllers/authController.js
const crypto = require('crypto');
const User = require('../models/User');
const { verifyPaystackPayment } = require('../utils/paystack');
const { generateRegistrationCode, generateQRCode } = require('../utils/registration');
const {  sendRegistrationEmail } = require('../utils/email');
const { registrationValidation } = require('../utils/validation');

// @desc    Register admin
// @route   POST /api/auth/register/admin
// @access  Private (Admin only)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new admin
    const admin = await User.create({
      name,
      email,
      password,
      userType: 'admin'
    });

    // Return token
    sendTokenResponse(admin, 201, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Register participant (camper or chaplain)
// @route   POST /api/auth/register/participant
// @access  Public
exports.registerParticipant = async (req, res) => {
  try {
    // Validate request body
    const { error } = registrationValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      userType, // "camper" or "chaplain"
      archdeaconry,
      parish,
      title,
      dob,
      surname,
      firstName,
      otherName,
      email,
      phoneNumber,
      password,
      paymentRef // From Paystack
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email is already registered",
      });
    }
    // Verify payment with Paystack
    const paymentVerified = await verifyPaystackPayment(paymentRef);
    if (!paymentVerified) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Generate registration code
    const registrationCode = await generateRegistrationCode(userType, archdeaconry);
    
    // Generate QR code
    const qrCode = await generateQRCode(registrationCode);

    // Create new participant
    const newParticipant = new User({
      userType,
      archdeaconry,
      parish,
      dob,
      title,
      surname,
      firstName,
      otherName,
      email,
      phoneNumber,
      password,
      registrationCode,
      qrCode,
      isVerified: false,
      status: "registered", // Initial status (registered, passed, stopped)
      paymentRef,
      paymentStatus: "paid"
    });

    if (req.file) {
      // Store photo path or processed photo
      newParticipant.photoUrl = req.file.path;
    }

    await newParticipant.save();

    // Generate and send ID card
    // const idCardUrl = await generateIDCard(newParticipant);

    // Send confirmation email with registration details
    await sendRegistrationEmail(
      newParticipant.email, 
      registrationCode, 
      qrCode,
      // idCardUrl
    );

    res.status(201).json({
      message: "Registration successful",
      newParticipant
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Verify registration code
// @route   GET /api/auth/verify-code/:registrationCode
// @access  Public
exports.verifyRegistrationCode = async (req, res) => {
  try {
    const { registrationCode } = req.params;

    const user = await User.findOne({ registrationCode });
    if (!user) {
      return res.status(404).json({ message: 'Invalid registration code' });
    }

    // Update verification status if not already verified
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        firstName: user.firstName,
        surname: user.surname,
        userType: user.userType,
        archdeaconry: user.archdeaconry,
        parish: user.parish,
        status: user.status,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedToken();

  res.status(statusCode).json({
    success: true,
    token
  });
};
