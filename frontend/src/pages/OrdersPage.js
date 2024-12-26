// src/OrdersPage.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/LoginHeader';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({}); // Store reviews for each order
  const navigate = useNavigate();


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:3030/api/orders'); // Adjust the URL if necessary
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  const handleCancelOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3030/api/orders/${orderId}`); // Adjust the URL if necessary
      setOrders(orders.filter(order => order.order_id !== orderId)); // Update the local state
    } catch (err) {
      setError('Failed to cancel the order. Please try again later.');
      console.error(err);
    }
  };
  const handleWriteReview = () => {
    navigate('/write-review' );
  };
  const handleReviewChange = (orderId, value) => {
    setReviews(prev => ({ ...prev, [orderId]: value })); // Update the review state
  };

  const handleSubmitReview = async (orderId) => {
    try {
      await axios.post(`http://localhost:3030/api/reviews`, {
        orderId,
        review: reviews[orderId],
      }); // Adjust the URL if necessary
      alert('Review submitted successfully!'); // Notify the user
    } catch (err) {
      setError('Failed to submit the review. Please try again later.');
      console.error(err);
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
    <Header />
    <div className="orders-page">
      <h1>Your Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => {
          const totalAmount = order.total_amount ? parseFloat(order.total_amount) : 0;

          return (
           
            <div key={order.order_id} className="order">
              <h2>Order Confirmation: {order.confirmation_number}</h2>
              <p>Status: {order.order_status}</p>
              <p>Total Amount: ${totalAmount.toFixed(2)}</p>
              <p>Order Date: {new Date(order.order_date).toLocaleString()}</p>
              <p>Delivery Date: {new Date(order.delivery_date).toLocaleString()}</p>
              <div className="order-items">
                <h3>Items:</h3>
                {order.items.map(item => {
                  const itemPrice = item.product_price ? parseFloat(item.product_price) : 0;

                  return (
                    <div key={item.item_id} className="order-item">
                      <img src={item.imageUrl} alt={item.name} className="item-image" />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>Price: ${itemPrice.toFixed(2)}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

                {/* Cancel Order Button */}
                <button onClick={() => handleCancelOrder(order.order_id)}>Cancel Order</button>

                {/* Review Section */}
                <button onClick={handleWriteReview}>Write a Review</button>

            </div>
          );
        })
      )}
    </div>
    </>
  );
};

export default OrdersPage;
