const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name required'], trim: true },
  description: { type: String, default: '' },
  sku: { type: String, required: [true, 'SKU required'], unique: true, uppercase: true },
  barcode: { type: String, default: '' },
  price: { type: Number, required: [true, 'Price required'], min: 0 },
  costPrice: { type: Number, default: 0, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  lowStockAlert: { type: Number, default: 10 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String, default: '' },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  discount: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'pcs' },
  store: { type: String, default: 'Main Branch' },
  tags: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

ProductSchema.virtual('profit').get(function () {
  return +(this.price - this.costPrice).toFixed(2);
});

ProductSchema.virtual('profitMargin').get(function () {
  if (!this.price) return 0;
  return +((this.price - this.costPrice) / this.price * 100).toFixed(2);
});

ProductSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockAlert;
});

module.exports = mongoose.model('Product', ProductSchema);
