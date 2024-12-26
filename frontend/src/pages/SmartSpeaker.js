import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext'; // Import useCart hook
import Header from '../components/LoginHeader'; // Import Header component
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import axios from 'axios'; // Import axios for API requests

// Hardcoded accessories data for smart speakers
const accessoriesData = {
  "Amazon Echo Dot (4th Gen)": [
    { id: '1', name: 'Charging Cable', price: 130, image: '/images/speaker/accessories/ChargingCable.webp' },
    { id: '2', name: 'Mount', price: 30, image: '/images/speaker/accessories/Wall Mounted.webp' },
    { id: '3', name: 'Wall Mount', price: 20, image: '/images/speaker/accessories/WallMount.webp' },
  ],
  "Google Nest Audio": [
    { id: '1', name: 'Charging Cable', price: 130, image: '/images/speaker/accessories/ChargingCable.webp' },
    { id: '2', name: 'Mount', price: 30, image: '/images/speaker/accessories/Wall Mounted.webp' },
    { id: '3', name: 'Wall Mount', price: 20, image: '/images/speaker/accessories/WallMount.webp' },
  ],
  "Apple HomePod Mini": [
    { id: '1', name: 'Charging Cable', price: 130, image: '/images/speaker/accessories/ChargingCable.webp' },
    { id: '2', name: 'Mount', price: 30, image: '/images/speaker/accessories/Wall Mounted.webp' },
    { id: '3', name: 'Wall Mount', price: 20, image: '/images/speaker/accessories/WallMount.webp' },
  ],
  "Sonos One": [
    { id: '1', name: 'Charging Cable', price: 130, image: '/images/speaker/accessories/ChargingCable.webp' },
    { id: '2', name: 'Mount', price: 30, image: '/images/speaker/accessories/Wall Mounted.webp' },
    { id: '3', name: 'Wall Mount', price: 20, image: '/images/speaker/accessories/WallMount.webp' },
  ],
  "Bose Home Speaker 500": [
    { id: '1', name: 'Charging Cable', price: 130, image: '/images/speaker/accessories/ChargingCable.webp' },
    { id: '2', name: 'Mount', price: 30, image: '/images/speaker/accessories/Wall Mounted.webp' },
    { id: '3', name: 'Wall Mount', price: 20, image: '/images/speaker/accessories/WallMount.webp' },
  ],
};

function SmartSpeakers() {
  const { cart, addToCart, removeFromCart, updateItemQuantity } = useCart();
  const [speakers, setSpeakers] = useState([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [accessories, setAccessories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response = await axios.get('http://localhost:3030/api/products/productlist', {
          params: { product_category: 'Smart Speakers' },
        });
        setSpeakers(response.data);
      } catch (error) {
        console.error('Error fetching speakers:', error);
      }
    };

    fetchSpeakers();
  }, []);

  useEffect(() => {
    if (selectedSpeaker) {
      const accessoryData = accessoriesData[selectedSpeaker.product_name] || [];
      setAccessories(accessoryData);
      setReviews([]);
      setShowReviews(false);
    }
  }, [selectedSpeaker]);

  const handleImageClick = (speaker) => {
    setSelectedSpeaker(speaker);
    setQuantity(1);
  };

  const handleQuantityChange = (amount, item) => {
    const newQuantity = Math.max(1, quantity + amount);
    setQuantity(newQuantity);
    if (item) updateItemQuantity(item.product_id, newQuantity);
  };

  const isInCart = (item) => cart.some(cartItem => cartItem.product_id === item.product_id);

  const handleAddToCart = (item) => {
    addToCart({ ...item, quantity });
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };

  const handleViewReviews = () => {
    if (selectedSpeaker) {
      navigate('/view-reviews', { state: { productModelName: selectedSpeaker.product_name } });
    } else {
      console.log('No speaker selected.');
    }
  };

  const handleWriteReview = () => {
    navigate('/write-review', { state: { speaker: selectedSpeaker } });
  };

  return (
    <div className="smart-speakers-page">
      <Header />
      <main className="main-content">
        <h2>Smart Speakers</h2>
        <div className="product-gallery">
          {speakers.length > 0 ? (
            speakers.map((speaker) => (
              <div key={speaker.product_id} className="product-item">
                <img
                  src={speaker.product_image}
                  alt={speaker.product_name}
                  onClick={() => handleImageClick(speaker)}
                  style={{ cursor: 'pointer' }}
                />
                <h4>{speaker.product_name}</h4>
                <p>Price: ${speaker.product_price}</p>
                <div className="button-container">
                  {isInCart(speaker) ? (
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(-1, speaker)}>-</button>
                      <input type="text" className="quantity" value={quantity} readOnly />
                      <button onClick={() => handleQuantityChange(1, speaker)}>+</button>
                      <button onClick={() => handleRemoveFromCart(speaker.product_id)}>Remove from Cart</button>
                    </div>
                  ) : (
                    <button onClick={() => handleAddToCart(speaker)}>Add to Cart</button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No smart speakers available.</p>
          )}
        </div>

        {selectedSpeaker && (
          <div className="selected-speaker">
            <h3>{selectedSpeaker.product_name}</h3>
            <img src={selectedSpeaker.product_image} alt={selectedSpeaker.product_name} className="selected-image" />
            <p>Price: ${selectedSpeaker.product_price}</p>
            <div className="accessories">
              <h4>Accessories</h4>
              {accessories.length > 0 ? (
                <div className="accessories-gallery">
                  {accessories.map((accessory) => (
                    <div key={accessory.id} className="accessories-item">
                      <img src={accessory.image} alt={accessory.name} className="accessories-image" />
                      <h4>{accessory.name}</h4>
                      <p>Price: ${accessory.price}</p>
                      <button onClick={() => handleAddToCart(accessory)}>Add to Cart</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No accessories available for this speaker.</p>
              )}
            </div>

            <div className="reviews-section">
              <h4>Customer Reviews</h4>
              <button onClick={handleViewReviews}>View Reviews</button>
              <button onClick={handleWriteReview}>Write a Review</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SmartSpeakers;
