// src/routes/trendingRoutes.js

const express = require('express');
const Review = require('../models/Review'); // Correctly import the Review model
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Top five most liked products
        const mostLikedProducts = await Review.aggregate([
            {
                $group: {
                    _id: "$ProductModelName",
                    averageRating: { $avg: "$ReviewRating" },
                    totalLikes: { $sum: { $cond: [{ $gte: ["$ReviewRating", 4] }, 1, 0] } },
                }
            },
            { $sort: { averageRating: -1, totalLikes: -1 } },
            { $limit: 5 }
        ]);

        // Top five zip-codes where maximum number of products sold
        const zipCodeStats = await Review.aggregate([
            {
                $group: {
                    _id: "$StoreZip",
                    totalSold: { $sum: 1 }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Top five most sold products regardless of the rating
        const mostSoldProducts = await Review.aggregate([  // Correct the model name to Review
            {
                $group: {
                    _id: "$ProductModelName",
                    totalSold: { $sum: 1 }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Send the collected data as JSON
        res.json({
            mostLikedProducts,
            topZipCodes: zipCodeStats,
            mostSoldProducts
        });
    } catch (error) {
        console.error('Error fetching trending data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
