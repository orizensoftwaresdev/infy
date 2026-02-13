// server/models/Category.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    subcategories: [{
        name: { type: String, required: true },
        slug: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generate slug before saving
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    // Generate slugs for subcategories
    if (this.subcategories) {
        this.subcategories.forEach(sub => {
            if (!sub.slug) {
                sub.slug = slugify(sub.name, { lower: true, strict: true });
            }
        });
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
