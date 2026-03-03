const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  sku:        { type: String, required: true, uppercase: true, trim: true },
  barcode:    { type: String, default: '' },
  price:      { type: Number, required: true, min: 0 },
  costPrice:  { type: Number, default: 0, min: 0 },
  stock:      { type: Number, default: 0, min: 0 },
  image:      { type: String, default: '' },
  attributes: [{ key: String, value: String }],
  isActive:   { type: Boolean, default: true },
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  name:           { type: String, required: [true, 'Product name required'], trim: true },
  description:    { type: String, default: '' },
  sku:            { type: String, required: [true, 'SKU required'], unique: true, uppercase: true },
  barcode:        { type: String, default: '' },
  price:          { type: Number, required: [true, 'Price required'], min: 0 },
  costPrice:      { type: Number, default: 0, min: 0 },
  stock:          { type: Number, default: 0, min: 0 },
  lowStockAlert:  { type: Number, default: 10 },
  category:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image:          { type: String, default: '' },
  taxRate:        { type: Number, default: 0, min: 0, max: 100 },
  discount:       { type: Number, default: 0, min: 0 },
  unit:           { type: String, default: 'pcs' },
  store:          { type: String, default: 'Main Branch' },
  tags:           [String],
  isActive:       { type: Boolean, default: true },

  // Variant fields
  hasVariants:    { type: Boolean, default: false },
  variantOptions: [{ label: String, values: [String] }],
  variants:       [VariantSchema],

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

ProductSchema.virtual('profit').get(function () {
  return +(this.price - this.costPrice).toFixed(2);
});
ProductSchema.virtual('profitMargin').get(function () {
  if (!this.price) return 0;
  return +((this.price - this.costPrice) / this.price * 100).toFixed(2);
});
ProductSchema.virtual('isLowStock').get(function () {
  if (this.hasVariants) return this.variants.some(v => v.isActive && v.stock <= this.lowStockAlert);
  return this.stock <= this.lowStockAlert;
});
ProductSchema.virtual('totalVariantStock').get(function () {
  if (!this.hasVariants) return this.stock;
  return this.variants.filter(v => v.isActive).reduce((s, v) => s + v.stock, 0);
});

module.exports = mongoose.model('Product', ProductSchema);