// utils/paystack.js
const axios = require('axios');

exports.verifyPaystackPayment = async (reference) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    const { status, data } = response.data;
    
    // Payment is verified if status is true and payment status is 'success'
    return status && data.status === 'success';
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

// Get Paystack transaction details
exports.getPaymentDetails = async (reference) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    if (response.data.status) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      message: 'Could not retrieve payment details'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response ? error.response.data.message : error.message
    };
  }
};