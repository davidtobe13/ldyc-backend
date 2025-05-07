
// routes/participant.js
const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/participants:
 *   get:
 *     summary: Get all participants
 *     description: Retrieves a list of all participants (admin only)
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [camper, chaplain]
 *         description: Filter by user type
 *       - in: query
 *         name: archdeaconry
 *         schema:
 *           type: string
 *         description: Filter by archdeaconry
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [registered, passed, stopped]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: List of participants
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, authorize('admin'), participantController.getParticipants);

/**
 * @swagger
 * /api/participants/{id}:
 *   get:
 *     summary: Get participant by ID
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant details
 *       404:
 *         description: Participant not found
 */
router.get('/:id', protect, participantController.getParticipantById);

/**
 * @swagger
 * /api/participants/{code}:
 *   get:
 *     summary: Get participant by registration code
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant details
 *       404:
 *         description: Participant not found
 */
router.get('/:code', protect, participantController.getParticipantByCode);

/**
 * @swagger
 * /api/participants/{id}/status:
 *   patch:
 *     summary: Update participant status
 *     description: Updates a participant's status (admin only)
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [registered, passed, stopped]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Participant not found
 */
router.patch('/:id/status', protect, authorize('admin'), participantController.updateStatus);

module.exports = router;
