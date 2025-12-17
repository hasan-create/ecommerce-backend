const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  gender: { type: String, required: true },
  season: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
