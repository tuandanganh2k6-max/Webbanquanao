const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const products = await Product.find({ ...keyword });
  res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, image, brand, category, countInStock } = req.body;
    
    if (!name || price === undefined || !description || !image || !category || countInStock === undefined) {
      res.status(400); // Bad Request
      throw new Error('Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, Giá, Mô tả, Ảnh, Danh mục, Số lượng)');
    }

    const product = new Product({
      name,
      price,
      image,
      brand,
      category,
      countInStock,
      description,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Staff
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm này trong Cơ sở dữ liệu');
    }

    const productInOrder = await Order.exists({ 'orderItems.product': product._id });

    if (productInOrder) {
      product.countInStock = 0;
      const updatedProduct = await product.save();

      return res.json({
        action: 'marked_out_of_stock',
        message: 'Sản phẩm đã có trong đơn hàng nên không thể xóa. Hệ thống đã chuyển sản phẩm sang trạng thái hết hàng.',
        product: updatedProduct,
      });
    }

    await product.deleteOne();
    res.json({
      action: 'deleted',
      message: 'Sản phẩm đã được gỡ bỏ thành công',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Staff
const updateProduct = async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

module.exports = { getProducts, getProductById, createProduct, deleteProduct, updateProduct };
