const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUsers,
  deleteUser,
  createManager,
  getMyAddresses,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/', protect, admin, getUsers);
router.post('/manager', protect, admin, createManager);
router.route('/addresses').get(protect, getMyAddresses).post(protect, addMyAddress);
router.route('/addresses/:addressId').put(protect, updateMyAddress).delete(protect, deleteMyAddress);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
