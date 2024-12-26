import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation(); // Get the current location

  // Function to toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  // Determine if the current path matches the link
  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" className="logo">
          <h1>Smart Homes</h1>
        </Link>
      </div>
      <div className="header-content">
        <nav>
          <ul className="nav-menu">
            <li className={isActive('/') ? 'active' : ''}>
              <Link to="/">Home</Link>
            </li>
            <li className={isActive('/products/doorbells') ? 'active' : ''}>
              <Link to="/">Smart Doorbell</Link>
            </li>
            <li className={isActive('/products/doorlocks') ? 'active' : ''}>
              <Link to="/">Smart Doorlock</Link>
            </li>
            <li className={isActive('/products/lighting') ? 'active' : ''}>
              <Link to="/">Smart Lighting</Link>
            </li>
            <li className={isActive('/products/speakers') ? 'active' : ''}>
              <Link to="/">Smart Speaker</Link>
            </li>
            <li className={isActive('/products/thermostats') ? 'active' : ''}>
              <Link to="/">Smart Thermostat</Link>
            </li>
            {/* Login Dropdown */}
            <li className="nav-item login-item" onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
              <button className="nav-link login-button">Login</button>
              {showDropdown && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/CustomerLogin">Customer</Link>
                  </li>
                  <li>
                    <Link to="/storemanager/login">Store Manager</Link>
                  </li>
                  <li>
                    <Link to="/salesman/login">Salesman</Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
