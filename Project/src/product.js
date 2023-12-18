const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  productID: Number,
  name: String,
  description: String,
  price: Number,
  category: String,
  weight: Number,
  manufacturer: String,
  stockQuantity: Number,
  SKU: Number,
  imageURL: String,
});

const products = mongoose.model("Product", productSchema);

module.exports = products;
