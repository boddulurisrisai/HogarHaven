import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { useCart } from '../CartContext'; // Import useCart hook
import Header from '../components/LoginHeader'; // Import Header component

function CartPage() {
  const { cart, removeFromCart, updateItemQuantity } = useCart();
  const [deliveryOption, setDeliveryOption] = useState('store-pickup'); // Default to 'In-store Pickup'
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation

  // Calculate total amount
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleDeliveryOptionChange = (event) => {
    setDeliveryOption(event.target.value);
  };

  return (
    <div className="cart-page">
      <Header /> {/* Include Header component */}
      <main className="main-content">
        <h2>Your Cart</h2>
        {cart.length > 0 ? (
          <div>
            <ul>
              {cart.map((item) => (
                <li key={item.id} className="cart-item">
                  {/* Display item image */}
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  
                  {/* Display item name, price, and quantity */}
                  <div className="cart-item-details">
                    <p>{item.name} - ${item.price}</p>
                    
                    {/* Quantity controls */}
                    <div className="quantity-controls">
                      <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>

                    {/* Remove from cart button */}
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Total amount */}
            <div className="cart-total">
              <h3>Total: ${totalAmount.toFixed(2)}</h3> {/* Display total amount */}
            </div>

            {/* Delivery option section */}
            <div className="delivery-option">
              <h3>Select Delivery Option</h3>
              <label>
                <input
                  type="radio"
                  value="store-pickup"
                  checked={deliveryOption === 'store-pickup'}
                  onChange={handleDeliveryOptionChange}
                />
                In-store Pickup
              </label>
              <label>
                <input
                  type="radio"
                  value="home-delivery"
                  checked={deliveryOption === 'home-delivery'}
                  onChange={handleDeliveryOptionChange}
                />
                Home Delivery
              </label>
            </div>

            {/* Checkout button */}
            <button className="checkout-button" onClick={() => {
              navigate('/checkout'); // Redirect to checkout page
            }}>
              Checkout
            </button>
          </div>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </main>
    </div>
  );
}

export default CartPage;
