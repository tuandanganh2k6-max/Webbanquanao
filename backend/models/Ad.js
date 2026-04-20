const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  image: { type: String, required: true }, // URL to the banner image
  url: { type: String }, // Clicking the ad sends user here
  duration: { type: String, required: true }, // e.g., "3 months"
  fee: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
