const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUsers, deleteUser, createManager } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/', protect, admin, getUsers);
router.post('/manager', protect, admin, createManager);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
