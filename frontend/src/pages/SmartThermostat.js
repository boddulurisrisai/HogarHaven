import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext'; // Import useCart hook
import Header from '../components/LoginHeader'; // Import Header component
import axios from 'axios'; // Import axios for API requests
import { useNavigate } from 'react-router-dom'; // Import navigation hook

const accessoriesData = {
  "Nest Learning Thermostat": [
    { id: '1', name: 'Decorative Wall Plate', price: 19.99, image: '/images/thermostat/accessories/Decorative Wall Plate.webp' },
    { id: '2', name: 'Wall Plate', price: 29.99, image: '/images/thermostat/accessories/wallPlate.webp' },
    { id: '3', name: 'Wire Adapter', price: 24.99, image: '/images/thermostat/accessories/WireAdapter.webp' },
  ],
  "Ecobee SmartThermostat with Voice Control": [
    { id: '1', name: 'Decorative Wall Plate', price: 19.99, image: '/images/thermostat/accessories/Decorative Wall Plate.webp' },
    { id: '2', name: 'Wall Plate', price: 29.99, image: '/images/thermostat/accessories/wallPlate.webp' },
    { id: '3', name: 'Wire Adapter', price: 24.99, image: '/images/thermostat/accessories/WireAdapter.webp' },
  ],
  // More thermostat models...
};

function SmartThermostat() {
  const { cart, addToCart, removeFromCart, updateItemQuantity } = useCart();
  const [thermostats, setThermostats] = useState([]);
  const [selectedThermostat, setSelectedThermostat] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [accessories, setAccessories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThermostats = async () => {
      try {
        const response = await axios.get('http://localhost:3030/api/products/productlist', {
          params: { product_category: 'Smart Thermostats' },
        });
        setThermostats(response.data);
      } catch (error) {
        console.error('Error fetching thermostats:', error);
      }
    };

    fetchThermostats();
  }, []);

  useEffect(() => {
    if (selectedThermostat) {
      const accessoryData = accessoriesData[selectedThermostat.product_name] || [];
      setAccessories(accessoryData);
      setReviews([]);
      setShowReviews(false);
    }
  }, [selectedThermostat]);

  const handleImageClick = (thermostat) => {
    setSelectedThermostat(thermostat);
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
    if (selectedThermostat) {
      navigate('/view-reviews', { state: { productModelName: selectedThermostat.product_name } });
    } else {
      console.log('No thermostat selected.');
    }
  };

  const handleWriteReview = () => {
    navigate('/write-review', { state: { thermostat: selectedThermostat } });
  };

  return (
    <div className="smart-thermostat-page">
      <Header />
      <main className="main-content">
        <h2>Smart Thermostats</h2>
        <div className="product-gallery">
          {thermostats.length > 0 ? (
            thermostats.map((thermostat) => (
              <div key={thermostat.product_id} className="product-item">
                <img
                  src={thermostat.product_image}
                  alt={thermostat.product_name}
                  onClick={() => handleImageClick(thermostat)}
                  style={{ cursor: 'pointer' }}
                />
                <h4>{thermostat.product_name}</h4>
                <p>Price: ${thermostat.product_price}</p>
                <div className="button-container">
                  {isInCart(thermostat) ? (
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(-1, thermostat)}>-</button>
                      <input type="text" className="quantity" value={quantity} readOnly />
                      <button onClick={() => handleQuantityChange(1, thermostat)}>+</button>
                      <button onClick={() => handleRemoveFromCart(thermostat.product_id)}>Remove from Cart</button>
                    </div>
                  ) : (
                    <button onClick={() => handleAddToCart(thermostat)}>Add to Cart</button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No smart thermostats available.</p>
          )}
        </div>

        {selectedThermostat && (
          <div className="selected-thermostat">
            <h3>{selectedThermostat.product_name}</h3>
            <img src={selectedThermostat.product_image} alt={selectedThermostat.product_name} className="selected-image" />
            <p>Price: ${selectedThermostat.product_price}</p>
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
                <p>No accessories available for this thermostat.</p>
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

export default SmartThermostat;
