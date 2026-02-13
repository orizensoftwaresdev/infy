// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
    register, login, getMe, updateProfile, updatePassword,
    forgotPassword, resetPassword,
    addAddress, updateAddress, deleteAddress,
    toggleWishlist
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

// Address routes
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Wishlist
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
