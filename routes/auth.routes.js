const router = require('express').Router();
const { login, getMe, updateProfile, changePassword } = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
