// utils/registration.js
const QRCode = require('qrcode');
const User = require('../models/User');

// Generate unique registration code
exports.generateRegistrationCode = async (userType, archdeaconry) => {
  const prefix = userType === 'camper' || "chaplain" ? 'LDYC' : 'ADMIN';
  const archdPrefix = archdeaconry.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().substring(2);
  
  // Get count of participants with this prefix
  const count = await User.countDocuments({
    userType,
    archdeaconry,
    registrationCode: { $regex: `^${prefix}-${archdPrefix}-${year}` }
  });
  
  // Format the count with leading zeros
  const countFormatted = (count + 1).toString().padStart(4, '0');
  
  // Create registration code
  return `${prefix}-${archdPrefix}-${year}-${countFormatted}`;
};

// Generate QR code from registration code
exports.generateQRCode = async (registrationCode) => {
  try {
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(registrationCode);
    return qrDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};