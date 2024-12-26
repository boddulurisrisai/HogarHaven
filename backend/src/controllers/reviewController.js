const Review = require('../models/Review'); // Adjust the path as necessary

async function getReviewsByProductModelName(doorbellModelName) {
  try {
    const reviews = await Review.find({ ProductModelName: doorbellModelName });
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews from database:', error);
    throw error; // Propagate the error to the route handler
  }
}

module.exports = {
  getReviewsByProductModelName,
};
