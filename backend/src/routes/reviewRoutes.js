const express = require('express');
const router = express.Router();
const Review = require('../models/Review'); // Your MongoDB review model

// Get reviews by doorbell ID
router.get('/api/reviews/:doorbellId', async (req, res) => {
  try {
    const reviews = await Review.find({ doorbellId: req.params.doorbellId });
    res.json({ reviews });
  } catch (error) {
    res.status(500).send('Error fetching reviews');
  }
});

// Post a new review
router.post('/api/reviews', async (req, res) => {
  try {
    const newReview = new Review({
      doorbellId: req.body.doorbellId,
      review: req.body.review,
    });
    await newReview.save();
    res.status(201).send('Review submitted');
  } catch (error) {
    res.status(500).send('Error submitting review');
  }
});

module.exports = router;
