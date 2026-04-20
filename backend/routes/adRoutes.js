const express = require('express');
const router = express.Router();
const { getAds, createAd, deleteAd } = require('../controllers/adController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAds)
  .post(protect, admin, createAd);

router.route('/:id')
  .delete(protect, admin, deleteAd);

module.exports = router;
