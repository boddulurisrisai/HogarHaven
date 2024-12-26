import React, { useState } from 'react';
import Header from '../components/LoginHeader'; // Import Header component
import Footer from '../components/Footer'; // Import Footer component
import { useCart } from '../CartContext'; // Import useCart hook
import { useNavigate } from 'react-router-dom';

function CustomerLandingPage() {
  const navigate = useNavigate(); // Initialize the navigate function
  const { cart, addToCart } = useCart(); // Use cart and addToCart from CartContext
  const [selectedProduct, setSelectedProduct] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('home');
  const [orderStatus, setOrderStatus] = useState(null);

  // Hardcoded products in a HashMap-like structure (JavaScript object)
  const productCategories = {
    "Smart Doorbells": [
      { id: 1, name: "Ring Video Doorbell", price: 199, image: './images/doorbell/RingVideoDoorbell.jpg' },
      { id: 2, name: "Nest Hello", price: 229, image: './images/doorbell/NestHello.jpeg' },
      { id: 3, name: "Eufy Security Doorbell", price: 129, image: './images/doorbell/EufySecurityDoorbell.jpg' },
      { id: 4, name: "Arlo Video Doorbell", price: 149, image: './images/doorbell/ArloVideoDoorbell.jpg' },
      { id: 5, name: "RemoBell S", price: 99, image: './images/doorbell/RemoBell S.jpg' }
    ],
    "Smart Doorlocks": [
      { id: 1, name: "August Smart Lock", price: 149, image: './images/doorlock/AugustSmartLock .jpg' },
      { id: 2, name: "Schlage Encode", price: 249, image: './images/doorlock/SchlageEncode.jpg' },
      { id: 3, name: "Yale Assure Lock", price: 199, image: './images/doorlock/YaleAssureLock.jpg' },
      { id: 4, name: "Ultraloq U-Bolt", price: 129, image: './images/doorlock/UltraloqU-Bolt.jpg' },
      { id: 5, name: "Level Lock", price: 199, image: './images/doorlock/LevelLock.jpg' }
    ],
    "Smart Speakers": [
      { id: 1, name: "Amazon Echo", price: 99, image: './images/speaker/Amazon Echo.jpg'},
      { id: 2, name: "Google Nest Audio", price: 99, image: './images/speaker/Google Nest Audio.jpg' },
      { id: 3, name: "Apple HomePod Mini", price: 99, image: './images/speaker/AppleHomePodMini.jpeg' },
      { id: 4, name: "Sonos One", price: 199, image: './images/speaker/SonosOne.jpeg'},
      { id: 5, name: "Bose Smart Speaker", price: 299, image: './images/speaker/BoseSmartSpeaker.jpg'}
    ],
    "Smart Lightings": [
      { id: 1, name: "Philips Hue Bulb", price: 49, image: './images/lighting/Philips Hue Bulb.jpg' },
      { id: 2, name: "LIFX Smart Bulb", price: 59, image: './images/lighting/LIFX Smart Bulb.jpeg' },
      { id: 3, name: "Wyze Bulb", price: 29, image: './images/lighting/Wyze Bulb.webp' },
      { id: 4, name: "TP-Link Kasa", price: 39, image: './images/lighting/TP-Link Kasa.jpeg' },
      { id: 5, name: "Sengled Smart Bulb", price: 19, image: './images/lighting/Sengled Smart Bulb.jpg' }
    ],
    "Smart Thermostats": [
      { id: 1, name: "Nest Learning Thermostat", price: 249, image: './images/thermostat/Nest Learning Thermostat.jpg' },
      { id: 2, name: "Ecobee SmartThermostat", price: 229, image: './images/thermostat/Ecobee SmartThermostat.jpg' },
      { id: 3, name: "Honeywell Lyric T5", price: 149, image: './images/thermostat/Honeywell Lyric T5.jpg' },
      { id: 4, name: "Emerson Sensi", price: 129, image: './images/thermostat/Emerson Sensi.jpg' },
      { id: 5, name: "Lux Kono", price: 99, image: './images/thermostat/Lux Kono.jpg' }
    ]
  };

  const handleOrder = () => {
    console.log('Product:', selectedProduct);
    console.log('Delivery Option:', deliveryOption);
    navigate('/cart');    // Navigate to cart page (assuming you use React Router for navigation)
    // history.push('/cart');
  };

  const handleAddToCart = (product) => {
    addToCart(product); // Add product to cart
  };

  return (
    <div className="customer-landing-page">
      <Header />
      <main className="main-content">
        <h2>SmartHomes Product Selection</h2>

        {/* Loop through product categories */}
        {Object.keys(productCategories).map((category) => (
          <div key={category}>
            <h3>{category}</h3>
            <div className="product-gallery">
              {productCategories[category].map((product) => (
                <div key={product.id} className="product-item">
                  <img src={product.image} alt={product.name} />
                  <h4>{product.name}</h4>
                  <p>Price: ${product.price}</p>
                  <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="delivery-options">
          <h3>Choose Delivery Option</h3>
          <label>
            <input
              type="radio"
              value="home"
              checked={deliveryOption === 'home'}
              onChange={() => setDeliveryOption('home')}
            />
            Home Delivery
          </label>
          <label>
            <input
              type="radio"
              value="pickup"
              checked={deliveryOption === 'pickup'}
              onChange={() => setDeliveryOption('pickup')}
            />
            In-Store Pickup
          </label>
        </div>

        <button onClick={handleOrder}>Place Order</button>

        {orderStatus && <p>{orderStatus}</p>}
      </main>
      <Footer />
    </div>
  );
}

export default CustomerLandingPage;
