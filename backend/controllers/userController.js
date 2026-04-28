const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const normalizeAddressInput = ({ label, address, city, phone, isDefault }) => ({
  label: label?.trim() || 'Địa chỉ giao hàng',
  address: address?.trim(),
  city: city?.trim(),
  phone: phone?.trim(),
  isDefault: Boolean(isDefault),
});

const validateAddressInput = ({ address, city, phone }) => {
  return Boolean(address && city && phone);
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'Email này đã được đăng ký' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }
    // Protect: Admin cannot delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Không thể tự xóa tài khoản của chính mình');
    }
    // Protect: Cannot delete other admins
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Không thể xóa tài khoản Admin');
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: `Đã xóa thành viên "${user.name}" thành công` });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a manager account (Admin only)
// @route   POST /api/users/manager
// @access  Private/Admin
const createManager = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Vui lòng điền đầy đủ họ tên, email và mật khẩu');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email này đã được sử dụng trong hệ thống');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const manager = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'manager',
    });

    res.status(201).json({
      _id: manager._id,
      name: manager.name,
      email: manager.email,
      role: manager.role,
      createdAt: manager.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's saved addresses
// @route   GET /api/users/addresses
// @access  Private
const getMyAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json(user?.addresses || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a saved address
// @route   POST /api/users/addresses
// @access  Private
const addMyAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }

    const nextAddress = normalizeAddressInput(req.body);
    if (!validateAddressInput(nextAddress)) {
      res.status(400);
      throw new Error('Vui lòng nhập đầy đủ địa chỉ, thành phố và số điện thoại');
    }

    if (user.addresses.length === 0 || nextAddress.isDefault) {
      user.addresses.forEach((savedAddress) => {
        savedAddress.isDefault = false;
      });
      nextAddress.isDefault = true;
    }

    user.addresses.push(nextAddress);
    await user.save();

    res.status(201).json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a saved address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateMyAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }

    const savedAddress = user.addresses.id(req.params.addressId);
    if (!savedAddress) {
      res.status(404);
      throw new Error('Không tìm thấy địa chỉ');
    }

    const nextAddress = normalizeAddressInput({ ...savedAddress.toObject(), ...req.body });
    if (!validateAddressInput(nextAddress)) {
      res.status(400);
      throw new Error('Vui lòng nhập đầy đủ địa chỉ, thành phố và số điện thoại');
    }

    if (nextAddress.isDefault) {
      user.addresses.forEach((item) => {
        item.isDefault = false;
      });
    }

    savedAddress.label = nextAddress.label;
    savedAddress.address = nextAddress.address;
    savedAddress.city = nextAddress.city;
    savedAddress.phone = nextAddress.phone;
    savedAddress.isDefault = nextAddress.isDefault;

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a saved address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteMyAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }

    const savedAddress = user.addresses.id(req.params.addressId);
    if (!savedAddress) {
      res.status(404);
      throw new Error('Không tìm thấy địa chỉ');
    }

    const wasDefault = savedAddress.isDefault;
    user.addresses.pull(savedAddress._id);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authUser,
  registerUser,
  getUsers,
  deleteUser,
  createManager,
  getMyAddresses,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
};
