import React, { useState, useEffect } from 'react';
import Header from '../components/SalesmanHeader';

function SalesmanOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [editOrderId, setEditOrderId] = useState(null);
  const [orderUpdates, setOrderUpdates] = useState({});
  const [editedCartItems, setEditedCartItems] = useState([]);

  // Load orders from localStorage when the component mounts
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(savedOrders);
  }, []);

  useEffect(() => {
    if (editOrderId) {
      const orderToEdit = orders.find(order => order.confirmationNumber === editOrderId);
      if (orderToEdit) {
        setOrderUpdates({
          status: orderToEdit.status || '',
          deliveryDate: orderToEdit.deliveryDate || '',
          totalCost: orderToEdit.totalCost || '',
        });
        setEditedCartItems(orderToEdit.cart || []);
      }
    }
  }, [editOrderId, orders]);

  // Calculate total cost based on cart items
  const calculateTotalCost = () => {
    const total = editedCartItems.reduce((acc, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      return acc + itemTotal;
    }, 0);
    return total;
  };

  // Update total cost whenever cart items change
  useEffect(() => {
    setOrderUpdates(prevUpdates => ({
      ...prevUpdates,
      totalCost: calculateTotalCost()
    }));
  }, [editedCartItems]);

  // Handle input changes for order updates
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderUpdates({ ...orderUpdates, [name]: value });
  };

  // Handle cart item changes
  const handleCartItemChange = (index, field, value) => {
    const updatedItems = [...editedCartItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEditedCartItems(updatedItems);
  };

  // Function to delete an order
  const deleteOrder = (orderId) => {
    const updatedOrders = orders.filter((order) => order.confirmationNumber !== orderId);
    setOrders(updatedOrders);

    // Save updated orders to localStorage
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  // Function to save an edited order
  const saveOrder = (orderId) => {
    const updatedOrders = orders.map((order) =>
      order.confirmationNumber === orderId
        ? { ...order, ...orderUpdates, cart: editedCartItems }
        : order
    );
    setOrders(updatedOrders);
    setEditOrderId(null);

    // Save updated orders to localStorage
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  return (
    <>
      <Header />
      <div className="orders-page">
        <h2>Orders Management</h2>

        {/* Display list of orders */}
        <ul>
          {orders.map((order) => (
            <li key={order.confirmationNumber} style={{ marginBottom: '20px' }}>
              {editOrderId === order.confirmationNumber ? (
                <div>
                  <input
                    type="text"
                    name="status"
                    placeholder="Status"
                    value={orderUpdates.status}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="deliveryDate"
                    placeholder="Delivery Date"
                    value={orderUpdates.deliveryDate}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="totalCost"
                    placeholder="Total Cost"
                    value={orderUpdates.totalCost}
                    readOnly
                  />
                  <div>
                    <strong>Items:</strong>
                    <ul>
                      {editedCartItems.map((item, index) => (
                        <li key={index}>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleCartItemChange(index, 'name', e.target.value)}
                            placeholder="Item Name"
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleCartItemChange(index, 'quantity', e.target.value)}
                            placeholder="Quantity"
                          />
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleCartItemChange(index, 'price', e.target.value)}
                            placeholder="Price"
                          />
                          <img src={item.image || 'placeholder-image.jpg'} alt={item.name} style={{ width: '100px' }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => saveOrder(order.confirmationNumber)}>Save</button>
                  <button onClick={() => setEditOrderId(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <div><strong>Order ID:</strong> {order.confirmationNumber}</div>
                  <div><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</div>
                  <div><strong>Delivery Date:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</div>
                  <div><strong>Status:</strong> {order.status || 'N/A'}</div>
                  <div><strong>Total Cost:</strong> ${Number(order.totalCost).toFixed(2) || '0.00'}</div>
                  <div>
                    <strong>Items:</strong>
                    <ul>
                      {order.cart && order.cart.length > 0 ? (
                        order.cart.map((item, index) => (
                          <li key={index}>
                            <img src={item.image || 'placeholder-image.jpg'} alt={item.name} style={{ width: '100px' }} />
                            <div>{item.name} - Quantity: {item.quantity}</div>
                          </li>
                        ))
                      ) : (
                        <li>No items</li>
                      )}
                    </ul>
                  </div>
                  <button onClick={() => setEditOrderId(order.confirmationNumber)}>Edit</button>
                  <button onClick={() => deleteOrder(order.confirmationNumber)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default SalesmanOrdersPage;
