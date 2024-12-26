import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/LoginHeader';

const TicketStatus = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [error, setError] = useState('');

  // Fetch the ticket status and order details
  const fetchTicketStatus = async () => {
    try {
      // Reset state before a new fetch
      setError('');
      setTicketData(null);
      setOrderDetails([]);

      const response = await axios.get(`http://localhost:3030/api/tickets/status/${ticketNumber}`);
      
      if (response.data) {
        setTicketData(response.data);
        setOrderDetails(response.data.orderDetails); // Set order details
      } else {
        setError('Ticket not found or no details available.');
      }
    } catch (err) {
      setError('Failed to fetch ticket status.');
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Check Ticket Status</h2>
        <input
          type="text"
          placeholder="Enter Ticket Number"
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button onClick={fetchTicketStatus} style={{ padding: '10px 20px' }}>
          Check Status
        </button>

        {ticketData && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Ticket Details:</h3>
            <p><strong>Ticket Number:</strong> {ticketData.ticketNumber}</p>
            <p><strong>Description:</strong> {ticketData.description}</p>
            <p><strong>Decision:</strong> {ticketData.decision}</p>
            <p><strong>Created At:</strong> {new Date(ticketData.createdAt).toLocaleString()}</p>
            {ticketData.image && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={ticketData.image}
                  alt="Ticket"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
            )}

            <h3>Order Details:</h3>
            {orderDetails.length > 0 ? (
              orderDetails.map((order, index) => (
                <div key={index} style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc' }}>
                  <p><strong>Order ID:</strong> {order.order_id}</p>
                  <p><strong>Product Name:</strong> {order.name}</p>
                  <p><strong>Order Status:</strong> {order.order_status}</p>
                  {order.imageUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <img
                        src={`${order.imageUrl}`}
                        alt={order.name}
                        style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No order details available.</p>
            )}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '20px', color: 'red' }}>
            <p>{error}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketStatus;
