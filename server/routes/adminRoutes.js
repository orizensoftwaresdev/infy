// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    getDashboard, getUsers, getUser, updateUser, deleteUser,
    getAllOrders, updateOrderStatus, initiateRefund,
    getAllReviews, moderateReview,
    getPaymentLogs, getAdvancedAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAdvancedAnalytics);
router.get('/users', getUsers);
router.get('/users/:id', validateObjectId, getUser);
router.put('/users/:id', validateObjectId, updateUser);
router.delete('/users/:id', validateObjectId, deleteUser);
router.get('/orders', getAllOrders);
router.put('/orders/:id', validateObjectId, updateOrderStatus);
router.post('/orders/:id/refund', validateObjectId, initiateRefund);
router.get('/reviews', getAllReviews);
router.put('/reviews/:id', validateObjectId, moderateReview);
router.get('/payments', getPaymentLogs);

module.exports = router;

