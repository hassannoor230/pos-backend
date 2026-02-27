const { ROLES } = require('../constants/roles');

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

/**
 * Admin only (super_admin or store_admin)
 */
const adminOnly = authorize(ROLES.SUPER_ADMIN, ROLES.STORE_ADMIN);

/**
 * Super admin only
 */
const superAdminOnly = authorize(ROLES.SUPER_ADMIN);

/**
 * Inventory access
 */
const inventoryAccess = authorize(ROLES.SUPER_ADMIN, ROLES.STORE_ADMIN, ROLES.INVENTORY_MANAGER);

module.exports = { authorize, adminOnly, superAdminOnly, inventoryAccess };
