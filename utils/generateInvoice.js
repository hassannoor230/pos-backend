/**
 * Generate plain text invoice for printing
 * @param {Object} order - Populated order object
 * @returns {string} Invoice text
 */
const generateInvoice = (order) => {
  const line = '─'.repeat(40);
  const fmt = (n) => `$${Number(n).toFixed(2)}`;
  const pad = (str, len) => String(str).substring(0, len).padEnd(len);
  const rpad = (str, len) => String(str).substring(0, len).padStart(len);

  let invoice = `
${' '.repeat(12)}SMARTPOS PRO
${' '.repeat(10)}Multi-Store POS System
${line}
Order #: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleString()}
Cashier: ${order.cashier?.name || 'N/A'}
Store: ${order.store}
Payment: ${order.paymentMethod.toUpperCase()}
${line}
${'ITEM'.padEnd(20)} ${'QTY'.padStart(4)} ${'PRICE'.padStart(8)} ${'TOTAL'.padStart(8)}
${line}
`;

  order.items.forEach(item => {
    invoice += `${pad(item.name, 20)} ${rpad(item.quantity, 4)} ${rpad(fmt(item.price), 8)} ${rpad(fmt(item.subtotal), 8)}\n`;
  });

  invoice += `${line}
${'Subtotal:'.padEnd(30)} ${rpad(fmt(order.subtotal), 10)}
${'Tax:'.padEnd(30)} ${rpad(fmt(order.taxAmount), 10)}`;

  if (order.discountAmount > 0) {
    invoice += `\n${'Discount:'.padEnd(30)} ${rpad('-' + fmt(order.discountAmount), 10)}`;
  }

  invoice += `
${line}
${'TOTAL:'.padEnd(30)} ${rpad(fmt(order.total), 10)}
${'Amount Paid:'.padEnd(30)} ${rpad(fmt(order.amountPaid), 10)}
${'Change:'.padEnd(30)} ${rpad(fmt(order.change), 10)}
${line}
${'Thank you for your purchase!'.padStart(34)}
${'Powered by SmartPOS Pro'.padStart(31)}
`;

  return invoice;
};

/**
 * Generate invoice as JSON for frontend rendering
 */
const generateInvoiceData = (order) => ({
  orderNumber: order.orderNumber,
  date: order.createdAt,
  cashier: order.cashier?.name,
  store: order.store,
  items: order.items,
  subtotal: order.subtotal,
  taxAmount: order.taxAmount,
  discountAmount: order.discountAmount,
  total: order.total,
  paymentMethod: order.paymentMethod,
  amountPaid: order.amountPaid,
  change: order.change,
});

module.exports = { generateInvoice, generateInvoiceData };
