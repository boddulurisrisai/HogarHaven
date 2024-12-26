import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import Header from '../components/LoginHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const accessoriesData = {
  "August Smart Lock": [
    { id: '1', name: 'Level Connect', price: 60, image: '/images/doorlock/accessories/LevelConnect.jpg' },
    { id: '2', name: 'August Doorbell Camera', price: 150, image: '/images/doorlock/accessories/smart keypad.webp' },
    { id: '3', name: 'August Smart Lock Battery Pack', price: 40, image: '/images/doorlock/accessories/Yale module.webp' },
  ],
  "Schlage Encode": [
    { id: '1', name: 'Level Connect', price: 60, image: '/images/doorlock/accessories/LevelConnect.jpg' },
    { id: '2', name: 'August Doorbell Camera', price: 150, image: '/images/doorlock/accessories/smart keypad.webp' },
    { id: '3', name: 'August Smart Lock Battery Pack', price: 40, image: '/images/doorlock/accessories/Yale module.webp' },
  ],
  "Yale Assure Lock": [
    { id: '1', name: 'Level Connect', price: 60, image: '/images/doorlock/accessories/LevelConnect.jpg' },
    { id: '2', name: 'August Doorbell Camera', price: 150, image: '/images/doorlock/accessories/smart keypad.webp' },
    { id: '3', name: 'August Smart Lock Battery Pack', price: 40, image: '/images/doorlock/accessories/Yale module.webp' },
  ],
  "Level Lock": [
    { id: '1', name: 'Level Connect', price: 60, image: '/images/doorlock/accessories/LevelConnect.jpg' },
    { id: '2', name: 'August Doorbell Camera', price: 150, image: '/images/doorlock/accessories/smart keypad.webp' },
    { id: '3', name: 'August Smart Lock Battery Pack', price: 40, image: '/images/doorlock/accessories/Yale module.webp' },
  ],
  "UltraloqU Bolt": [
    { id: '1', name: 'Level Connect', price: 60, image: '/images/doorlock/accessories/LevelConnect.jpg' },
    { id: '2', name: 'August Doorbell Camera', price: 150, image: '/images/doorlock/accessories/smart keypad.webp' },
    { id: '3', name: 'August Smart Lock Battery Pack', price: 40, image: '/images/doorlock/accessories/Yale module.webp' },
  ]
};

function SmartDoorlock() {
  const { cart, addToCart, removeFromCart, updateItemQuantity } = useCart();
  const [doorlocks, setDoorlocks] = useState([]);
  const [selectedDoorlock, setSelectedDoorlock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [accessories, setAccessories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoorlocks = async () => {
      try {
        const response = await axios.get('http://localhost:3030/api/products/productlist', {
          params: { product_category: 'Smart Doorlocks' },
        });
        setDoorlocks(response.data);
      } catch (error) {
        console.error('Error fetching doorlocks:', error);
      }
    };

    fetchDoorlocks();
  }, []);

  useEffect(() => {
    if (selectedDoorlock) {
      const accessoryData = accessoriesData[selectedDoorlock.product_name] || [];
      setAccessories(accessoryData);
      setReviews([]);
      setShowReviews(false);
    }
  }, [selectedDoorlock]);

  const handleImageClick = (doorlock) => {
    setSelectedDoorlock(doorlock);
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
    if (selectedDoorlock) {
      navigate('/view-reviews', { state: { productModelName: selectedDoorlock.product_name } });
    } else {
      console.log('No doorlock selected.');
    }
  };

  const handleWriteReview = () => {
    navigate('/write-review', { state: { doorlock: selectedDoorlock } });
  };

  return (
    <div className="smart-doorlock-page">
      <Header />
      <main className="main-content">
        <h2>Smart Doorlocks</h2>
        <div className="product-gallery">
          {doorlocks.length > 0 ? (
            doorlocks.map((doorlock) => (
              <div key={doorlock.product_id} className="product-item">
                <img
                  src={doorlock.product_image}
                  alt={doorlock.product_name}
                  onClick={() => handleImageClick(doorlock)}
                  style={{ cursor: 'pointer' }}
                />
                <h4>{doorlock.product_name}</h4>
                <p>Price: ${doorlock.product_price}</p>
                <div className="button-container">
                  {isInCart(doorlock) ? (
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(-1, doorlock)}>-</button>
                      <input type="text" className="quantity" value={quantity} readOnly />
                      <button onClick={() => handleQuantityChange(1, doorlock)}>+</button>
                      <button onClick={() => handleRemoveFromCart(doorlock.product_id)}>Remove from Cart</button>
                    </div>
                  ) : (
                    <button onClick={() => handleAddToCart(doorlock)}>Add to Cart</button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No smart doorlocks available.</p>
          )}
        </div>

        {selectedDoorlock && (
          <div className="selected-doorlock">
            <h3>{selectedDoorlock.product_name}</h3>
            <img src={selectedDoorlock.product_image} alt={selectedDoorlock.product_name} className="selected-image" />
            <p>Price: ${selectedDoorlock.product_price}</p>
            <div className="accessories">
              <h4>Accessories</h4>
              {accessories.length > 0 ? (
                <div className="accessories-gallery">
                  {accessories.map((accessory) => (
                    <div key={accessory.id} className="accessories-item">
                      <img src={accessory.image} alt={accessory.name} className="accessories-image" />
                      <h4>{accessory.name}</h4>
                      <p>Price: ${accessory.price}</p>
                      <div className="button-container">
                        <button onClick={() => handleAddToCart(accessory)}>Add to Cart</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No accessories available for this doorlock.</p>
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

export default SmartDoorlock;
