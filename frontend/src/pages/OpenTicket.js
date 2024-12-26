import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/LoginHeader';

function OpenTicket() {
  const [orderIds, setOrderIds] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [image, setImage] = useState(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [preview, setPreview] = useState('');

  // Fetch order IDs from the backend
  useEffect(() => {
    axios.get('http://localhost:3030/api/orderid')
      .then((response) => {
        if (response.data && response.data.orders) {
          setOrderIds(response.data.orders);
        } else {
          setOrderIds([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching order IDs:', error);
        setOrderIds([]);
      });
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrderId || !ticketDescription || !image) {
      alert('Please select an order ID, enter a description, and upload an image.');
      return;
    }

    const formData = new FormData();
    formData.append('orderId', selectedOrderId);
    formData.append('description', ticketDescription);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:3030/api/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setTicketNumber(response.data.ticketNumber);
      alert('Ticket submitted successfully!');

      setSelectedOrderId('');
      setTicketDescription('');
      setImage(null);
    } catch (error) {
      console.error('Error submitting ticket:', error);
    }
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <Header />
      <div className="ticket-box">
        <h2>Open a Ticket</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="orderId">Select Order ID:</label>
          <select
            id="orderId"
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            required
          >
            <option value="">-- Select an Order ID --</option>
            {orderIds.length > 0 ? (
              orderIds.map((orderId) => (
                <option key={orderId} value={orderId}>
                  {orderId}
                </option>
              ))
            ) : (
              <option value="" disabled>No Order IDs Available</option>
            )}
          </select>

          <label htmlFor="ticketDescription">Describe the Issue:</label>
          <textarea
            id="ticketDescription"
            placeholder="Describe the issue with your shipment box/product"
            value={ticketDescription}
            onChange={(e) => setTicketDescription(e.target.value)}
            required
          />

          <label htmlFor="image">Upload an Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
{preview && <img src={preview} alt="Preview" style={{ width: '100px', height: '100px' }} />}

          <button type="submit">Submit Ticket</button>
        </form>

        {ticketNumber && (
          <div className="ticket-number">
            <p>Your unique ticket number: <strong>{ticketNumber}</strong></p>
          </div>
        )}
      </div>
    </>
  );
}

export default OpenTicket;
