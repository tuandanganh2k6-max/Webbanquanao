const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  } else {
    const normalizedPaymentMethod = paymentMethod || 'COD';
    const isCardPayment = normalizedPaymentMethod === 'CARD';

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod: normalizedPaymentMethod,
      itemsPrice,
      totalPrice,
      isPaid: isCardPayment,
      paidAt: isCardPayment ? Date.now() : undefined,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Staff
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Staff
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    if (order.paymentMethod === 'COD') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get total revenue and stats
// @route   GET /api/orders/revenue
// @access  Private/Staff
const getRevenue = async (req, res, next) => {
  try {
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Stats aggregation
    const dailyStats = await Order.aggregate([
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: { $ifNull: ["$paidAt", "$createdAt"] } 
            } 
          },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: "%Y-%m", 
              date: { $ifNull: ["$paidAt", "$createdAt"] } 
            } 
          },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({ totalRevenue, dailyStats, monthlyStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status;
      if (req.body.status === 'Thành công') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        if (order.paymentMethod === 'COD') {
          order.isPaid = true;
          order.paidAt = Date.now();
        }
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add message to order
// @route   POST /api/orders/:id/message
// @access  Private
const addOrderMessage = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const { text, sender } = req.body;
      order.messages.push({ text, sender, createdAt: Date.now() });
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrderItems, getOrderById, getMyOrders, getOrders, updateOrderToDelivered, getRevenue, deleteOrder, updateOrderStatus, addOrderMessage };
