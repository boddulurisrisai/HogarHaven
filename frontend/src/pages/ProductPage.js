import React, { useState } from 'react';
import axios from 'axios';

const ProductPage = ({ product }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(1); // Assuming rating is between 1 and 5
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Function to handle review submission
  const submitReview = async () => {
    try {
      // Post review to the backend
      const response = await axios.post('http://localhost:3030/api/reviews', {
        productId: product.id, // Assuming `product.id` is available
        productName: product.name,
        rating,
        review
      });

      // Handle the success response
      if (response.status === 201) {
        setSuccessMessage('Review submitted successfully!');
        setErrorMessage('');
        setReview(''); // Reset the form
        setRating(1);
      }
    } catch (error) {
      setErrorMessage('Failed to submit review');
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      
      <h3>Submit a Review</h3>
      <form onSubmit={(e) => { e.preventDefault(); submitReview(); }}>
        <div>
          <label>Rating:</label>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div>
          <label>Review:</label>
          <textarea 
            value={review} 
            onChange={(e) => setReview(e.target.value)} 
            required 
          />
        </div>

        <button type="submit">Submit Review</button>
      </form>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
};

export default ProductPage;
