import React from 'react';
import './App.css';
import Header from './components/Header'; // Corrected import path

function App() {
  return (
    <div id="container">
      {/* Use the imported Header component here */}
      <Header />

      <div id="body">
        <aside className="sidebar">
          <h3>Categories</h3>
          <ul>
            <li><a href="/">Smart Doorbells</a></li>
            <li><a href="/">Smart Doorlocks</a></li>
            <li><a href="/">Smart Speakers</a></li>
            <li><a href="/">Smart Lighting</a></li>
            <li><a href="/">Smart Thermostats</a></li>
          </ul>
        </aside>

        <main className="product-highlights">
          <h1>Welcome to SmartHomes</h1>
          <p>Your one-stop shop for smart home devices.</p>

          <div className="product-grid">
            <div className="product-item">
              <h2>Smart Doorbell</h2>
              <img src="./images/doorbell/smart-doorbell.jpg" alt="Smart Doorbell" />
              <p>Keep an eye on your front door with our advanced smart doorbells.</p>
            </div>

            <div className="product-item">
              <h2>Smart Doorlock</h2>
              <img src="./images/doorlock/smart-doorlock.jpg" alt="Smart Doorlock" />
              <p>Secure your home with our state-of-the-art smart doorlocks.</p>
            </div>

            <div className="product-item">
              <h2>Smart Speaker</h2>
              <img src="./images/speaker/smart-speaker.jpg" alt="Smart Speaker" />
              <p>Control your home with voice-activated smart speakers.</p>
            </div>

            <div className="product-item">
              <h2>Smart Lighting</h2>
              <img src="./images/lighting/smart-lighting.jpg" alt="Smart Lighting" />
              <p>Automate your lighting with our energy-efficient smart lighting solutions.</p>
            </div>

            <div className="product-item">
              <h2>Smart Thermostat</h2>
              <img src="./images/thermostat/smart-thermostat.jpg" alt="Smart Thermostat" />
              <p>Maintain the perfect temperature with smart thermostats.</p>
            </div>
          </div>
        </main>
      </div>

      <footer>
        <div className="footer-content">
          <p>&copy; 2024 SmartHomes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
