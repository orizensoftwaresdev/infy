// server/models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percent', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: 0
    },
    minPurchase: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    usageLimit: {
        type: Number,
        default: null // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function (cartTotal) {
    const now = new Date();
    if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
    if (now < this.validFrom) return { valid: false, message: 'Coupon is not yet active' };
    if (now > this.validUntil) return { valid: false, message: 'Coupon has expired' };
    if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
    if (cartTotal < this.minPurchase) return { valid: false, message: `Minimum purchase of ₹${this.minPurchase} required` };
    return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (cartTotal) {
    let discount = 0;
    if (this.discountType === 'percent') {
        discount = (cartTotal * this.discountValue) / 100;
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else {
        discount = this.discountValue;
    }
    return Math.min(discount, cartTotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
