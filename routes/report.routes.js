const router = require('express').Router();
const { getDashboard, getSalesReport, getLowStockReport, getBestSellers } = require('../controllers/report.controller');
const protect = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');
const { inventoryAccess } = require('../middleware/role.middleware');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/sales', adminOnly, getSalesReport);
router.get('/low-stock', inventoryAccess, getLowStockReport);
router.get('/best-sellers', adminOnly, getBestSellers);

module.exports = router;
