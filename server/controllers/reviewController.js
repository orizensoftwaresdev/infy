// server/controllers/reviewController.js
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create review
// @route   POST /api/v1/reviews/:productId
// @access  Private
exports.createReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;

        // Check product exists
        const product = await Product.findById(productId);
        if (!product) {
            return ApiResponse.error(res, 'Product not found', 404);
        }

        // Check if user already reviewed
        const existingReview = await Review.findOne({ user: req.user.id, product: productId });
        if (existingReview) {
            return ApiResponse.error(res, 'You have already reviewed this product', 400);
        }

        const review = await Review.create({
            user: req.user.id,
            product: productId,
            rating,
            comment
        });

        const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

        return ApiResponse.created(res, { review: populatedReview }, 'Review submitted successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews for a product
// @route   GET /api/v1/reviews/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ product: req.params.productId, isApproved: true })
                .populate('user', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Review.countDocuments({ product: req.params.productId, isApproved: true })
        ]);

        return ApiResponse.paginated(res, reviews, {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);
        if (!review) return ApiResponse.error(res, 'Review not found', 404);

        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return ApiResponse.error(res, 'Not authorized', 403);
        }

        review.rating = req.body.rating || review.rating;
        review.comment = req.body.comment || review.comment;
        await review.save();

        return ApiResponse.success(res, { review }, 'Review updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return ApiResponse.error(res, 'Review not found', 404);

        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return ApiResponse.error(res, 'Not authorized', 403);
        }

        await Review.findByIdAndDelete(req.params.id);

        return ApiResponse.success(res, null, 'Review deleted');
    } catch (error) {
        next(error);
    }
};
