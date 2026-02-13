// server/controllers/adminController.js
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const ApiResponse = require('../utils/apiResponse');
const { sendOrderShipped } = require('../utils/emailService');

// @desc    Get dashboard analytics
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            recentOrders,
            lowStockProducts,
            pendingOrders
        ] = await Promise.all([
            User.countDocuments({ role: 'customer' }),
            Product.countDocuments({ isActive: true }),
            Order.countDocuments(),
            Order.aggregate([
                { $match: { 'paymentInfo.status': 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').lean(),
            Product.find({ stock: { $lte: 10 }, isActive: true }).select('title stock sku').lean(),
            Order.countDocuments({ status: 'pending' })
        ]);

        // Monthly sales data (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    'paymentInfo.status': 'paid'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    sales: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return ApiResponse.success(res, {
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingOrders
            },
            monthlySales,
            recentOrders,
            lowStockProducts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            User.countDocuments(query)
        ]);

        return ApiResponse.paginated(res, users, {
            page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role / status (Admin)
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const { role, isActive } = req.body;
        const updateData = {};
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) return ApiResponse.error(res, 'User not found', 404);

        return ApiResponse.success(res, { user }, 'User updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/v1/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Order.countDocuments(query)
        ]);

        return ApiResponse.paginated(res, orders, {
            page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/v1/admin/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, trackingInfo } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return ApiResponse.error(res, 'Order not found', 404);

        if (status) order.status = status;
        if (status === 'delivered') order.deliveredAt = Date.now();
        if (trackingInfo) order.trackingInfo = trackingInfo;

        await order.save();

        // Send shipped email
        if (status === 'shipped') {
            const user = await User.findById(order.user);
            if (user) sendOrderShipped(order, user).catch(e => console.error('Shipped email error:', e.message));
        }

        return ApiResponse.success(res, { order }, 'Order updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/v1/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find()
                .populate('user', 'name email')
                .populate('product', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Review.countDocuments()
        ]);

        return ApiResponse.paginated(res, reviews, {
            page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve/reject review (Admin)
// @route   PUT /api/v1/admin/reviews/:id
// @access  Private/Admin
exports.moderateReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved: req.body.isApproved },
            { new: true }
        );
        if (!review) return ApiResponse.error(res, 'Review not found', 404);
        return ApiResponse.success(res, { review }, 'Review updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment logs (Admin)
// @route   GET /api/v1/admin/payments
// @access  Private/Admin
exports.getPaymentLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const [payments, total] = await Promise.all([
            Payment.find()
                .populate('user', 'name email')
                .populate('order', 'orderNumber totalAmount')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Payment.countDocuments()
        ]);

        return ApiResponse.paginated(res, payments, {
            page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user (Admin)
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).lean();
        if (!user) return ApiResponse.error(res, 'User not found', 404);
        const orderCount = await Order.countDocuments({ user: user._id });
        return ApiResponse.success(res, { ...user, orderCount });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return ApiResponse.error(res, 'User not found', 404);
        return ApiResponse.success(res, null, 'User deleted');
    } catch (error) {
        next(error);
    }
};

// @desc    Initiate refund (Admin)
// @route   POST /api/v1/admin/orders/:id/refund
// @access  Private/Admin
exports.initiateRefund = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return ApiResponse.error(res, 'Order not found', 404);
        if (order.paymentInfo.status !== 'paid') return ApiResponse.error(res, 'Order payment not completed', 400);

        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET });

        const refund = await razorpay.payments.refund(order.paymentInfo.razorpayPaymentId, {
            amount: Math.round(order.totalAmount * 100),
            notes: { orderId: order._id.toString(), reason: req.body.reason || 'Admin initiated refund' }
        });

        order.paymentInfo.status = 'refunded';
        order.status = 'returned';
        await order.save();

        // Update payment record
        await Payment.findOneAndUpdate(
            { razorpayPaymentId: order.paymentInfo.razorpayPaymentId },
            { status: 'refunded' }
        );

        return ApiResponse.success(res, { refund, order }, 'Refund initiated successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Advanced Analytics (Admin)
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAdvancedAnalytics = async (req, res, next) => {
    try {
        const [revenueByCategory, topProducts, paymentMethodStats, orderStatusStats] = await Promise.all([
            // Revenue by category
            Order.aggregate([
                { $match: { 'paymentInfo.status': 'paid' } },
                { $unwind: '$items' },
                { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productData' } },
                { $unwind: { path: '$productData', preserveNullAndEmptyArrays: true } },
                { $group: { _id: '$productData.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, count: { $sum: '$items.quantity' } } },
                { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryData' } },
                { $unwind: { path: '$categoryData', preserveNullAndEmptyArrays: true } },
                { $project: { category: { $ifNull: ['$categoryData.name', 'Unknown'] }, revenue: 1, count: 1 } },
                { $sort: { revenue: -1 } },
                { $limit: 10 }
            ]),
            // Top products
            Order.aggregate([
                { $match: { 'paymentInfo.status': 'paid' } },
                { $unwind: '$items' },
                { $group: { _id: '$items.product', title: { $first: '$items.title' }, image: { $first: '$items.image' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
                { $sort: { revenue: -1 } },
                { $limit: 10 }
            ]),
            // Payment method stats
            Order.aggregate([
                { $group: { _id: '$paymentInfo.method', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
            ]),
            // Order status breakdown
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        return ApiResponse.success(res, { revenueByCategory, topProducts, paymentMethodStats, orderStatusStats });
    } catch (error) {
        next(error);
    }
};
