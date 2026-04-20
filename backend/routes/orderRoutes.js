const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, getMyOrders, getOrders, updateOrderToDelivered, getRevenue } = require('../controllers/orderController');
const { protect, staff } = require('../middleware/authMiddleware');

router.post('/', protect, addOrderItems);
router.get('/', protect, staff, getOrders);
router.get('/revenue', protect, staff, getRevenue);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/deliver', protect, staff, updateOrderToDelivered);

module.exports = router;
