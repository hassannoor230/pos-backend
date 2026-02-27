const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const protect = require('../middleware/auth.middleware');
const { adminOnly, inventoryAccess } = require('../middleware/role.middleware');

router.use(protect);

// Products
router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProduct);
router.post('/', inventoryAccess, ctrl.createProduct);
router.put('/:id', inventoryAccess, ctrl.updateProduct);
router.delete('/:id', adminOnly, ctrl.deleteProduct);
router.patch('/:id/stock', inventoryAccess, ctrl.adjustStock);

module.exports = router;
