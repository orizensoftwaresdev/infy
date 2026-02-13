// server/controllers/paymentController.js
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { sendPaymentSuccess, sendPaymentFailed } = require('../utils/emailService');

// Initialize Razorpay
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET
    });
};

// @desc    Create Razorpay order
// @route   POST /api/v1/payments/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return ApiResponse.error(res, 'Order not found', 404);
        }

        if (order.user.toString() !== req.user.id) {
            return ApiResponse.error(res, 'Not authorized', 403);
        }

        const razorpay = getRazorpayInstance();

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100), // Amount in paise
            currency: 'INR',
            receipt: order.orderNumber,
            notes: {
                orderId: order._id.toString(),
                userId: req.user.id
            }
        });

        // Save payment record
        await Payment.create({
            order: order._id,
            user: req.user.id,
            razorpayOrderId: razorpayOrder.id,
            amount: order.totalAmount,
            status: 'created'
        });

        // Update order with razorpay order id
        order.paymentInfo.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return ApiResponse.success(res, {
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        }, 'Razorpay order created');
    } catch (error) {
        next(error);
    }
};

// @desc    Verify payment
// @route   POST /api/v1/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        // Update payment record
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (payment) {
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = isValid ? 'captured' : 'failed';
            await payment.save();
        }

        // Update order
        const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpay_order_id });
        if (order) {
            if (isValid) {
                order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
                order.paymentInfo.status = 'paid';
                order.paymentInfo.paidAt = Date.now();
                order.status = 'confirmed';
            } else {
                order.paymentInfo.status = 'failed';
            }
            await order.save();
            // Send payment emails
            _sendPaymentEmails(order, isValid);
        }

        if (!isValid) {
            return ApiResponse.error(res, 'Payment verification failed', 400);
        }

        return ApiResponse.success(res, { order }, 'Payment verified successfully');
    } catch (error) {
        next(error);
    }
};

// Send payment emails (fire-and-forget helper used after verify)
const _sendPaymentEmails = async (order, isValid) => {
    try {
        const user = await User.findById(order.user);
        if (!user) return;
        if (isValid) {
            sendPaymentSuccess(order, user).catch(e => console.error('Payment email error:', e.message));
        } else {
            sendPaymentFailed(order, user).catch(e => console.error('Payment failed email error:', e.message));
        }
    } catch (e) { console.error('Email lookup error:', e.message); }
};

// @desc    Handle Razorpay webhook
// @route   POST /api/v1/payments/webhook
// @access  Public (verified by signature)
exports.handleWebhook = async (req, res, next) => {
    try {
        const webhookSecret = process.env.RAZORPAY_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        const paymentEntity = req.body.payload?.payment?.entity;

        if (event === 'payment.captured') {
            const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
            if (payment) {
                payment.razorpayPaymentId = paymentEntity.id;
                payment.status = 'captured';
                payment.method = paymentEntity.method;
                await payment.save();

                const order = await Order.findById(payment.order);
                if (order && order.paymentInfo.status !== 'paid') {
                    order.paymentInfo.status = 'paid';
                    order.paymentInfo.razorpayPaymentId = paymentEntity.id;
                    order.paymentInfo.paidAt = Date.now();
                    order.status = 'confirmed';
                    await order.save();
                }
            }
        } else if (event === 'payment.failed') {
            const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
            if (payment) {
                payment.status = 'failed';
                payment.errorCode = paymentEntity.error_code;
                payment.errorDescription = paymentEntity.error_description;
                await payment.save();
            }
        }

        return res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ status: 'error' });
    }
};

// @desc    Get payment by order id
// @route   GET /api/v1/payments/order/:orderId
// @access  Private
exports.getPaymentByOrder = async (req, res, next) => {
    try {
        const payment = await Payment.findOne({ order: req.params.orderId });
        if (!payment) {
            return ApiResponse.error(res, 'Payment not found', 404);
        }
        return ApiResponse.success(res, { payment });
    } catch (error) {
        next(error);
    }
};
