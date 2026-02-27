/**
 * Calculate tax amount for a given price and tax rate
 * @param {number} price - Item price
 * @param {number} taxRate - Tax percentage (e.g. 8 for 8%)
 * @returns {number} Tax amount
 */
const calculateTax = (price, taxRate = 0) => {
  return +(price * (taxRate / 100)).toFixed(2);
};

/**
 * Calculate order totals from cart items
 * @param {Array} items - Array of cart items
 * @param {number} discountAmount - Flat discount
 * @returns {Object} { subtotal, taxAmount, discountAmount, total }
 */
const calculateOrderTotals = (items, discountAmount = 0) => {
  let subtotal = 0;
  let taxAmount = 0;

  items.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    const itemTax = calculateTax(itemSubtotal, item.taxRate || 0);
    subtotal += itemSubtotal;
    taxAmount += itemTax;
  });

  const total = +(subtotal + taxAmount - discountAmount).toFixed(2);

  return {
    subtotal: +subtotal.toFixed(2),
    taxAmount: +taxAmount.toFixed(2),
    discountAmount: +discountAmount.toFixed(2),
    total,
  };
};

module.exports = { calculateTax, calculateOrderTotals };
