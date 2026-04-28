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
    const { brandName, startDate, endDate, fee, image, url, priority } = req.body;
    
    // Validate end date (Business Rule BR-01 for Ad Contract)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight for fair comparison
    start.setHours(0, 0, 0, 0);
    
    if (end <= today) {
      return res.status(400).json({ message: 'Lỗi: Ngày kết thúc hợp đồng không được nhỏ hơn hoặc bằng ngày hôm nay' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'Lỗi: Ngày kết thúc hợp đồng buộc phải lớn hơn ngày bắt đầu hợp đồng' });
    }

    const ad = new Ad({
      brandName,
      startDate,
      endDate,
      fee,
      image,
      url,
      priority: priority || 0
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
    const isActivating = req.body.isActive !== undefined ? req.body.isActive : !ad.isActive;
    
    // Nếu cố bật ON, kiểm tra xem đã quá hạn chưa?
    if (isActivating) {
      const end = new Date(ad.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (end <= today) {
        return res.status(400).json({ message: 'Lỗi chặn: Không thể Bật (ON) hiển thị do hợp đồng này đã khóa vì QUÁ HẠN ngày kết thúc!' });
      }
    }

    ad.isActive = isActivating;
    const updatedAd = await ad.save();
    res.json(updatedAd);
  } else {
    res.status(404).json({ message: 'Ad not found' });
  }
};

// @desc    Update ad full info
// @route   PUT /api/ads/:id
// @access  Private/Admin
const updateAd = async (req, res, next) => {
  try {
    const { brandName, startDate, endDate, fee, image, url, priority } = req.body;
    
    // Bắt kịch bản lỗi: Để trống thông tin
    if (!brandName || !startDate || !endDate || fee === undefined || !image) {
      return res.status(400).json({ message: 'Lỗi trống trơn: Vui lòng không được xóa hay để trống thông tin bắt buộc!' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    start.setHours(0, 0, 0, 0);
    
    if (end <= today) {
      return res.status(400).json({ message: 'Lỗi: Ngày kết thúc hợp đồng không được nhỏ hơn hoặc bằng ngày hôm nay' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'Lỗi: Ngày kết thúc hợp đồng buộc phải lớn hơn ngày bắt đầu hợp đồng' });
    }

    const ad = await Ad.findById(req.params.id);
    if (ad) {
      ad.brandName = brandName;
      ad.startDate = startDate;
      ad.endDate = endDate;
      ad.fee = fee;
      ad.image = image;
      ad.url = url;
      ad.priority = priority !== undefined ? priority : ad.priority;
      
      const updatedAd = await ad.save();
      res.json(updatedAd);
    } else {
      res.status(404).json({ message: 'Ad not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getAds, createAd, deleteAd, updateAdStatus, updateAd };
