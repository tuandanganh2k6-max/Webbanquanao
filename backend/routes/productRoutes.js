const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, deleteProduct, updateProduct } = require('../controllers/productController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

// GET all / POST new
router.get('/', getProducts);
router.post('/', protect, admin, createProduct);

// GET one / PUT / DELETE
router.get('/:id', getProductById);
router.put('/:id', protect, staff, updateProduct);
router.delete('/:id', protect, staff, deleteProduct);

module.exports = router;
