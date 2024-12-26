// models/Product.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    UserID: String,
    UserAge: Number,
    UserGender: String,
    UserOccupation: String,
    ReviewRating: Number,
    ReviewDate: Date,
    ReviewText: String,
});

const productSchema = new mongoose.Schema({
    ProductCategory: String,
    ProductModelName: String,
    ProductPrice: Number,
    StoreID: String,
    StoreZip: String,
    StoreCity: String,
    StoreState: String,
    ProductOnSale: Boolean,
    ManufacturerName: String,
    ManufacturerRebate: Boolean,
    Reviews: [reviewSchema],  // Array of reviews
    SoldCount: Number, // A field to track how many times a product has been sold
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
