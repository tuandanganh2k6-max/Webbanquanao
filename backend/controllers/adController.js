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
    const { brandName, duration, fee, image, url } = req.body;
    const ad = new Ad({
      brandName,
      duration,
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

module.exports = { getAds, createAd, deleteAd };
