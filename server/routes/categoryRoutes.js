// server/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const {
    getCategories, getCategory, createCategory, updateCategory, deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

router.get('/', getCategories);
router.get('/:id', validateObjectId, getCategory);
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), validateObjectId, updateCategory);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteCategory);

module.exports = router;
