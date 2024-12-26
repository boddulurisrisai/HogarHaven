import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { FaShoppingCart, FaUserCircle, FaSearch } from 'react-icons/fa';
import '../pages/OrdersPage';

function LoginHeader() {
  const { cart } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomerServiceBox, setShowCustomerServiceBox] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  const [ticketDescription, setTicketDescription] = useState('');
  const navigate = useNavigate();

  const cartItemCount = cart.length;

  // Define the keywords (used in search functionality)
  const keywords = [
    'Ring Video Doorbell', 'Nest Hello', 'Eufy Security Video Doorbell',
    'August Smart Lock', 'Philips Hue White and Color Ambiance', 'Nest Learning Thermostat',
    'Amazon Echo Dot', 'Google Nest Audio'
  ];

  // Define the keyword mapping for the search functionality
  const keywordMapping = {
    doorbells: ['Ring Video Doorbell', 'Nest Hello', 'Eufy Security Video Doorbell'],
    doorlocks: ['August Smart Lock'],
    lighting: ['Philips Hue White and Color Ambiance'],
    thermostats: ['Nest Learning Thermostat'],
    speakers: ['Amazon Echo Dot', 'Google Nest Audio']
  };

  // Check if the current path matches the given path
  const isActive = (path) => window.location.pathname === path;

  // Toggle account dropdown
  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  // Toggle Customer Service box visibility
  const toggleCustomerServiceBox = () => setShowCustomerServiceBox((prev) => !prev);

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      const filtered = keywords.filter((keyword) =>
        keyword.toLowerCase().startsWith(term.toLowerCase())
      );
      setFilteredKeywords(filtered);
    } else {
      setFilteredKeywords([]);
    }
  };

  // Handle keyword click
  const handleKeywordClick = (keyword) => {
    setSearchTerm(keyword);
    setFilteredKeywords([]);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    const matchedKey = Object.entries(keywordMapping).find(([key, keywords]) =>
      keywords.includes(searchTerm)
    );

    if (matchedKey) {
      const categoryPath = matchedKey[0];
      navigate(`/products/${categoryPath}`);
    } else {
      console.log('No match found for:', searchTerm);
    }
    setSearchTerm('');
    setFilteredKeywords([]);
  };

  // Handle navigation to OrdersPage
  const handleNavigateToOrders = () => {
    setShowDropdown(false);
    navigate('/orders');
  };
  const handleRecommend = () => {
    setShowDropdown(false);
    navigate('/recommend-products');
  };
  const handleSearchReviews = () => {
    setShowDropdown(false);
    navigate('/search-reviews');
  };
  // Handle logout
  const handleLogout = () => navigate('/CustomerLogin');

  // Handle ticket form submission
  const handleTicketSubmit = (e) => {
    e.preventDefault();

    // Simulate generating a unique ticket number
    const generatedTicketNumber = `TICKET-${Math.floor(100000 + Math.random() * 900000)}`;

    // Reset form fields
    setTicketDescription('');
    setShowTicketForm(false);
    setShowCustomerServiceBox(false);

    alert(`Ticket submitted successfully! Your ticket number is: ${generatedTicketNumber}`);
  };

  return (
    <header className="header">
      <div className="logo-container">
        <h1 className="logo">Smart Homes</h1>
      </div>

      <nav className="header-content">
        <ul className="nav-menu">
          <li className={isActive('/CustomerLandingPage') ? 'active' : ''}>
            <Link to="/CustomerLandingPage">Home</Link>
          </li>
          <li className={isActive('/products/doorbells') ? 'active' : ''}>
            <Link to="/products/doorbells">Smart Doorbell</Link>
          </li>
          <li className={isActive('/products/doorlocks') ? 'active' : ''}>
            <Link to="/products/doorlocks">Smart Doorlock</Link>
          </li>
          <li className={isActive('/products/lighting') ? 'active' : ''}>
            <Link to="/products/lighting">Smart Lighting</Link>
          </li>
          <li className={isActive('/products/speakers') ? 'active' : ''}>
            <Link to="/products/speakers">Smart Speaker</Link>
          </li>
          <li className={isActive('/products/thermostats') ? 'active' : ''}>
            <Link to="/products/thermostats">Smart Thermostat</Link>
          </li>
          <li className={isActive('/trending') ? 'active' : ''}>
            <Link to="/trending">Trending</Link>
          </li>

          {/* Search Bar */}
          <li className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button onClick={handleSearchSubmit}>
              <FaSearch />
            </button>
            {filteredKeywords.length > 0 && (
              <ul className="search-results">
                {filteredKeywords.map((keyword, index) => (
                  <li key={index} onClick={() => handleKeywordClick(keyword)}>
                    {keyword}
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="cart-icon">
            <Link to="/cart">
              <FaShoppingCart />
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </Link>
          </li>

          {/* Customer Service Button */}
          <li className="customer-service-menu" onClick={toggleCustomerServiceBox}>
            <button className="nav-link">Customer Service</button>
            {showCustomerServiceBox && (
              <div className="customer-service-box">
                <div className="arrow-up"></div>
                <Link to="/open-ticket">
                   <button>Open a Ticket</button>
                </Link>
                <Link to="/ticket-status">
                  <button>Status of a Ticket</button>
      </Link>
              </div>
            )}
          </li>

          {/* Account Dropdown */}
          <li
            className="account-menu"
            onClick={toggleDropdown}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <span className="account-icon">
              <FaUserCircle />
            </span>
            {showDropdown && (
              <div className="dropdown-menu">
                <Link to="/account">Account Information</Link>
                <button onClick={handleNavigateToOrders}>Past Orders</button>
                <button onClick={handleRecommend}>Recommend Products</button>
                <button onClick={handleSearchReviews}>Search Reviews</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </li>
        </ul>
      </nav>

      {/* Ticket Form Modal */}
      {showTicketForm && (
        <div className="ticket-form-modal">
          <form onSubmit={handleTicketSubmit} className="ticket-form">
            <h2>Open a Ticket</h2>
            <textarea
              placeholder="Describe the issue with your shipment"
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              required
            />
            <input
              type="file"
              accept="image/*"
              required
            />
            <button type="submit">Submit Ticket</button>
          </form>
        </div>
      )}
    </header>
  );
}

export default LoginHeader;
