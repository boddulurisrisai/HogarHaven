import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import Header from '../components/LoginHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const accessoriesData = {
  "Ring Video Doorbell": [
    { id: '1', name: 'Ring Chime', price: 50, image: '/images/doorbell/accessories/Ring Chime.jpeg' },
    { id: '2', name: 'Ring Plug Adapter', price: 30, image: '/images/doorbell/accessories/Ring Plug Adapter.jpeg' },
    { id: '3', name: 'Ring Solar Panel', price: 20, image: '/images/doorbell/accessories/Ring Solar Panel.jpeg' },
  ],
  "Nest Hello": [
    { id: '1', name: 'Nest Chime', price: 50, image: '/images/doorbell/accessories/Ring Chime.jpeg' },
    { id: '2', name: 'Nest Plug Adapter', price: 30, image: '/images/doorbell/accessories/Ring Plug Adapter.jpeg' },
    { id: '3', name: 'Nest Solar Panel', price: 20, image: '/images/doorbell/accessories/Ring Solar Panel.jpeg' },
  ],
  "Eufy Security Video Doorbell": [
    { id: '1', name: 'Eufy Chime', price: 50, image: '/images/doorbell/accessories/Ring Chime.jpeg' },
    { id: '2', name: 'Eufy Plug Adapter', price: 30, image: '/images/doorbell/accessories/Ring Plug Adapter.jpeg' },
    { id: '3', name: 'Eufy Solar Panel', price: 20, image: '/images/doorbell/accessories/Ring Solar Panel.jpeg' },
  ],
  "Arlo Video Doorbell": [
    { id: '1', name: 'Arlo Chime', price: 50, image: '/images/doorbell/accessories/Ring Chime.jpeg' },
    { id: '2', name: 'Arlo Plug Adapter', price: 30, image: '/images/doorbell/accessories/Ring Plug Adapter.jpeg' },
    { id: '3', name: 'Arlo Solar Panel', price: 20, image: '/images/doorbell/accessories/Ring Solar Panel.jpeg' },
  ],
  "RemoBell S": [
    { id: '1', name: 'SimpliSafe Chime', price: 50, image: '/images/doorbell/accessories/Ring Chime.jpeg' },
    { id: '2', name: 'SimpliSafe Plug Adapter', price: 30, image: '/images/doorbell/accessories/Ring Plug Adapter.jpeg' },
    { id: '3', name: 'SimpliSafe Solar Panel', price: 20, image: '/images/doorbell/accessories/Ring Solar Panel.jpeg' },
  ]
};

function SmartDoorbell() {
  const { cart, addToCart, removeFromCart, updateItemQuantity } = useCart();
  const [doorbells, setDoorbells] = useState([]);
  const [selectedDoorbell, setSelectedDoorbell] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [accessories, setAccessories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoorbells = async () => {
      try {
        const response = await axios.get('http://localhost:3030/api/products/productlist', {
          params: { product_category: 'Smart Doorbells' },
        });
        setDoorbells(response.data);
      } catch (error) {
        console.error('Error fetching doorbells:', error);
      }
    };

    fetchDoorbells();
  }, []);

  useEffect(() => {
    if (selectedDoorbell) {
      const accessoryData = accessoriesData[selectedDoorbell.product_name] || [];
      setAccessories(accessoryData);
      setReviews([]);
      setShowReviews(false);
    }
  }, [selectedDoorbell]);

  const handleImageClick = (doorbell) => {
    setSelectedDoorbell(doorbell);
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
    if (selectedDoorbell) {
      navigate('/view-reviews', { state: { productModelName: selectedDoorbell.product_name } });
    } else {
      console.log('No doorbell selected.');
    }
  };

  const handleWriteReview = () => {
    navigate('/write-review', { state: { doorbell: selectedDoorbell } });
  };

  return (
    <div className="smart-doorbell-page">
      <Header />
      <main className="main-content">
        <h2>Smart Doorbells</h2>
        <div className="product-gallery">
          {doorbells.length > 0 ? (
            doorbells.map((doorbell) => (
              <div key={doorbell.product_id} className="product-item">
                <img
                  src={doorbell.product_image}
                  alt={doorbell.product_name}
                  onClick={() => handleImageClick(doorbell)}
                  style={{ cursor: 'pointer' }}
                />
                <h4>{doorbell.product_name}</h4>
                <p>Price: ${doorbell.product_price}</p>
                <div className="button-container">
                  {isInCart(doorbell) ? (
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(-1, doorbell)}>-</button>
                      <input type="text" className="quantity" value={quantity} readOnly />
                      <button onClick={() => handleQuantityChange(1, doorbell)}>+</button>
                      <button onClick={() => handleRemoveFromCart(doorbell.product_id)}>Remove from Cart</button>
                    </div>
                  ) : (
                    <button onClick={() => handleAddToCart(doorbell)}>Add to Cart</button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No smart doorbells available.</p>
          )}
        </div>

        {selectedDoorbell && (
          <div className="selected-doorbell">
            <h3>{selectedDoorbell.product_name}</h3>
            <img src={selectedDoorbell.product_image} alt={selectedDoorbell.product_name} className="selected-image" />
            <p>Price: ${selectedDoorbell.product_price}</p>
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
                <p>No accessories available for this doorbell.</p>
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

export default SmartDoorbell;
