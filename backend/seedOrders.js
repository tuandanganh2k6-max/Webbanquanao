const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');

dotenv.config();

const orders = [
  {
    orderItems: [{ name: 'Áo Khoác Bomber', qty: 2, image: '/images/1.jpg', price: 550000, product: '69e546a9c67f164e634ce4b5' }],
    shippingAddress: { address: '123 Cách Mạng Tháng 8', city: 'Hồ Chí Minh', postalCode: '70000', country: 'Việt Nam', phone: '0901234567' },
    paymentMethod: 'PayPal',
    user: '69e53edbb46be8e8e602280e',
    totalPrice: 1100000,
    isPaid: true,
    paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hôm qua
    isDelivered: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    orderItems: [{ name: 'Hoodie Essential', qty: 1, image: '/images/2.jpg', price: 420000, product: '69e546a9c67f164e634ce4b5' }],
    shippingAddress: { address: '456 Lê Lợi', city: 'Đà Nẵng', postalCode: '55000', country: 'Việt Nam', phone: '0987654321' },
    paymentMethod: 'COD',
    user: '69e53edbb46be8e8e602280e',
    totalPrice: 420000,
    isPaid: true,
    paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
    isDelivered: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    orderItems: [{ name: 'Quần Jean Baggy', qty: 3, image: '/images/3.jpg', price: 380000, product: '69e546a9c67f164e634ce4b5' }],
    shippingAddress: { address: '789 Nguyễn Huệ', city: 'Hà Nội', postalCode: '10000', country: 'Việt Nam', phone: '0912333444' },
    paymentMethod: 'Credit Card',
    user: '69e53edbb46be8e8e602280e',
    totalPrice: 1140000,
    isPaid: true,
    paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Tháng trước
    isDelivered: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  }
];

const seedOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webbanquanao');
    await Order.insertMany(orders);
    console.log('✅ 3 đơn hàng mẫu đã được thêm để kiểm tra doanh thu!');
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi seeding đơn hàng:', error);
    process.exit(1);
  }
};

seedOrders();
