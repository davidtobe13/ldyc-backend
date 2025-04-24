// controllers/paystackController.js
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const { sendRegistrationEmail } = require('../utils/email');

// @desc    Initialize payment
// @route   POST /api/paystack/initialize
// @access  Public
exports.initializePayment = async (req, res) => {
  try {
    const { email, amount, userType, metadata } = req.body;
    
    if (!email || !amount || !userType) {
      return res.status(400).json({ message: 'Please provide email, amount and user type' });
    }
    
    // Amount should be in kobo (multiply by 100)
    const amountInKobo = amount * 100;
    
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountInKobo,
        metadata: {
          userType,
          ...metadata
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'Payment initialization failed',
      error: error.response ? error.response.data : error.message
    });
  }
};

// @desc    Verify payment
// @route   GET /api/paystack/verify/:reference
// @access  Public
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    const { status, data } = response.data;
    
    if (status) {
      const paymentStatus = data.status === 'success' ? 'paid' : 'failed';
      
      res.status(200).json({
        success: true,
        data: {
          reference: data.reference,
          amount: data.amount / 100, // Convert back to original currency
          status: paymentStatus,
          metadata: data.metadata
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Payment verification failed',
      error: error.response ? error.response.data : error.message
    });
  }
};

// @desc    Paystack webhook
// @route   POST /api/paystack/webhook
// @access  Public
exports.webhook = async (req, res) => {
  try {
    // Validate event
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');
      
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    const event = req.body;
    
    // Handle successful charge
    if (event.event === 'charge.success') {
      const { reference, status, metadata } = event.data;
      
      // Update payment status if this is a payment for registration
      if (metadata && metadata.userType) {
        // This is a pre-registration payment, nothing to update yet
        console.log(`Payment successful for ${metadata.userType}: ${reference}`);
      } else {
        // Look for user with this payment reference and update status
        const user = await User.findOne({ paymentRef: reference });
        
        if (user) {
          user.paymentStatus = status === 'success' ? 'paid' : 'failed';
          await user.save();
          
          // Send confirmation email if payment successful
          if (user.paymentStatus === 'paid') {
            await sendRegistrationEmail(
              user.email,
              user.registrationCode,
              user.qrCode,
              // user.idCardUrl
            );
          }
        }

    }
}

// Always respond with 200 to Paystack
res.status(200).json({ message: 'Webhook received' });
} catch (error) {
console.error('Webhook error:', error);

// Still return 200 to Paystack
res.status(200).json({ message: 'Webhook received' });
}
};