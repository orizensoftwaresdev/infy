// server/controllers/categoryController.js
const Category = require('../models/Category');
const Product = require('../models/Product');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });

        // Get product count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const count = await Product.countDocuments({ category: cat._id, isActive: true });
                return { ...cat.toObject(), productCount: count };
            })
        );

        return ApiResponse.success(res, categoriesWithCount);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return ApiResponse.error(res, 'Category not found', 404);
        }
        return ApiResponse.success(res, { category });
    } catch (error) {
        next(error);
    }
};

// @desc    Create category (Admin)
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        return ApiResponse.created(res, { category }, 'Category created successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Update category (Admin)
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!category) {
            return ApiResponse.error(res, 'Category not found', 404);
        }

        return ApiResponse.success(res, { category }, 'Category updated successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
    try {
        // Check if category has products
        const productCount = await Product.countDocuments({ category: req.params.id, isActive: true });
        if (productCount > 0) {
            return ApiResponse.error(res, `Cannot delete: ${productCount} active products use this category`, 400);
        }

        await Category.findByIdAndUpdate(req.params.id, { isActive: false });
        return ApiResponse.success(res, null, 'Category deleted successfully');
    } catch (error) {
        next(error);
    }
};
