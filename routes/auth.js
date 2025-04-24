// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         userType:
 *           type: string
 *           enum: [admin, camper, chaplain]
 *         title:
 *           type: string
 *           enum: [Mr, Mrs, Miss, Dr, Rev, Prof, Canon]
 *         firstName:
 *           type: string
 *         surname:
 *           type: string
 *         otherName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phoneNumber:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *         archdeaconry:
 *           type: string
 *         parish:
 *           type: string
 *         paymentRef:
 *           type: string
 *       example:
 *         userType: camper
 *         title: Mr
 *         firstName: John
 *         surname: Doe
 *         email: john@example.com
 *         phoneNumber: "08012345678"
 *         password: password123
 *         archdeaconry: Central
 *         parish: St. John's
 *         paymentRef: ref_123456789
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 */

/**
 * @swagger
 * /api/auth/register/admin:
 *   post:
 *     summary: Register a new admin user
 *     description: Creates a new admin account (protected route)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/register/admin', protect, authorize('admin'), authController.registerAdmin);

/**
 * @swagger
 * /api/auth/register/participant:
 *   post:
 *     summary: Register a new participant (camper or chaplain)
 *     description: Creates a new participant account with payment verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [camper, chaplain]
 *               title:
 *                 type: string
 *               firstName:
 *                 type: string
 *               surname:
 *                 type: string
 *               otherName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               archdeaconry:
 *                 type: string
 *               parish:
 *                 type: string
 *               paymentRef:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Participant registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/register/participant', upload.single('photo'), authController.registerParticipant);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user and returns a token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/verify-code/{registrationCode}:
 *   get:
 *     summary: Verify a participant's registration code
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: registrationCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registration code verified
 *       404:
 *         description: Invalid registration code
 */
router.get('/verify-code/:registrationCode', authController.verifyRegistrationCode);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, authController.getMe);

module.exports = router;
