// server/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
        default: 'created'
    },
    method: {
        type: String,
        default: ''
    },
    errorCode: String,
    errorDescription: String
}, {
    timestamps: true
});

paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
