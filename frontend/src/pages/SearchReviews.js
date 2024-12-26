import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/LoginHeader';

const SearchReviews = () => {
    const [searchQuery, setSearchQuery] = useState(''); // Stores the search query
    const [reviews, setReviews] = useState([]); // Stores the search results
    const [loading, setLoading] = useState(false); // Indicates loading state
    const [error, setError] = useState(''); // Stores error message

    // Handle the review search
    const handleSearchReviews = async () => {
        setLoading(true);
        setError('');

        try {
            // Sending the search query in the request body
            const response = await axios.post('http://localhost:3031/api/search-reviews', {
                query: searchQuery, // Send query in the request body
            });

            console.log("Search API Response: ", response.data);
            if (response.data.results && response.data.results.length > 0) {
                setReviews(response.data.results); // Update reviews with search results
            } else {
                setError('No reviews found for your search');
            }
        } catch (err) {
            setError('Error searching reviews');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <Header />
        <div className="search-reviews-container">
            <h1>Search Reviews</h1>

            {/* Search Input */}
            <div className="search-input">
                <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
                />
                <button onClick={handleSearchReviews} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Display error message if any */}
            {error && <div className="error">{error}</div>}

            {/* Display Reviews */}
            {reviews.length > 0 && (
                <div className="reviews-list">
                    <h2>Search Results:</h2>
<ul>
    {reviews.map((review, index) => (
        <li key={index}>
            <strong>{review.ProductModelName}</strong>
            <div>
                {/* Display the rating as stars */}
                {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ color: i < review.ReviewRating ? '#FFD700' : '#ccc' }}>
                        {i < review.ReviewRating ? '★' : '☆'}
                    </span>
                ))}
            </div>
            <p>{review.ReviewText}</p>
            <p>{review.productCategory}</p>
            {/* <p>Posted on: {new Date(review.ReviewDate).toLocaleDateString()}</p> */}
        </li>
    ))}
</ul>
                </div>
            )}

             </div>
        </>
    );
};

export default SearchReviews;
