// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
    createRazorpayOrder, verifyPayment, handleWebhook, getPaymentByOrder
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook (public, verified by Razorpay signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/order/:orderId', protect, getPaymentByOrder);

module.exports = router;
