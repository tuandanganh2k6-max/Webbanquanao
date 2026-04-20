const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  {
    name: 'Áo Khoác Bomber Varsity Supreme',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
    description: 'Phong cách học đường cổ điển, chất liệu nỉ dày dặn, tay áo phối da cao cấp.',
    brand: 'T-Shop Exclusive',
    category: 'Áo Khoác',
    price: 550000,
    countInStock: 25,
  },
  {
    name: 'Hoodie Oversize Essential',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
    description: 'Chất nỉ chân cua mềm mại, form rộng thoải mái, phù hợp cho cả nam và nữ.',
    brand: 'Urban Style',
    category: 'Áo Khoác',
    price: 420000,
    countInStock: 50,
  },
  {
    name: 'Quần Jean Baggy Dark Blue',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000&auto=format&fit=crop',
    description: 'Chất jean bền màu, form suông rộng, mang lại vẻ ngoài trẻ trung năng động.',
    brand: 'Denim Co',
    category: 'Quần / Váy',
    price: 380000,
    countInStock: 15,
  },
  {
    name: 'Áo Thun Graphic "Cyberpunk"',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
    description: 'Cotton 100% co giãn 4 chiều, hình in lụa sắc nét, không phai màu.',
    brand: 'Creative Tee',
    category: 'Áo Thun',
    price: 250000,
    countInStock: 100,
  },
  {
    name: 'Váy Polo Thể Thao Nữ',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
    description: 'Thiết kế cổ polo thanh lịch, chất vải thun lạnh thoáng mát.',
    brand: 'Grace Fashion',
    category: 'Quần / Váy',
    price: 320000,
    countInStock: 12,
  },
  {
    name: 'Áo Sơ Mi Flannel Caro Đỏ',
    image: 'https://images.unsplash.com/photo-1598411037848-9cda9ee4c399?q=80&w=1000&auto=format&fit=crop',
    description: 'Họa tiết caro vintage, chất liệu dạ mỏng ấm áp cho mùa thu đông.',
    brand: 'T-Shop Retro',
    category: 'Áo Sơ Mi',
    price: 350000,
    countInStock: 20,
  },
  {
    name: 'Áo Cardigan Len Mỏng',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
    description: 'Len dệt kim nhẹ nhàng, màu trung tính dễ phối đồ.',
    brand: 'Minimalist',
    category: 'Áo Khoác',
    price: 480000,
    countInStock: 8,
  },
  {
    name: 'Quần Short Kaki Cargo',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=1000&auto=format&fit=crop',
    description: 'Thiết kế túi hộp cá tính, vải kaki bền bỉ, chuẩn form.',
    brand: 'Urban Style',
    category: 'Quần / Váy',
    price: 220000,
    countInStock: 30,
  },
  {
    name: 'Áo Croptop Thun Gân',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    description: 'Tôn dáng quyến rũ, chất thun gân ôm sát thoải mái.',
    brand: 'Grace Fashion',
    category: 'Áo Thun',
    price: 180000,
    countInStock: 45,
  },
  {
    name: 'Áo Khoác Gió Windbreaker Tech',
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654ca?q=80&w=1000&auto=format&fit=crop',
    description: 'Chống thấm nước nhẹ, cản gió tuyệt đối, thích hợp đi phượt.',
    brand: 'Techwear Lab',
    category: 'Áo Khoác',
    price: 450000,
    countInStock: 18,
  },
  {
    name: 'Quần Jogger Techwear Túi Hộp',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop',
    description: 'Chất vải dù cao cấp, nhiều túi tiện lợi, bo chân gọn gàng.',
    brand: 'Techwear Lab',
    category: 'Quần / Váy',
    price: 400000,
    countInStock: 22,
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webbanquanao');
    
    // Clear existing products optionally (keeping your 'Sample name' for now)
    // await Product.deleteMany(); 
    
    await Product.insertMany(products);
    console.log('✅ 11 sản phẩm mẫu đã được thêm thành công!');
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi seeding:', error);
    process.exit(1);
  }
};

seedData();
