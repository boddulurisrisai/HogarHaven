import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/LoginHeader';
import { FaThumbsUp, FaReply } from 'react-icons/fa';

function ViewReviews() {
  const location = useLocation();
  const { productModelName } = location.state;
  const [reviews, setReviews] = useState([]);
  const [likes, setLikes] = useState({});
  const [replies, setReplies] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [showAllReviews, setShowAllReviews] = useState(false); // New state for toggling reviews display

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:3030/api/reviews?ProductModelName=${productModelName}`);
        setReviews(response.data.reviews || []);

        // Initialize likes and replies for each review
        const initialLikes = {};
        const initialReplies = {};
        const initialShowReplyInput = {};

        response.data.reviews.forEach((review, index) => {
          initialLikes[index] = 0;
          initialReplies[index] = [];
          initialShowReplyInput[index] = false;
        });

        setLikes(initialLikes);
        setReplies(initialReplies);
        setShowReplyInput(initialShowReplyInput);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    if (productModelName) {
      fetchReviews();
    }
  }, [productModelName]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? 'filled-star' : 'empty-star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleLike = (index) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [index]: prevLikes[index] + 1,
    }));
  };

  const handleReplyToggle = (index) => {
    setShowReplyInput((prevShowReplyInput) => ({
      ...prevShowReplyInput,
      [index]: !prevShowReplyInput[index],
    }));
  };

  const handleReplySubmit = (index, replyText) => {
    if (replyText) {
      setReplies((prevReplies) => ({
        ...prevReplies,
        [index]: [...prevReplies[index], replyText],
      }));
      setShowReplyInput((prevShowReplyInput) => ({
        ...prevShowReplyInput,
        [index]: false,
      }));
    }
  };

  // Function to handle showing all reviews
  const handleShowAllReviews = () => {
    setShowAllReviews(true);
  };

  return (
    <div>
      <Header />
      <main className="main-content">
        <h2>Reviews for {productModelName}</h2>
        <div className="reviews-box">
          {reviews.length > 0 ? (
            (showAllReviews ? reviews : reviews.slice(0, 3)).map((review, index) => (
              <div key={index} className="review-item">
                <img src="/images/profile-icon.png" alt="User Icon" className="user-icon" />
                <div className="review-content">
                  <div className="review-rating">
                    {renderStars(review.ReviewRating)}
                  </div>
                  <p><strong>Product Name:</strong> {productModelName}</p>
                  <p><strong>Review:</strong> {review.ReviewText}</p>
                  <p><strong>Date:</strong> {review.ReviewDate}</p>
                  <p><strong>User Age:</strong> {review.UserAge}</p>
                  <p><strong>User Gender:</strong> {review.UserGender}</p>
                  <p><strong>Occupation:</strong> {review.UserOccupation}</p>
                  <p><strong>Product Category:</strong> {review.ProductCategory}</p>
                  <p><strong>Price:</strong> ${review.ProductPrice}</p>
                  <p><strong>Manufacturer Name:</strong> {review.ManufacturerName}</p>
                  <p><strong>Store:</strong> {review.StoreCity}, {review.StoreState}, {review.StoreZip}</p>
                  <p><strong>Product on Sale:</strong> {review.ProductOnSale ? 'Yes' : 'No'}</p>
                  <p><strong>Manufacturer Rebate:</strong> {review.ManufacturerRebate ? 'Yes' : 'No'}</p>
                  
                  <div className="review-actions">
                    <span className="like-icon" onClick={() => handleLike(index)}>
                      <FaThumbsUp /> ({likes[index]})
                    </span>
                    <span className="reply-icon" onClick={() => handleReplyToggle(index)}>
                      <FaReply />
                    </span>
                  </div>

                  {showReplyInput[index] && (
                    <div className="reply-input">
                      <textarea
                        placeholder="Write your reply..."
                        rows="3"
                        className="reply-textarea"
                        id={`reply-input-${index}`}
                      ></textarea>
                      <button
                        className="submit-reply-btn"
                        onClick={() =>
                          handleReplySubmit(index, document.getElementById(`reply-input-${index}`).value)
                        }
                      >
                        Submit Reply
                      </button>
                    </div>
                  )}

                  {replies[index].length > 0 && (
                    <div className="replies-section">
                      <strong>Replies:</strong>
                      <ul>
                        {replies[index].map((reply, replyIndex) => (
                          <li key={replyIndex}>{reply}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No reviews yet. Be the first to review this product!</p>
          )}
        </div>
        {/* "See More Reviews" Button */}
        {!showAllReviews && reviews.length > 3 && (
          <div className="review-actions">
            <button className="more-reviews-btn" onClick={handleShowAllReviews}>See More Reviews</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default ViewReviews;
