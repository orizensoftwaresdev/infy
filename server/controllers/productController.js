// server/controllers/productController.js
const Product = require('../models/Product');
const Review = require('../models/Review');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all products with filters, search, sort, pagination
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        const {
            search,
            category,
            brand,
            minPrice,
            maxPrice,
            size,
            bodyType,
            occasion,
            rating,
            featured,
            trending,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        const query = { isActive: true };

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by brand
        if (brand) {
            query.brand = { $regex: brand, $options: 'i' };
        }

        // Price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Filter by size
        if (size) {
            query.sizes = { $in: size.split(',') };
        }

        // Filter by body type
        if (bodyType) {
            query.bodyType = { $in: bodyType.split(',').map(bt => new RegExp(bt, 'i')) };
        }

        // Filter by occasion
        if (occasion) {
            query.occasion = { $in: occasion.split(',').map(occ => new RegExp(occ, 'i')) };
        }

        // Filter by minimum rating
        if (rating) {
            query.ratings = { $gte: Number(rating) };
        }

        // Featured / trending
        if (featured === 'true') query.isFeatured = true;
        if (trending === 'true') query.isTrending = true;

        // Sort options
        let sortBy = { createdAt: -1 }; // default: newest
        if (sort === 'price_asc') sortBy = { price: 1 };
        else if (sort === 'price_desc') sortBy = { price: -1 };
        else if (sort === 'rating') sortBy = { ratings: -1 };
        else if (sort === 'popular') sortBy = { sold: -1 };
        else if (sort === 'name_asc') sortBy = { title: 1 };
        else if (sort === 'name_desc') sortBy = { title: -1 };

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category', 'name slug')
                .sort(sortBy)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product.countDocuments(query)
        ]);

        return ApiResponse.paginated(res, products, {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug');

        if (!product || !product.isActive) {
            return ApiResponse.error(res, 'Product not found', 404);
        }

        // Get reviews for this product
        const reviews = await Review.find({ product: req.params.id, isApproved: true })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);

        // Get related products (same category)
        const relatedProducts = await Product.find({
            category: product.category._id,
            _id: { $ne: product._id },
            isActive: true
        }).limit(4).lean();

        return ApiResponse.success(res, {
            product,
            reviews,
            relatedProducts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create product (Admin)
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        return ApiResponse.created(res, { product }, 'Product created successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Update product (Admin)
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return ApiResponse.error(res, 'Product not found', 404);
        }

        return ApiResponse.success(res, { product }, 'Product updated successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!product) {
            return ApiResponse.error(res, 'Product not found', 404);
        }

        return ApiResponse.success(res, null, 'Product deleted successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
            .populate('category', 'name slug')
            .limit(8)
            .lean();

        return ApiResponse.success(res, products);
    } catch (error) {
        next(error);
    }
};

// @desc    Get trending products
// @route   GET /api/v1/products/trending
// @access  Public
exports.getTrendingProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isTrending: true, isActive: true })
            .populate('category', 'name slug')
            .limit(8)
            .lean();

        return ApiResponse.success(res, products);
    } catch (error) {
        next(error);
    }
};
