const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  ProductCategory: { type: String, required: true },
  ProductModelName: { type: String, required: true },
  ProductPrice: { type: Number, required: true },
  StoreID: { type: String, required: true },
  StoreZip: { type: String, required: true },
  StoreCity: { type: String, required: true },
  StoreState: { type: String, required: true },
  ProductOnSale: { type: Boolean, default: false },
  ManufacturerName: { type: String, required: true },
  ManufacturerRebate: { type: Boolean, default: false },
  UserID: { type: String, required: true },
  UserAge: { type: Number, required: true },
  UserGender: { type: String, required: true },
  UserOccupation: { type: String, required: true },
  ReviewRating: { type: Number, required: true, min: 1, max: 5 },
  ReviewDate: { type: String, required: true },
  ReviewText: { type: String, required: true },
});

module.exports = mongoose.model('Review', reviewSchema);
