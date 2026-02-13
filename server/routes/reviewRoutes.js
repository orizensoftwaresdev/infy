// server/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const {
    createReview, getProductReviews, updateReview, deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewValidation, validateObjectId } = require('../middleware/validate');

// Public
router.get('/:productId', getProductReviews);

// Protected
router.post('/:productId', protect, reviewValidation, createReview);
router.put('/:id', protect, validateObjectId, updateReview);
router.delete('/:id', protect, validateObjectId, deleteReview);

module.exports = router;
