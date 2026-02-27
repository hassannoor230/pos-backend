const User = require('../models/User');
const { sendResponse, paginate } = require('../utils/helpers');

const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return sendResponse(res, 200, true, 'Users fetched', users, { total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    return sendResponse(res, 201, true, 'User created', user);
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'User not found');

    Object.assign(user, updateData);
    if (password) user.password = password;
    await user.save();

    return sendResponse(res, 200, true, 'User updated', user);
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'User not found');
    return sendResponse(res, 200, true, 'User deleted');
  } catch (err) { next(err); }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'User not found');
    user.isActive = !user.isActive;
    await user.save();
    return sendResponse(res, 200, true, `User ${user.isActive ? 'activated' : 'deactivated'}`, user);
  } catch (err) { next(err); }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, toggleUserStatus };
