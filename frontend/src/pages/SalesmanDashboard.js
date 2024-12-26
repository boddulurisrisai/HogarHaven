import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import Header from '../components/SalesmanHeader'; // Assuming you have a Header component

function SalesmanDashboard() {
  const [customers, setCustomers] = useState([]);
  const [formFields, setFormFields] = useState({
    customerName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load customers from localStorage when the component mounts
  useEffect(() => {
    const savedCustomers = JSON.parse(localStorage.getItem('customers')) || [];
    setCustomers(savedCustomers);
  }, []);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  // Function to validate and add a customer
  const addCustomer = () => {
    const { customerName, username, password, confirmPassword, email, address } = formFields;

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setSuccess('');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format!');
      setSuccess('');
      return;
    }

    if (username.length < 5 || password.length < 6) {
      setError('Username must be at least 5 characters and password at least 6 characters long!');
      setSuccess('');
      return;
    }

    if (customerName.trim() && username.trim() && email.trim() && address.trim()) {
      const newCustomer = {
        id: Date.now(),
        customerName,
        username,
        password,
        email,
        address,
      };

      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);

      // Save updated customers to localStorage
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));

      // Clear form fields
      setFormFields({
        customerName: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        address: '',
      });
      setError('');
      setSuccess('Customer added successfully!');
    } else {
      setError('All fields are required!');
      setSuccess('');
    }
  };

  // Function to delete a customer
  const deleteCustomer = (customerId) => {
    const updatedCustomers = customers.filter((customer) => customer.id !== customerId);
    setCustomers(updatedCustomers);

    // Save updated customers to localStorage
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
  };

  return (
    <>
      <Header />
      <div className="dashboard">
        <h2>Salesman Dashboard</h2>

        {/* Navigation to OrdersPage */}
        <Link to="/salesman/orders">Manage Orders</Link>

        {/* Customer Management Section */}
        <div className="customer-management">
          <h3>Create Customer Account</h3>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <input
            type="text"
            placeholder="Customer Name"
            name="customerName"
            value={formFields.customerName}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={formFields.username}
            onChange={handleInputChange}
          />
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={formFields.email}
            onChange={handleInputChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formFields.password}
            onChange={handleInputChange}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formFields.confirmPassword}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Address"
            name="address"
            value={formFields.address}
            onChange={handleInputChange}
          />
          <button onClick={addCustomer}>Add Customer</button>

          {/* Display list of customers */}
          <ul>
            {customers.map((customer) => (
              <CustomerItem
                key={customer.id}
                customer={customer}
                deleteCustomer={deleteCustomer}
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

// Modularized Customer Item component
function CustomerItem({ customer, deleteCustomer }) {
  return (
    <li>
      {customer.customerName} - {customer.username} - {customer.email} - {customer.address}
      <button onClick={() => deleteCustomer(customer.id)}>Delete</button>
    </li>
  );
}

export default SalesmanDashboard;
