import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import { FaShoppingCart, FaUserCircle, FaSearch } from 'react-icons/fa'; // Import FaSearch
import '../pages/StoreManagerLoginPage';
import '../pages/OrdersPage';
import '../pages/InventoryPage';
import '../pages/SalesReport';

function StoreManagerHeader() {
  const { cart } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  const navigate = useNavigate();
  const { orders } = useCart();
  const location = useLocation();

  const cartItemCount = cart.length;

  // Sample list of keywords (you can fetch this from an API in a real app)
  const keywords = [
    'Ring Video Doorbell',
    'Nest Hello',
    'Eufy Security Video Doorbell',
    'Arlo Video Doorbell',
    'RemoBell S',
    'August Smart Lock',
    'Schlage Encode',
    'Yale Assure Lock',
    'Level Lock',
    'UltraloqU Bolt',
    'Philips Hue White and Color Ambiance',
    'LIFX Smart Bulb',
    'Sengled Smart Bulb',
    'TP-Link Kasa',
    'Wyze Bulb',
    'Nest Learning Thermostat',
    'Ecobee SmartThermostat with Voice Control',
    'Honeywell Home T9 Smart Thermostat',
    'Lux Kono',
    'Emerson Sensi Touch Wi-Fi Thermostat',
    'Amazon Echo Dot (4th Gen)',
    'Google Nest Audio',
    'Apple HomePod Mini',
    'Sonos One',
    'Bose Home Speaker 500',
    'Remotebell',
    'Apple Speaker i24',
    'Smart Doorbell',
    'Smart Doorlock',
    'Smart Thermostat',
    'Smart Speaker',
    'Smart Lighting'
  ];

  const keywordMapping = {
    doorbells: [
      'Ring Video Doorbell',
      'Nest Hello',
      'Eufy Security Video Doorbell',
      'Arlo Video Doorbell',
      'RemoBell S',
      'Smart Doorbell',
    ],
    doorlocks: [
      'August Smart Lock',
      'Schlage Encode',
      'Yale Assure Lock',
      'Level Lock',
      'UltraloqU Bolt',
      'Smart Doorlock',
    ],
    lighting: [
      'Philips Hue White and Color Ambiance',
      'LIFX Smart Bulb',
      'Sengled Smart Bulb',
      'TP-Link Kasa',
      'Wyze Bulb',
      'Smart Lighting',
    ],
    thermostats: [
      'Nest Learning Thermostat',
      'Ecobee SmartThermostat with Voice Control',
      'Honeywell Home T9 Smart Thermostat',
      'Lux Kono',
      'Emerson Sensi Touch Wi-Fi Thermostat',
      'Smart Thermostat',
    ],
    speakers: [
      'Amazon Echo Dot (4th Gen)',
      'Google Nest Audio',
      'Apple HomePod Mini',
      'Sonos One',
      'Bose Home Speaker 500',
      'Smart Speaker',
    ],
  };


  // Toggle dropdown on click
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  // Hide dropdown when navigating to orders
  const handleNavigateToOrders = () => {
    setShowDropdown(false);
    navigate('/orders', { state: { orders } });
  };

  // Handle logout and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Adjust this based on your auth mechanism
    navigate('/storemanager/login');
  };

  // Filter keywords based on search input
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

  // Clear search results when user clicks on a keyword
  const handleKeywordClick = (keyword) => {
    setSearchTerm(keyword);
    setFilteredKeywords([]);
  };

  // Check if the current path matches the given path
  const isActive = (path) => location.pathname === path;

  // Handle search submission
  const handleSearchSubmit = () => {
    const matchedKey = Object.entries(keywordMapping).find(([key, keywords]) =>
      keywords.includes(searchTerm)
    );

    if (matchedKey) {
      const categoryPath = matchedKey[0]; // Get the category key (doorbell, doorlock, etc.)
      navigate(`/products/${categoryPath}`);
    } else {
      // Optionally handle the case when no match is found
      console.log('No match found for:', searchTerm);
    }
    setSearchTerm(''); // Clear the search term after submission
    setFilteredKeywords([]); // Clear the filtered results after submission
  };

  return (
    <header className="header">
      <div className="logo-container">
        <h1 className="logo">Smart Homes</h1>
      </div>

      <nav className="header-content">
        <ul className="nav-menu">
          <li className={isActive('/') ? 'active' : ''}>
            <Link to="/store-manager/dashboard">Home</Link>
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
          <li className={isActive('/inventory') ? 'active' : ''}>
            <Link to="/inventory">Inventory Report</Link>
          </li>
          <li className={isActive('/sales') ? 'active' : ''}>
            <Link to="/sales">Sales Report</Link>
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
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default StoreManagerHeader;
