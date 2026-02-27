require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Connected — seeding database...');

  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  const hashedPw = await bcrypt.hash('password123', 10);

  const users = await User.insertMany([
    { name: 'Super Admin', email: 'admin@smartpos.com', password: hashedPw, role: 'super_admin', phone: '+1-555-0100', isActive: true },
    { name: 'Store Manager', email: 'manager@smartpos.com', password: hashedPw, role: 'store_admin', phone: '+1-555-0200', isActive: true, store: 'Main Branch' },
    { name: 'Cashier John', email: 'cashier@smartpos.com', password: hashedPw, role: 'cashier', phone: '+1-555-0300', isActive: true, store: 'Main Branch' },
    { name: 'Inv. Manager', email: 'inventory@smartpos.com', password: hashedPw, role: 'inventory_manager', phone: '+1-555-0400', isActive: true, store: 'Main Branch' },
  ]);

  const categories = await Category.insertMany([
    { name: 'Electronics', icon: '📱', color: '#3b82f6' },
    { name: 'Clothing', icon: '👕', color: '#8b5cf6' },
    { name: 'Food & Beverages', icon: '🍎', color: '#22c55e' },
    { name: 'Home & Garden', icon: '🏡', color: '#f59e0b' },
    { name: 'Sports & Fitness', icon: '⚽', color: '#ef4444' },
    { name: 'Books & Media', icon: '📚', color: '#06b6d4' },
    { name: 'Beauty & Health', icon: '💄', color: '#ec4899' },
    { name: 'Automotive', icon: '🚗', color: '#64748b' },
  ]);

  const products = [
    { name: 'iPhone 15 Pro 256GB', sku: 'ELEC-001', barcode: '8901234567890', price: 1199.99, costPrice: 900.00, stock: 25, category: categories[0]._id, taxRate: 8, lowStockAlert: 5, unit: 'pcs', description: 'Apple iPhone 15 Pro with A17 Pro chip', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop' },
    { name: 'Samsung Galaxy S24 Ultra', sku: 'ELEC-002', barcode: '8901234567891', price: 1099.99, costPrice: 780.00, stock: 18, category: categories[0]._id, taxRate: 8, lowStockAlert: 5, unit: 'pcs', description: 'Samsung flagship with S-Pen', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop' },
    { name: 'MacBook Pro 14" M3', sku: 'ELEC-003', barcode: '8901234567892', price: 1999.99, costPrice: 1500.00, stock: 8, category: categories[0]._id, taxRate: 8, lowStockAlert: 3, unit: 'pcs', description: 'Apple MacBook Pro M3 chip, 16GB RAM', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' },
    { name: 'iPad Air 5th Gen', sku: 'ELEC-004', barcode: '8901234567893', price: 749.99, costPrice: 550.00, stock: 3, category: categories[0]._id, taxRate: 8, lowStockAlert: 5, unit: 'pcs', description: 'Apple iPad Air 64GB Wi-Fi', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop' },
    { name: 'AirPods Pro 2nd Gen', sku: 'ELEC-005', barcode: '8901234567894', price: 249.99, costPrice: 175.00, stock: 42, category: categories[0]._id, taxRate: 8, lowStockAlert: 10, unit: 'pcs', description: 'Active Noise Cancellation earbuds', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop' },
    { name: 'Sony WH-1000XM5', sku: 'ELEC-006', barcode: '8901234567895', price: 349.99, costPrice: 240.00, stock: 20, category: categories[0]._id, taxRate: 8, lowStockAlert: 5, unit: 'pcs', description: 'Industry-leading noise cancelling headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
    { name: 'Dell 27" 4K Monitor', sku: 'ELEC-007', barcode: '8901234567896', price: 599.99, costPrice: 420.00, stock: 12, category: categories[0]._id, taxRate: 8, lowStockAlert: 3, unit: 'pcs', description: 'Dell UltraSharp 4K USB-C Monitor', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop' },
    { name: 'Logitech MX Keys', sku: 'ELEC-008', barcode: '8901234567897', price: 109.99, costPrice: 65.00, stock: 35, category: categories[0]._id, taxRate: 8, lowStockAlert: 8, unit: 'pcs', description: 'Advanced Wireless Illuminated Keyboard', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop' },
    { name: "Levi's 501 Jeans", sku: 'CLTH-001', barcode: '8902234567890', price: 89.99, costPrice: 38.00, stock: 85, category: categories[1]._id, taxRate: 5, lowStockAlert: 15, unit: 'pcs', description: 'Classic Original Fit — Various sizes', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop' },
    { name: 'Nike Air Max 270', sku: 'CLTH-002', barcode: '8902234567891', price: 149.99, costPrice: 72.00, stock: 60, category: categories[1]._id, taxRate: 5, lowStockAlert: 10, unit: 'pairs', description: 'Running shoes with Max Air unit', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { name: 'Adidas Ultraboost 24', sku: 'CLTH-003', barcode: '8902234567892', price: 189.99, costPrice: 108.00, stock: 45, category: categories[1]._id, taxRate: 5, lowStockAlert: 8, unit: 'pairs', description: 'Boost cushioning technology', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop' },
    { name: 'Ralph Lauren Polo Shirt', sku: 'CLTH-004', barcode: '8902234567893', price: 79.99, costPrice: 32.00, stock: 120, category: categories[1]._id, taxRate: 5, lowStockAlert: 20, unit: 'pcs', description: 'Classic fit cotton polo shirt', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop' },
    { name: 'Organic Coffee Beans 500g', sku: 'FOOD-001', barcode: '8903234567890', price: 24.99, costPrice: 11.00, stock: 200, category: categories[2]._id, taxRate: 0, lowStockAlert: 30, unit: 'bags', description: 'Single origin Ethiopian Arabica beans', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop' },
    { name: 'Japanese Green Tea 50 bags', sku: 'FOOD-002', barcode: '8903234567891', price: 14.99, costPrice: 6.00, stock: 150, category: categories[2]._id, taxRate: 0, lowStockAlert: 20, unit: 'boxes', description: 'Premium Matcha-blend green tea', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop' },
    { name: 'Premium Olive Oil 1L', sku: 'FOOD-003', barcode: '8903234567892', price: 18.99, costPrice: 9.00, stock: 2, category: categories[2]._id, taxRate: 0, lowStockAlert: 10, unit: 'bottles', description: 'Extra Virgin Greek Olive Oil', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop' },
    { name: 'IKEA Desk Lamp LED', sku: 'HOME-001', barcode: '8904234567890', price: 39.99, costPrice: 18.00, stock: 40, category: categories[3]._id, taxRate: 8, lowStockAlert: 5, unit: 'pcs', description: 'Modern adjustable LED desk lamp', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop' },
    { name: 'Yoga Mat Premium Non-Slip', sku: 'SPRT-001', barcode: '8905234567890', price: 79.99, costPrice: 33.00, stock: 35, category: categories[4]._id, taxRate: 5, lowStockAlert: 8, unit: 'pcs', description: '6mm thick eco-friendly yoga mat', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop' },
    { name: 'Resistance Bands Set', sku: 'SPRT-002', barcode: '8905234567891', price: 29.99, costPrice: 12.00, stock: 75, category: categories[4]._id, taxRate: 5, lowStockAlert: 10, unit: 'sets', description: '5-band resistance set with handles', image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop' },
    { name: 'The Lean Startup', sku: 'BOOK-001', barcode: '8906234567890', price: 19.99, costPrice: 7.00, stock: 80, category: categories[5]._id, taxRate: 0, lowStockAlert: 10, unit: 'pcs', description: 'By Eric Ries — Business methodology', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop' },
    { name: 'Atomic Habits', sku: 'BOOK-002', barcode: '8906234567891', price: 17.99, costPrice: 6.50, stock: 65, category: categories[5]._id, taxRate: 0, lowStockAlert: 10, unit: 'pcs', description: 'By James Clear — Habit building', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop' },
  ];

  await Product.insertMany(products);

  // Create sample orders
  const prods = await Product.find().limit(8);
  const cashier = users[2];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    const item1 = prods[Math.floor(Math.random() * prods.length)];
    const item2 = prods[Math.floor(Math.random() * prods.length)];
    const qty1 = Math.floor(Math.random() * 3) + 1;
    const qty2 = Math.floor(Math.random() * 2) + 1;
    const subtotal = item1.price * qty1 + item2.price * qty2;
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const pm = ['cash', 'card', 'online'][Math.floor(Math.random() * 3)];

    await Order.create({
      cashier: cashier._id,
      store: 'Main Branch',
      items: [
        { product: item1._id, name: item1.name, price: item1.price, quantity: qty1, subtotal: item1.price * qty1 },
        { product: item2._id, name: item2.name, price: item2.price, quantity: qty2, subtotal: item2.price * qty2 },
      ],
      subtotal, taxAmount: tax, total,
      paymentMethod: pm, paymentStatus: 'paid', amountPaid: total, status: 'completed',
      createdAt: d,
    });
  }

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📋 Demo Login Credentials:');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│ Super Admin  → admin@smartpos.com / password123  │');
  console.log('│ Store Admin  → manager@smartpos.com / password123│');
  console.log('│ Cashier      → cashier@smartpos.com / password123│');
  console.log('│ Inventory    → inventory@smartpos.com / password123│');
  console.log('└─────────────────────────────────────────────────┘');

  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
