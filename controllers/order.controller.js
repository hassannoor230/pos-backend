const Order = require('../models/Order');
const Product = require('../models/Product');
const { calculateOrderTotals } = require('../utils/calculateTax');
const { generateInvoiceData } = require('../utils/generateInvoice');
const { sendResponse, paginate } = require('../utils/helpers');

const getOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};

    if (req.query.store) filter.store = req.query.store;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.cashier) filter.cashier = req.query.cashier;
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(new Date(req.query.endDate).setHours(23, 59, 59));
    }

    // Cashier can only see their own orders
    if (req.user.role === 'cashier') filter.cashier = req.user._id;

    const [orders, total] = await Promise.all([
      Order.find(filter).populate('cashier', 'name email').sort('-createdAt').skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    return sendResponse(res, 200, true, 'Orders fetched', orders, { total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('cashier', 'name email').populate('items.product');
    if (!order) return sendResponse(res, 404, false, 'Order not found');
    return sendResponse(res, 200, true, 'Order fetched', order);
  } catch (err) { next(err); }
};

const createOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod, amountPaid, discountAmount = 0, note, store } = req.body;

    if (!items || !items.length) return sendResponse(res, 400, false, 'Order must have items');

    // Validate stock and build order items
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) return sendResponse(res, 400, false, `Product not found: ${item.product}`);
      if (product.stock < item.quantity) {
        return sendResponse(res, 400, false, `Insufficient stock for "${product.name}". Available: ${product.stock}`);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.quantity,
        taxRate: product.taxRate,
        subtotal: +(product.price * item.quantity).toFixed(2),
      });
    }

    const { subtotal, taxAmount, total } = calculateOrderTotals(
      orderItems.map(i => ({ ...i, taxRate: items.find(x => x.product === String(i.product))?.taxRate || i.taxRate || 0 })),
      discountAmount
    );

    const change = amountPaid ? Math.max(0, amountPaid - total) : 0;

    const order = await Order.create({
      cashier: req.user._id,
      store: store || req.user.store || 'Main Branch',
      items: orderItems,
      subtotal, taxAmount, discountAmount, total,
      paymentMethod, amountPaid, change, note,
    });

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    await order.populate('cashier', 'name email');
    return sendResponse(res, 201, true, 'Order created', order);
  } catch (err) { next(err); }
};

const refundOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, 404, false, 'Order not found');
    if (order.status === 'refunded') return sendResponse(res, 400, false, 'Order already refunded');

    // Restore stock
    for (const item of order.items) {
      if (item.product) await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = 'refunded';
    order.paymentStatus = 'refunded';
    await order.save();

    return sendResponse(res, 200, true, 'Order refunded', order);
  } catch (err) { next(err); }
};

const getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('cashier', 'name').populate('items.product');
    if (!order) return sendResponse(res, 404, false, 'Order not found');
    const invoice = generateInvoiceData(order);
    return sendResponse(res, 200, true, 'Invoice generated', invoice);
  } catch (err) { next(err); }
};

const getTodayOrders = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filter = { createdAt: { $gte: today }, status: 'completed' };
    if (req.user.role === 'cashier') filter.cashier = req.user._id;

    const orders = await Order.find(filter).populate('cashier', 'name').sort('-createdAt');
    const totalSales = orders.reduce((s, o) => s + o.total, 0);

    return sendResponse(res, 200, true, "Today's orders", orders, { totalSales, count: orders.length });
  } catch (err) { next(err); }
};

module.exports = { getOrders, getOrder, createOrder, refundOrder, getInvoice, getTodayOrders };
