// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
    createOrder, getMyOrders, getOrder, cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');
const Order = require('../models/Order');
const generateInvoice = require('../utils/invoiceGenerator');

router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', validateObjectId, getOrder);
router.put('/:id/cancel', validateObjectId, cancelOrder);

// Invoice download
router.get('/:id/invoice', validateObjectId, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        generateInvoice(order, res);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

