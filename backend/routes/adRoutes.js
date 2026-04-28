const express = require('express');
const router = express.Router();
const { getAds, createAd, deleteAd, updateAdStatus } = require('../controllers/adController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAds)
  .post(protect, admin, createAd);

router.route('/:id')
  .delete(protect, admin, deleteAd);

router.route('/:id/status')
  .put(protect, admin, updateAdStatus);

module.exports = router;
