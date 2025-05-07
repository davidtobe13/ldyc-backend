// controllers/participantController.js
const User = require('../models/User');

// @desc    Get all participants
// @route   GET /api/participants
// @access  Private (Admin only)

exports.getParticipants = async (req, res) => {
  try {
    const { userType, archdeaconry, status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { userType: { $in: ['camper', 'chaplain'] } };
    
    if (userType) {
      query.userType = userType;
    }
    
    if (archdeaconry) {
      query.archdeaconry = archdeaconry;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const participants = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: participants.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      },
      data: participants
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Get single participant by ID
// @route   GET /api/participants/:id
// @access  Private
exports.getParticipantById = async (req, res) => {
  try {
    const participant = await User.findById(req.params.id).select('-password');
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    // Check if user is authorized to view this participant
    // Admin can view any participant, users can only view themselves
    if (req.user.userType !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
    
    res.status(200).json({
      success: true,
      data: participant
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
exports.getParticipantByCode = async (req, res) => {
  try {
    const { code } = req.params;

    // Find by registrationCode instead of MongoDB _id
    const participant = await User.findOne({ registrationCode: code }).select('-password');

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Optional authorization check
    if (req.user.userType !== 'admin' && req.user.id !== participant._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }

    res.status(200).json({
      success: true,
      data: participant
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// @desc    Update participant status
// @route   PATCH /api/participants/:id/status
// @access  Private (Admin only)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['registered', 'passed', 'stopped'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const participant = await User.findById(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    participant.status = status;
    await participant.save();
    
    res.status(200).json({
      success: true,
      data: participant
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
