const router = require('express').Router();
const { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } = require('../controllers/user.controller');
const protect = require('../middleware/auth.middleware');
const { adminOnly, superAdminOnly } = require('../middleware/role.middleware');

router.use(protect);
router.get('/', adminOnly, getUsers);
router.post('/', adminOnly, createUser);
router.put('/:id', adminOnly, updateUser);
router.patch('/:id/toggle', adminOnly, toggleUserStatus);
router.delete('/:id', superAdminOnly, deleteUser);

module.exports = router;
