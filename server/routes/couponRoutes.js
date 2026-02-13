// server/routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const {
    validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');
const { couponValidation, validateObjectId } = require('../middleware/validate');

// User route
router.post('/validate', protect, validateCoupon);

// Admin routes
router.get('/', protect, authorize('admin'), getCoupons);
router.post('/', protect, authorize('admin'), couponValidation, createCoupon);
router.put('/:id', protect, authorize('admin'), validateObjectId, updateCoupon);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteCoupon);

module.exports = router;
