const router = require('express').Router();
const { getOrders, getOrder, createOrder, refundOrder, getInvoice, getTodayOrders } = require('../controllers/order.controller');
const protect = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

router.use(protect);
router.get('/', getOrders);
router.get('/today', getTodayOrders);
router.get('/:id', getOrder);
router.get('/:id/invoice', getInvoice);
router.post('/', createOrder);
router.patch('/:id/refund', adminOnly, refundOrder);

module.exports = router;
