import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './CustomerSignupPage'; // Ensure correct CSS file import

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:3030/${isLogin ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password to the server
      });

      const data = await response.json(); // Parse the response from the server

      if (response.ok) {
        if (isLogin) {
          // Successful login
          console.log('Customer logged in:', data);
          localStorage.setItem('loggedInCustomer', JSON.stringify(data)); // Store logged-in user data in local storage
          navigate('/CustomerLandingPage'); // Redirect to the Customer Landing Page
        } else {
          // Successful signup
          console.log('New customer signed up:', data);
          navigate('/CustomerLandingPage'); // Redirect to Customer Landing Page after signup
        }
      } else {
        // Handle errors returned by the server
        if (data.error === 'Incorrect password') {
          setError('Incorrect password. Please try again.');
        } else if (data.error === 'Email not found') {
          setError('Email not found. Redirecting to signup...');
          setTimeout(() => navigate('/customer/signup'), 2000); // Redirect to signup after 2 seconds
        } else if (data.error === 'Email already exists') {
          setError('Email already exists. Please login.');
        } else {
          setError(data.error || 'An error occurred. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleToggle = () => {
    // Toggle between login and signup mode
    setIsLogin(!isLogin);
    setError(''); // Clear errors when toggling
  };

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-box">
          <section id="content">
            <h2>{isLogin ? 'Customer Login' : 'Customer Sign Up'}</h2>
            <form onSubmit={handleSubmit}>
              {error && <p className="error-message">{error}</p>} {/* Show error message */}
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
              <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <p>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={handleToggle}>
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
