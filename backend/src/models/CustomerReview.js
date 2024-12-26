const mongoose = require('mongoose');

const CustomerReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CustomerReview', CustomerReviewSchema);
