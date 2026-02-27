const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendResponse } = require('../utils/helpers');

const getDashboard = async (req, res, next) => {
  try {
    const store = req.query.store;
    const baseFilter = { status: 'completed', ...(store ? { store } : {}) };

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [todayRes, monthRes, lastMonthRes, totalOrdersCount, todayOrdersCount, lowStockProds, productCount, userCount] = await Promise.all([
      Order.aggregate([{ $match: { ...baseFilter, createdAt: { $gte: today } } }, { $group: { _id: null, sales: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { ...baseFilter, createdAt: { $gte: thisMonth } } }, { $group: { _id: null, sales: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { ...baseFilter, createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } }, { $group: { _id: null, sales: { $sum: '$total' } } }]),
      Order.countDocuments(baseFilter),
      Order.countDocuments({ ...baseFilter, createdAt: { $gte: today } }),
      // fetch all low-stock products (no arbitrary limit) and compute count separately
      Product.find({ isActive: true, ...(store ? { store } : {}), $expr: { $lte: ['$stock', '$lowStockAlert'] } }).populate('category', 'name'),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
    ]);

    // Last 7 days chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const nextD = new Date(d); nextD.setDate(nextD.getDate() + 1);
      const res = await Order.aggregate([
        { $match: { ...baseFilter, createdAt: { $gte: d, $lt: nextD } } },
        { $group: { _id: null, sales: { $sum: '$total' }, orders: { $sum: 1 } } }
      ]);
      last7Days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        sales: res[0]?.sales || 0,
        orders: res[0]?.orders || 0,
      });
    }

    // Top selling products this month
    const topProducts = await Order.aggregate([
      { $match: { ...baseFilter, createdAt: { $gte: thisMonth } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' }, revenue: { $sum: '$items.subtotal' } } },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]);

    // Payment method breakdown
    const paymentBreakdown = await Order.aggregate([
      { $match: { ...baseFilter, createdAt: { $gte: thisMonth } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$total' } } },
    ]);

    const todaySales = todayRes[0]?.sales || 0;
    const monthSales = monthRes[0]?.sales || 0;
    const lastMonthSales = lastMonthRes[0]?.sales || 0;
    const growth = lastMonthSales > 0 ? +((monthSales - lastMonthSales) / lastMonthSales * 100).toFixed(1) : 0;

    return sendResponse(res, 200, true, 'Dashboard data', {
      todaySales, monthSales, lastMonthSales, growth,
      totalOrders: totalOrdersCount, todayOrders: todayOrdersCount,
      productCount, userCount,
      lowStockProducts: lowStockProds,
      lowStockCount: lowStockProds.length,
      last7Days, topProducts, paymentBreakdown,
    });
  } catch (err) { next(err); }
};

const getSalesReport = async (req, res, next) => {
  try {
    const { store, startDate, endDate, groupBy = 'day' } = req.query;
    const filter = { status: 'completed' };
    if (store) filter.store = store;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const fmt = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
    const grouped = await Order.aggregate([
      { $match: filter },
      { $group: { _id: { $dateToString: { format: fmt, date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 }, tax: { $sum: '$taxAmount' }, discount: { $sum: '$discountAmount' } } },
      { $sort: { _id: 1 } },
    ]);

    const totals = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 }, tax: { $sum: '$taxAmount' }, discount: { $sum: '$discountAmount' } } },
    ]);

    return sendResponse(res, 200, true, 'Sales report', grouped, { totals: totals[0] || {} });
  } catch (err) { next(err); }
};

const getLowStockReport = async (req, res, next) => {
  try {
    const { store } = req.query;
    const filter = { isActive: true, $expr: { $lte: ['$stock', '$lowStockAlert'] } };
    if (store) filter.store = store;
    const products = await Product.find(filter).populate('category', 'name icon color').sort('stock');
    return sendResponse(res, 200, true, 'Low stock report', products, { count: products.length });
  } catch (err) { next(err); }
};

const getBestSellers = async (req, res, next) => {
  try {
    const { store, startDate, endDate } = req.query;
    const filter = { status: 'completed' };
    if (store) filter.store = store;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const products = await Order.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      { $group: { _id: { id: '$items.product', name: '$items.name' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subtotal' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 10 },
    ]);

    return sendResponse(res, 200, true, 'Best sellers', products);
  } catch (err) { next(err); }
};

module.exports = { getDashboard, getSalesReport, getLowStockReport, getBestSellers };
