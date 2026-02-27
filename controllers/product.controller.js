const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendResponse, paginate } = require('../utils/helpers');

const getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.store) filter.store = req.query.store;
    if (req.query.lowStock === 'true') filter.$expr = { $lte: ['$stock', '$lowStockAlert'] };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
        { barcode: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name icon color').sort(req.query.sort || 'name').skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    return sendResponse(res, 200, true, 'Products fetched', products, { total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return sendResponse(res, 404, false, 'Product not found');
    return sendResponse(res, 200, true, 'Product fetched', product);
  } catch (err) { next(err); }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    await product.populate('category', 'name icon color');
    return sendResponse(res, 201, true, 'Product created', product);
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category');
    if (!product) return sendResponse(res, 404, false, 'Product not found');
    return sendResponse(res, 200, true, 'Product updated', product);
  } catch (err) { next(err); }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return sendResponse(res, 404, false, 'Product not found');
    return sendResponse(res, 200, true, 'Product deleted');
  } catch (err) { next(err); }
};

const adjustStock = async (req, res, next) => {
  try {
    const { quantity, type } = req.body; // type: 'add' | 'subtract' | 'set'
    const product = await Product.findById(req.params.id);
    if (!product) return sendResponse(res, 404, false, 'Product not found');

    if (type === 'add') product.stock += quantity;
    else if (type === 'subtract') product.stock = Math.max(0, product.stock - quantity);
    else if (type === 'set') product.stock = quantity;

    await product.save();
    return sendResponse(res, 200, true, 'Stock adjusted', product);
  } catch (err) { next(err); }
};

// Categories
const getCategories = async (req, res, next) => {
  try {
    const cats = await Category.find({ isActive: true }).sort('name');
    return sendResponse(res, 200, true, 'Categories fetched', cats);
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    return sendResponse(res, 201, true, 'Category created', cat);
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return sendResponse(res, 404, false, 'Category not found');
    return sendResponse(res, 200, true, 'Category updated', cat);
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    return sendResponse(res, 200, true, 'Category deleted');
  } catch (err) { next(err); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, adjustStock, getCategories, createCategory, updateCategory, deleteCategory };
