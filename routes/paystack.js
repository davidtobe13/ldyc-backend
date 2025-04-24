
// routes/paystack.js
const express = require('express');
const router = express.Router();
const paystackController = require('../controllers/paystackController');

/**
 * @swagger
 * /api/paystack/initialize:
 *   post:
 *     summary: Initialize a Paystack payment
 *     tags: [Paystack]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - amount
 *               - userType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               amount:
 *                 type: number
 *               userType:
 *                 type: string
 *                 enum: [camper, chaplain]
 *               metadata:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   surname:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *     responses:
 *       200:
 *         description: Payment initialized
 *       400:
 *         description: Bad request
 */
router.post('/initialize', paystackController.initializePayment);

/**
 * @swagger
 * /api/paystack/verify/{reference}:
 *   get:
 *     summary: Verify a Paystack payment
 *     tags: [Paystack]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verified
 *       400:
 *         description: Invalid payment reference
 */
router.get('/verify/:reference', paystackController.verifyPayment);

/**
 * @swagger
 * /api/paystack/webhook:
 *   post:
 *     summary: Webhook for Paystack events
 *     tags: [Paystack]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/webhook', paystackController.webhook);

module.exports = router;