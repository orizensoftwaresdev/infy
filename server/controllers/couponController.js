// server/controllers/couponController.js
const Coupon = require('../models/Coupon');
const ApiResponse = require('../utils/apiResponse');

// @desc    Validate coupon
// @route   POST /api/v1/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res, next) => {
    try {
        const { code, cartTotal } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return ApiResponse.error(res, 'Invalid coupon code', 404);
        }

        const validation = coupon.isValid(cartTotal);
        if (!validation.valid) {
            return ApiResponse.error(res, validation.message, 400);
        }

        const discount = coupon.calculateDiscount(cartTotal);

        return ApiResponse.success(res, {
            coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
            discount,
            finalAmount: cartTotal - discount
        }, 'Coupon applied successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/v1/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return ApiResponse.success(res, coupons);
    } catch (error) {
        next(error);
    }
};

// @desc    Create coupon (Admin)
// @route   POST /api/v1/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        return ApiResponse.created(res, { coupon }, 'Coupon created successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!coupon) return ApiResponse.error(res, 'Coupon not found', 404);
        return ApiResponse.success(res, { coupon }, 'Coupon updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return ApiResponse.error(res, 'Coupon not found', 404);
        return ApiResponse.success(res, null, 'Coupon deleted');
    } catch (error) {
        next(error);
    }
};
