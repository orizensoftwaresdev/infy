// server/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    title: String,
    image: String,
    price: {
        type: Number,
        required: true
    },
    size: String,
    color: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
    },
    paymentInfo: {
        method: {
            type: String,
            enum: ['razorpay', 'cod'],
            default: 'razorpay'
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        paidAt: Date,
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending'
        }
    },
    itemsTotal: {
        type: Number,
        required: true
    },
    shippingCharge: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    couponUsed: {
        type: String,
        default: null
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    trackingInfo: {
        carrier: String,
        trackingNumber: String,
        trackingUrl: String
    },
    deliveredAt: Date,
    cancelledAt: Date,
    notes: String
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `VP${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
