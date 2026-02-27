const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Category name required'], trim: true, unique: true },
  icon: { type: String, default: '📦' },
  color: { type: String, default: '#22c55e' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
