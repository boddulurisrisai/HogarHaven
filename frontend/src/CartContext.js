import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({});

  // Hardcoded 10 store locations for in-store pickup
  const storeLocations = [
    { id: 1, name: 'SmartHomes Store - Downtown', zipCode: '12345' },
    { id: 2, name: 'SmartHomes Store - Westside', zipCode: '23456' },
    { id: 3, name: 'SmartHomes Store - Uptown', zipCode: '34567' },
    { id: 4, name: 'SmartHomes Store - Eastside', zipCode: '45678' },
    { id: 5, name: 'SmartHomes Store - Northpoint', zipCode: '56789' },
    { id: 6, name: 'SmartHomes Store - Riverdale', zipCode: '67890' },
    { id: 7, name: 'SmartHomes Store - Hilltop', zipCode: '78901' },
    { id: 8, name: 'SmartHomes Store - Valley', zipCode: '89012' },
    { id: 9, name: 'SmartHomes Store - Lakeside', zipCode: '90123' },
    { id: 10, name: 'SmartHomes Store - Bayshore', zipCode: '01234' },
  ];

  // Function to add an item to the cart
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
    } else {
      setCart(prevCart => [...prevCart, { ...product, quantity }]);
    }
  };

  // Function to remove an item from the cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Function to update item quantity in the cart
  const updateItemQuantity = (productId, quantity) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(quantity, 1) } : item
      )
    );
  };

  // Function to clear the cart
  const clearCart = () => {
    setCart([]);
  };

  // Function to handle checkout
  const checkout = (customerData) => {
    const order = {
      id: new Date().getTime(), // Unique order ID
      items: cart,
      ...customerData, // Include customer info like name, address, delivery type, etc.
      confirmationNumber: Math.floor(Math.random() * 1000000), // Random confirmation number
      deliveryDate: new Date(new Date().setDate(new Date().getDate() + 14)), // 2 weeks later
    };

    // Add the new order to the orders list
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    storedOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(storedOrders));

    // Clear cart after successful checkout
    clearCart();
  };

  // Function to cancel an order
  const cancelOrder = (orderId) => {
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const updatedOrders = storedOrders.filter(order => order.id !== orderId);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  return (
    <CartContext.Provider value={{
      cart,
      orders,
      customerInfo,
      storeLocations,
      addToCart,
      removeFromCart,
      updateItemQuantity,
      clearCart,
      checkout,
      cancelOrder,
      setCustomerInfo,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
