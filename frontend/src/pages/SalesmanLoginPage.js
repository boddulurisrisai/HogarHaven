import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import Header from '../components/Header'; // Assuming you have a Header component

const validCredentials = [
  { email: 'salesman1@gmail.com', password: 'password123' },
  { email: 'salesman2@example.com', password: 'password456' },
  // Add more valid credentials as needed
];

function SalesmanLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = (event) => {
    event.preventDefault();
    const isValid = validCredentials.some(
      cred => cred.email === email && cred.password === password
    );

    if (isValid) {
      console.log('Logged in successfully');
      navigate('/salesman/dashboard'); // Redirect to Salesman Dashboard
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-box">
          <div id="content">
            <h2>Salesman Login</h2>
            <form onSubmit={handleSubmit}>
              {error && <p className="error-message">{error}</p>}
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SalesmanLoginPage;
