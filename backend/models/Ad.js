const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  image: { type: String, required: true }, // URL to the banner image
  url: { type: String }, // Clicking the ad sends user here
  fee: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
