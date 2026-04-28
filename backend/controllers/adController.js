const Ad = require('../models/Ad');

const getAds = async (req, res, next) => {
  try {
    const ads = await Ad.find({});
    res.json(ads);
  } catch (error) {
    next(error);
  }
};

const createAd = async (req, res, next) => {
  try {
    const { brandName, startDate, endDate, fee, image, url } = req.body;
    
    // Validate end date (Business Rule BR-01 for Ad Contract)
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight for fair comparison
    
    if (end <= today) {
      return res.status(400).json({ message: 'Lỗi: Ngày kết thúc hợp đồng không được nhỏ hơn hoặc bằng ngày hôm nay' });
    }

    const ad = new Ad({
      brandName,
      startDate,
      endDate,
      fee,
      image,
      url,
    });
    const createdAd = await ad.save();
    res.status(201).json(createdAd);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an ad
// @route   DELETE /api/ads/:id
// @access  Private/Admin
const deleteAd = async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (ad) {
    await ad.deleteOne();
    res.json({ message: 'Ad removed' });
  } else {
    res.status(404).json({ message: 'Ad not found' });
  }
};

// @desc    Update ad status (Toggle Active)
// @route   PUT /api/ads/:id/status
// @access  Private/Admin
const updateAdStatus = async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (ad) {
    ad.isActive = req.body.isActive !== undefined ? req.body.isActive : !ad.isActive;
    const updatedAd = await ad.save();
    res.json(updatedAd);
  } else {
    res.status(404).json({ message: 'Ad not found' });
  }
};

module.exports = { getAds, createAd, deleteAd, updateAdStatus };
