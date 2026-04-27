const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, getMyOrders, getOrders, updateOrderToDelivered, getRevenue, deleteOrder, updateOrderStatus, addOrderMessage } = require('../controllers/orderController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.route('/').get(protect, staff, getOrders).post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/revenue').get(protect, staff, getRevenue);
router.route('/:id').get(protect, getOrderById).delete(protect, admin, deleteOrder);
router.route('/:id/deliver').put(protect, staff, updateOrderToDelivered);
router.route('/:id/status').put(protect, staff, updateOrderStatus);
router.route('/:id/message').post(protect, addOrderMessage);

module.exports = router;
