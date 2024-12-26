import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/LoginHeader';

function ProductReviewForm() {
  const [reviewData, setReviewData] = useState({
    ProductCategory: '',
    ProductModelName: '',
    ProductPrice: '',
    StoreID: '',
    StoreZip: '',
    StoreCity: '',
    StoreState: '',
    ProductOnSale: false,
    ManufacturerName: '',
    ManufacturerRebate: false,
    UserID: '',
    UserAge: '',
    UserGender: '',
    UserOccupation: '',
    ReviewRating: 1,
    ReviewDate: new Date().toLocaleDateString(),
    ReviewText: '',
  });

  const handleChange = (e) => {
    const { name, type, value } = e.target;
    setReviewData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post('http://localhost:3030/api/reviews', reviewData);
        alert('Review submitted successfully!');
      setReviewData({
        ProductCategory: '',
        ProductModelName: '',
        ProductPrice: '',
        StoreID: '',
        StoreZip: '',
        StoreCity: '',
        StoreState: '',
        ProductOnSale: false,
        ManufacturerName: '',
        ManufacturerRebate: false,
        UserID: '',
        UserAge: '',
        UserGender: '',
        UserOccupation: '',
        ReviewRating: 1,
        ReviewDate: new Date().toLocaleDateString(),
        ReviewText: '',
      });
    } catch (error) {
      console.error('Error submitting review', error);
    }
  };

  return (
    <>
      <Header />
      <div className="review-form-container">
        <h2>Submit Product Review</h2>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Product Category:</label>
            <select name="ProductCategory" value={reviewData.ProductCategory} onChange={handleChange} required>
              <option value="" disabled>Select a category</option>
              <option value="Smart Doorbell">Smart Doorbell</option>
              <option value="Smart Doorlock">Smart Doorlock</option>
              <option value="Smart Lighting">Smart Lighting</option>
              <option value="Smart Speaker">Smart Speaker</option>
              <option value="Smart Thermostat">Smart Thermostat</option>
            </select>
          </div>
          <div className="form-group">
            <label>Product Model Name:</label>
            <input type="text" name="ProductModelName" value={reviewData.ProductModelName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Product Price:</label>
            <input type="number" name="ProductPrice" value={reviewData.ProductPrice} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Store ID:</label>
            <input type="text" name="StoreID" value={reviewData.StoreID} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Store Zip:</label>
            <input type="text" name="StoreZip" value={reviewData.StoreZip} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Store City:</label>
            <input type="text" name="StoreCity" value={reviewData.StoreCity} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Store State:</label>
            <input type="text" name="StoreState" value={reviewData.StoreState} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Product On Sale:</label>
            <input type="checkbox" name="ProductOnSale" checked={reviewData.ProductOnSale} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Manufacturer Name:</label>
            <input type="text" name="ManufacturerName" value={reviewData.ManufacturerName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Manufacturer Rebate:</label>
            <input type="checkbox" name="ManufacturerRebate" checked={reviewData.ManufacturerRebate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>User ID:</label>
            <input type="text" name="UserID" value={reviewData.UserID} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>User Age:</label>
            <input type="number" name="UserAge" value={reviewData.UserAge} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>User Gender:</label>
            <input type="text" name="UserGender" value={reviewData.UserGender} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>User Occupation:</label>
            <input type="text" name="UserOccupation" value={reviewData.UserOccupation} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Review Rating (1-5):</label>
            <input type="number" name="ReviewRating" value={reviewData.ReviewRating} onChange={handleChange} min="1" max="5" required />
          </div>
          <div className="form-group">
            <label>Review Date:</label>
            <input type="date" name="ReviewDate" value={reviewData.ReviewDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Review Text:</label>
            <textarea name="ReviewText" value={reviewData.ReviewText} onChange={handleChange} placeholder="Write your review here" required></textarea>
          </div>
          <button type="submit" className="submit-button">Submit Review</button>
        </form>
      </div>
    </>
  );
}

export default ProductReviewForm;
