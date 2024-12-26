import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext'; // Import useCart hook
import Header from '../components/LoginHeader'; // Import Header component
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Hardcoded accessories data for smart lighting
const lightingAccessoriesData = {
  "Philips Hue White and Color Ambiance": [
    { id: '1', name: 'Bulb', price: 20, image: '/images/lighting/accessories/Blb.webp' },
    { id: '2', name: 'Led Controller', price: 25, image: '/images/lighting/accessories/LedController.webp' },
    { id: '3', name: 'Socket', price: 11, image: '/images/lighting/accessories/socket.webp' },
  ],
  "LIFX Smart Bulb": [
    { id: '1', name: 'Bulb', price: 20, image: '/images/lighting/accessories/Blb.webp' },
    { id: '2', name: 'Led Controller', price: 25, image: '/images/lighting/accessories/LedController.webp' },
    { id: '3', name: 'Socket', price: 11, image: '/images/lighting/accessories/socket.webp' },
  ],
  "Sengled Smart Bulb": [
    { id: '1', name: 'Bulb', price: 20, image: '/images/lighting/accessories/Blb.webp' },
    { id: '2', name: 'Led Controller', price: 25, image: '/images/lighting/accessories/LedController.webp' },
    { id: '3', name: 'Socket', price: 11, image: '/images/lighting/accessories/socket.webp' },
  ],
  "TP-Link Kasa": [
    { id: '1', name: 'Bulb', price: 20, image: '/images/lighting/accessories/Blb.webp' },
    { id: '2', name: 'Led Controller', price: 25, image: '/images/lighting/accessories/LedController.webp' },
    { id: '3', name: 'Socket', price: 11, image: '/images/lighting/accessories/socket.webp' },
  ],
  "Wyze Bulb": [
    { id: '1', name: 'Bulb', price: 20, image: '/images/lighting/accessories/Blb.webp' },
    { id: '2', name: 'Led Controller', price: 25, image: '/images/lighting/accessories/LedController.webp' },
    { id: '3', name: 'Socket', price: 11, image: '/images/lighting/accessories/socket.webp' },
  ]
};

function SmartLighting() {
  const { cart, addToCart, removeFromCart, updateItemQuantity } = useCart();
  const [lightings, setLightings] = useState([]); // To store product details from MySQL
  const [selectedLighting, setSelectedLighting] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [accessories, setAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState({});
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const navigate = useNavigate();

  // Fetch data from the backend on component load
  useEffect(() => {
    const fetchLightings = async () => {
      try {
        const response = await axios.get('http://localhost:3030/api/products/productlist', {
          params: { product_category: 'Smart Lightings' },
        });
        setLightings(response.data);
      } catch (error) {
        console.error('Error fetching smart lighting products:', error);
      }
    };

    fetchLightings();
  }, []);

  useEffect(() => {
    if (selectedLighting) {
      const accessoryData = lightingAccessoriesData[selectedLighting.product_name] || [];
      setAccessories(accessoryData);
      const initialQuantities = accessoryData.reduce((acc, accessory) => {
        acc[accessory.id] = 1;
        return acc;
      }, {});
      setSelectedAccessories(initialQuantities);
    }
  }, [selectedLighting]);

  const handleImageClick = (lighting) => {
    setSelectedLighting(lighting);
    setQuantity(1); // Reset quantity when selecting a new lighting
  };

  const handleQuantityChange = (amount, item) => {
    if (item) {
      const newQuantity = Math.max(1, quantity + amount);
      setQuantity(newQuantity);
      updateItemQuantity(item.product_id, newQuantity);
    }
  };

  const isInCart = (item) => cart ? cart.some(cartItem => cartItem.product_id === item.product_id) : false;

  const handleAddToCart = (item) => {
    if (item) {
      addToCart({ ...item, quantity });
    }
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };

  const handleViewReviews = () => {
    if (selectedLighting) {
      navigate('/view-reviews', { state: { productModelName: selectedLighting.product_name } });
    } else {
      console.log('No lighting selected.');
    }
  };

  const handleWriteReview = () => {
    navigate('/write-review', { state: { lighting: selectedLighting } });
  };

  const handleAccessoryQuantityChange = (amount, accessory) => {
    if (accessory) {
      const newQuantity = Math.max(1, (selectedAccessories[accessory.id] || 1) + amount);
      setSelectedAccessories(prevQuantities => ({
        ...prevQuantities,
        [accessory.id]: newQuantity,
      }));
    }
  };

  return (
    <div className="smart-lighting-page">
      <Header /> 
      <main className="main-content">
        <h2>Smart Lightings</h2>
        <div className="product-gallery">
          {lightings.length > 0 ? (
            lightings.map((lighting) => (
              <div key={lighting.product_id} className="product-item">
                <img
                  src={lighting.product_image}
                  alt={lighting.product_name}
                  onClick={() => handleImageClick(lighting)}
                  style={{ cursor: 'pointer' }}
                />
                <h4>{lighting.product_name}</h4>
                <p>Price: ${lighting.product_price}</p>
                <div className="button-container">
                  {isInCart(lighting) ? (
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(-1, lighting)}>-</button>
                      <input
                        type="text"
                        className="quantity"
                        value={quantity}
                        readOnly
                      />
                      <button onClick={() => handleQuantityChange(1, lighting)}>+</button>
                      <button onClick={() => handleRemoveFromCart(lighting.product_id)}>Remove from Cart</button>
                    </div>
                  ) : (
                    <button onClick={() => handleAddToCart(lighting)}>Add to Cart</button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No smart lightings available.</p>
          )}
        </div>

        {selectedLighting && (
          <div className="selected-lighting">
            <h3>{selectedLighting.product_name}</h3>
            <img src={selectedLighting.product_image} alt={selectedLighting.product_name} className="selected-image" />
            <p>Price: ${selectedLighting.product_price}</p>
            <div className="accessories">
              <h4>Accessories</h4>
              {accessories.length > 0 ? (
                <div className="accessories-gallery">
                  {accessories.map((accessory) => (
                    <div key={accessory.id} className="accessory-item">
                      <img src={accessory.image} alt={accessory.name} />
                      <h5>{accessory.name}</h5>
                      <p>Price: ${accessory.price}</p>
                      <div className="button-container">
                        <div className="quantity-controls">
                          <button onClick={() => handleAccessoryQuantityChange(-1, accessory)}>-</button>
                          <input
                            type="text"
                            className="quantity"
                            value={selectedAccessories[accessory.id] || 1}
                            readOnly
                          />
                          <button onClick={() => handleAccessoryQuantityChange(1, accessory)}>+</button>
                        </div>
                        <button onClick={() => addToCart({ ...accessory, quantity: selectedAccessories[accessory.id] || 1 })}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No accessories available.</p>
              )}
            </div>

            <div className="reviews">
              <h4>Reviews</h4>
              <button onClick={handleViewReviews}>View Reviews</button>
              <button onClick={handleWriteReview}>Write a Review</button>
              {showReviews && (
                <div className="reviews-list">
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <div key={index} className="review-item">
                        <p>{review.comment}</p>
                        <p>Rating: {review.rating}</p>
                      </div>
                    ))
                  ) : (
                    <p>No reviews available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SmartLighting;
