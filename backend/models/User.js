const mongoose = require('mongoose');

const savedAddressSchema = new mongoose.Schema({
  label: { type: String, default: 'Địa chỉ giao hàng' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'manager'], default: 'user' },
  lastActive: { type: Date, default: Date.now },
  addresses: [savedAddressSchema],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
