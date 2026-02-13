// server/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'title price offerPrice images stock sizes');

        if (!cart) {
            cart = { items: [] };
        }

        return ApiResponse.success(res, { cart });
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, size, color, quantity = 1 } = req.body;

        // Verify product exists and has stock
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return ApiResponse.error(res, 'Product not found', 404);
        }
        if (product.stock < quantity) {
            return ApiResponse.error(res, 'Not enough stock available', 400);
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        // Check if item already exists
        const existingItem = cart.items.find(
            item => item.product.toString() === productId && item.size === (size || '') && item.color === (color || '')
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, size: size || '', color: color || '', quantity });
        }

        await cart.save();

        // Populate for response
        cart = await Cart.findById(cart._id)
            .populate('items.product', 'title price offerPrice images stock sizes');

        return ApiResponse.success(res, { cart }, 'Item added to cart');
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        if (quantity < 1) {
            return ApiResponse.error(res, 'Quantity must be at least 1', 400);
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return ApiResponse.error(res, 'Cart not found', 404);
        }

        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return ApiResponse.error(res, 'Item not found in cart', 404);
        }

        // Check stock
        const product = await Product.findById(item.product);
        if (product.stock < quantity) {
            return ApiResponse.error(res, `Only ${product.stock} items available in stock`, 400);
        }

        item.quantity = quantity;
        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'title price offerPrice images stock sizes');

        return ApiResponse.success(res, { cart: populatedCart }, 'Cart updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return ApiResponse.error(res, 'Cart not found', 404);
        }

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'title price offerPrice images stock sizes');

        return ApiResponse.success(res, { cart: populatedCart }, 'Item removed from cart');
    } catch (error) {
        next(error);
    }
};

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
    try {
        await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
        return ApiResponse.success(res, { cart: { items: [] } }, 'Cart cleared');
    } catch (error) {
        next(error);
    }
};

// @desc    Sync entire cart
// @route   PUT /api/v1/cart/sync
// @access  Private
exports.syncCart = async (req, res, next) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return ApiResponse.error(res, 'Items must be an array', 400);
        }

        const validItems = [];
        for (const item of items) {
            // Check product
            const product = await Product.findById(item.productId);
            if (!product || !product.isActive) continue;

            // Check quantity vs stock
            let quantity = Number(item.quantity);
            if (isNaN(quantity) || quantity < 1) quantity = 1;

            if (product.stock < quantity) {
                quantity = product.stock;
            }
            if (quantity > 0) {
                validItems.push({
                    product: item.productId,
                    quantity: quantity,
                    size: item.size || '',
                    color: item.color || ''
                });
            }
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: validItems });
        } else {
            cart.items = validItems;
        }

        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'title price offerPrice images stock sizes');

        return ApiResponse.success(res, { cart: populatedCart }, 'Cart synced');
    } catch (error) {
        next(error);
    }
};
