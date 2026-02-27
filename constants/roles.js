const ROLES = {
  SUPER_ADMIN: 'super_admin',
  STORE_ADMIN: 'store_admin',
  CASHIER: 'cashier',
  INVENTORY_MANAGER: 'inventory_manager',
};

const ROLE_PERMISSIONS = {
  super_admin: ['all'],
  store_admin: ['products', 'categories', 'orders', 'reports', 'users', 'inventory'],
  cashier: ['pos', 'orders', 'today_sales'],
  inventory_manager: ['products', 'categories', 'inventory', 'low_stock'],
};

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  store_admin: 'Store Admin',
  cashier: 'Cashier',
  inventory_manager: 'Inventory Manager',
};

module.exports = { ROLES, ROLE_PERMISSIONS, ROLE_LABELS };
