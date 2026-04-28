const mongoose = require('mongoose');
const Ad = require('../models/Ad');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const seedExpiredAd = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create an expired ad (Active but EndDate is in the past)
    const ad = new Ad({
      brandName: 'Quảng Cáo Giày (HẾT HẠN)',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
      fee: 2000000,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=160&fit=crop',
      url: 'https://example.com/expired',
      isActive: true // Trạng thái đang BẬT nhưng hợp đồng đã chết
    });
    
    await ad.save();
    console.log('Successfully injected 1 expired ad!');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

seedExpiredAd();
