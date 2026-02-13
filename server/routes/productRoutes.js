// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
    getProducts, getProduct, createProduct, updateProduct, deleteProduct,
    getFeaturedProducts, getTrendingProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { productValidation, validateObjectId } = require('../middleware/validate');

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/', getProducts);
router.get('/:id', validateObjectId, getProduct);

// Admin routes
router.post('/', protect, authorize('admin'), productValidation, createProduct);
router.put('/:id', protect, authorize('admin'), validateObjectId, updateProduct);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteProduct);

module.exports = router;
