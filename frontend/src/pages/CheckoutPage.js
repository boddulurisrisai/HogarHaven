// src/pages/CheckoutPage.js

import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/LoginHeader';

function CheckoutPage() {
  const { cart, clearCart } = useCart(); // Access cart and clearCart from useCart hook
  const [selectedWarranty, setSelectedWarranty] = useState({});
  const [orderTotals, setOrderTotals] = useState({
    totalAmount: 0,
    shippingCost: 5, // Example shipping cost
    tax: 0,
    totalWithShippingAndTax: 0,
    discountsApplied: 0,
  });
  const [specialDiscounts] = useState(0.1); // 10% special discount
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // New email state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [creditCard, setCreditCard] = useState(''); // Credit card state
  const [deliveryType, setDeliveryType] = useState('store'); // Default to store pickup
  const [selectedStore, setSelectedStore] = useState(''); // State for selected store
  const [storeLocations, setStoreLocations] = useState([]); // New state for store locations
  const [error, setError] = useState(''); // State to handle errors during API fetch
  const navigate = useNavigate();

  // Warranty cost set to $25
  const warrantyCost = 25;

  // Handle warranty selection
  const handleWarrantyChange = (itemName, isChecked) => {
    setSelectedWarranty(prevState => ({
      ...prevState,
      [itemName]: isChecked
    }));
  };

  // Calculate order totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalWarrantyCost = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      // Apply retailer discount
      const discount = item.retailerDiscount ? itemTotal * item.retailerDiscount : 0;
      totalDiscount += discount;

      // Add warranty cost if selected
      if (selectedWarranty[item.name]) {
        totalWarrantyCost += warrantyCost; // Use fixed warranty cost
      }
    });

    // Apply special discount (e.g., 10% off)
    const discountAmount = subtotal * specialDiscounts;
    const totalDiscountsApplied = totalDiscount + discountAmount;

    // Calculate tax and total amount with shipping
    const tax = subtotal * 0.07; // 7% tax
    const totalWithShippingAndTax = subtotal + orderTotals.shippingCost + tax - totalDiscountsApplied + totalWarrantyCost;

    setOrderTotals({
      totalAmount: subtotal,
      shippingCost: orderTotals.shippingCost,
      tax: tax,
      totalWithShippingAndTax: totalWithShippingAndTax,
      discountsApplied: totalDiscountsApplied,
    });
  };

  // Update totals when the cart or warranty selection changes
  useEffect(() => {
    calculateTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, selectedWarranty]);

  // Fetch store locations from the database
  useEffect(() => {
    const fetchStoreLocations = async () => {
      try {
        const response = await fetch('http://localhost:3030/api/stores'); // Adjust this endpoint as necessary
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched store locations:', data); // Debugging info
        setStoreLocations(data);
      } catch (error) {
        console.error('Error fetching store locations:', error);
        setError('Failed to load store locations.'); // Set error state
      }
    };

    fetchStoreLocations();
  }, []);

  // Format date for MySQL
  const formatDateForMySQL = (date) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // Generate confirmation number
  const generateConfirmationNumber = () => {
    return 'CONF-' + Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit number
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (deliveryType === 'store' && !selectedStore) {
      setError('Please select a store for pickup.');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const orderDate = new Date();
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 12); // 12 days later

    const confirmationNumber = generateConfirmationNumber();

    try {
      // Prepare customer and order data
      const order = {
        name,
        email,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        creditCard,
        deliveryType,
        deliveryAddress: deliveryType === 'home' ? address : null,
        storeLocation: deliveryType === 'store' ? selectedStore : null,
        cartItems: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          warrantySelected: selectedWarranty[item.name] || false,
          retailer_discount: item.retailerDiscount || 0,
          rebate: item.rebate || 0,
          imageUrl: item.imageUrl || null
        })),
        discountsApplied: orderTotals.discountsApplied,
        shippingCost: orderTotals.shippingCost,
        tax: orderTotals.tax,
        totalWithShippingAndTax: orderTotals.totalWithShippingAndTax,
        warrantyCost: Object.values(selectedWarranty).filter(Boolean).length * warrantyCost
      };

      // Send checkout data to the backend
      const response = await fetch('http://localhost:3030/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order.');
      }

      // Store order data in local storage (optional)
      localStorage.setItem('orderData', JSON.stringify(result));

      // Clear cart and navigate to orders page
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <div className="checkout-page">
        <h2>Checkout</h2>
        <div className="checkout-container">
          <div className="order-summary">
            <h3>Order Summary</h3>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Display cart items */}
                <h3>Items in Cart</h3>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <p><strong>{item.name}</strong></p>

                    <p>Price: ${Number(item.price).toFixed(2)}</p>
                    <p>Quantity: {item.quantity}</p>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedWarranty[item.name] || false}
                          onChange={(e) => handleWarrantyChange(item.name, e.target.checked)}
                        />
                        Add Warranty (${warrantyCost})
                      </label>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <h3>Order Summary</h3>
                <p>Subtotal: ${orderTotals.totalAmount.toFixed(2)}</p>
                <p>Discounts Applied: -${orderTotals.discountsApplied.toFixed(2)}</p>
                <p>Shipping: ${orderTotals.shippingCost.toFixed(2)}</p>
                <p>Tax: ${orderTotals.tax.toFixed(2)}</p>
                <p><strong>Total: ${orderTotals.totalWithShippingAndTax.toFixed(2)}</strong></p>

                {/* Customer Information Form */}
                <h3>Customer Information</h3>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City:</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State:</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Zip Code:</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number:</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                {/* Delivery Type Selection */}
                <div className="form-group">
                  <label>Delivery Type:</label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value)}
                  >
                    <option value="store">Store Pickup</option>
                    <option value="home">Home Delivery</option>
                  </select>
                </div>

                {/* Store Selection for Store Pickup */}
                {deliveryType === 'store' && (
                  <div className="form-group">
                    <label>Select Store:</label>
                    <select
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      required
                    >
                      <option value="">Select a store</option>
                      {storeLocations.map(store => (
                        <option key={store.id} value={store.name}>
                          {store.name} - {store.address}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Credit Card Information */}
                <h3>Payment Information</h3>
                <div className="form-group">
                  <label>Credit Card Number:</label>
                  <input
                    type="text"
                    value={creditCard}
                    onChange={(e) => setCreditCard(e.target.value)}
                    required
                  />
                </div>

                <button type="submit">Place Order</button>
              </form>
            )}
          </div>

          {error && <p className="error">{error}</p>} {/* Display error message if any */}
        </div>
      </div>
    </>
  );
}

export default CheckoutPage;
