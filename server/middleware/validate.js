// server/middleware/validate.js
const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

// Run validation and return errors if any
const runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return ApiResponse.error(res, errorMessages[0], 400, errors.array());
    }
    next();
};

// Auth validations
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required')
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    runValidation
];

const loginValidation = [
    body('email').trim().isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    runValidation
];

// Product validations
const productValidation = [
    body('title').trim().notEmpty().withMessage('Product title is required'),
    body('price').isNumeric().withMessage('Price must be a number')
        .custom(val => val >= 0).withMessage('Price cannot be negative'),
    body('category').notEmpty().withMessage('Category is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    runValidation
];

// Review validations
const reviewValidation = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Review comment is required')
        .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
    runValidation
];

// Coupon validations
const couponValidation = [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('discountType').isIn(['percent', 'fixed']).withMessage('Discount type must be percent or fixed'),
    body('discountValue').isNumeric().withMessage('Discount value must be a number'),
    body('validUntil').isISO8601().withMessage('Valid until date is required'),
    runValidation
];

// MongoDB ObjectId validation
const validateObjectId = [
    param('id').isMongoId().withMessage('Invalid ID format'),
    runValidation
];

module.exports = {
    registerValidation,
    loginValidation,
    productValidation,
    reviewValidation,
    couponValidation,
    validateObjectId,
    runValidation
};
