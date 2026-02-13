// server/controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const ApiResponse = require('../utils/apiResponse');
const { sendOrderConfirmation, sendAdminNewOrder } = require('../utils/emailService');

// @desc    Create order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, couponCode, paymentMethod = 'razorpay' } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return ApiResponse.error(res, 'Cart is empty', 400);
        }

        // Validate stock and build order items
        const orderItems = [];
        let itemsTotal = 0;

        for (const item of cart.items) {
            const product = item.product;
            if (!product || !product.isActive) {
                return ApiResponse.error(res, `Product "${item.product?.title || 'Unknown'}" is no longer available`, 400);
            }
            if (product.stock < item.quantity) {
                return ApiResponse.error(res, `"${product.title}" has only ${product.stock} items in stock`, 400);
            }

            const price = product.offerPrice || product.price;
            orderItems.push({
                product: product._id,
                title: product.title,
                image: product.images.length > 0 ? product.images[0].url : '',
                price,
                size: item.size,
                color: item.color,
                quantity: item.quantity
            });

            itemsTotal += price * item.quantity;
        }

        // Apply coupon if provided
        let discount = 0;
        let couponUsed = null;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon) {
                const validation = coupon.isValid(itemsTotal);
                if (validation.valid) {
                    discount = coupon.calculateDiscount(itemsTotal);
                    couponUsed = coupon.code;
                    coupon.usedCount += 1;
                    await coupon.save();
                }
            }
        }

        // Calculate shipping
        const Settings = require('../models/Settings');
        const settings = await Settings.findOne();
        let shippingCharge = settings?.shippingCharge || 0;
        if (settings?.freeShippingAbove && itemsTotal >= settings.freeShippingAbove) {
            shippingCharge = 0;
        }

        const totalAmount = itemsTotal - discount + shippingCharge;

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            paymentInfo: { method: paymentMethod },
            itemsTotal,
            shippingCharge,
            discount,
            couponUsed,
            totalAmount
        });

        // Update product stock and sold count
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            });
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        // Send emails (fire-and-forget)
        sendOrderConfirmation(order, req.user).catch(e => console.error('Order email error:', e.message));
        sendAdminNewOrder(order).catch(e => console.error('Admin email error:', e.message));

        return ApiResponse.created(res, { order }, 'Order placed successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get user orders
// @route   GET /api/v1/orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ user: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Order.countDocuments({ user: req.user.id })
        ]);

        return ApiResponse.paginated(res, orders, {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'title images')
            .populate('user', 'name email');

        if (!order) {
            return ApiResponse.error(res, 'Order not found', 404);
        }

        // Ensure user can only see their own orders (unless admin)
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return ApiResponse.error(res, 'Not authorized', 403);
        }

        return ApiResponse.success(res, { order });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel order (user)
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return ApiResponse.error(res, 'Order not found', 404);
        }

        if (order.user.toString() !== req.user.id) {
            return ApiResponse.error(res, 'Not authorized', 403);
        }

        if (!['pending', 'confirmed'].includes(order.status)) {
            return ApiResponse.error(res, 'Order cannot be cancelled at this stage', 400);
        }

        order.status = 'cancelled';
        order.cancelledAt = Date.now();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity, sold: -item.quantity }
            });
        }

        await order.save();

        return ApiResponse.success(res, { order }, 'Order cancelled successfully');
    } catch (error) {
        next(error);
    }
};
