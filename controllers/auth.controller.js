const User = require('../models/User');
const { sendResponse } = require('../utils/helpers');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, 'Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return sendResponse(res, 401, false, 'Invalid credentials');
    if (!user.isActive) return sendResponse(res, 401, false, 'Account is deactivated');

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return sendResponse(res, 401, false, 'Invalid credentials');

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.getJwtToken();
    const userData = user.toObject();
    delete userData.password;

    return sendResponse(res, 200, true, 'Login successful', userData, { token });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendResponse(res, 200, true, 'User fetched', user);
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
    return sendResponse(res, 200, true, 'Profile updated', user);
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return sendResponse(res, 400, false, 'Current password is incorrect');
    user.password = newPassword;
    await user.save();
    return sendResponse(res, 200, true, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, updateProfile, changePassword };
