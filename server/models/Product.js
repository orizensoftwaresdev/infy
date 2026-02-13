// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    offerPrice: {
        type: Number,
        default: null,
        min: [0, 'Offer price cannot be negative']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    subcategory: {
        type: String,
        default: ''
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    images: [{
        url: { type: String, required: true },
        alt: { type: String, default: '' }
    }],
    sizes: [{
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '+Size', 'Free Size']
    }],
    colors: [{
        name: String,
        hexCode: String
    }],
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    ratings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    bodyType: [{
        type: String
    }],
    occasion: [{
        type: String
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    isTrending: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Text index for search
productSchema.index({ title: 'text', description: 'text', brand: 'text' });
// Index for common queries
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isTrending: 1 });

module.exports = mongoose.model('Product', productSchema);
