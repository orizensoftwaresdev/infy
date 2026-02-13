// server/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isApproved: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = async function (productId) {
    const result = await this.aggregate([
        { $match: { product: productId, isApproved: true } },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    const Product = require('./Product');
    if (result.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratings: Math.round(result[0].avgRating * 10) / 10,
            numReviews: result[0].numReviews
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratings: 0,
            numReviews: 0
        });
    }
};

// Recalculate ratings after save/remove
reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.product);
});

reviewSchema.post('findOneAndDelete', function (doc) {
    if (doc) {
        doc.constructor.calcAverageRating(doc.product);
    }
});

module.exports = mongoose.model('Review', reviewSchema);
