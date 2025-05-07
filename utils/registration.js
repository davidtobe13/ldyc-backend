// utils/registration.js
const QRCode = require('qrcode');
const User = require('../models/User');

// Generate unique registration code
const year = new Date().getFullYear().toString().substring(2);
exports.generateRegistrationCode = async (userType, archdeaconry) => {
  const prefix = userType === 'camper' || "chaplain" ? `LDYC${year}` : 'ADMIN';
  const typePrefix = userType.substring(0, 4).toUpperCase();
  const archPrefix = archdeaconry.substring(0, 2).toUpperCase();
  
  // Get count of participants with this prefix
  const count = await User.countDocuments({
    userType,
    archdeaconry,
    registrationCode: { $regex: `^${prefix}/${typePrefix}` }
  });
  
  // Format the count with leading zeros
  const countFormatted = (count + 1).toString().padStart(4, '0');
  
  // Create registration code
  if(userType === "chaplain"){
  return `${prefix}/${typePrefix}/${countFormatted}`;
  }
  else{
    return `${prefix}/${typePrefix}/${archPrefix}/${countFormatted}`;

  }
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