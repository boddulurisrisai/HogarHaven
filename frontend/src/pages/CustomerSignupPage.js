import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function CustomerSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [signupError, setSignupError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Reset error messages
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');
    setSignupError('');

    // Validate input
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setTermsError('You must accept the terms and agreements');
      return;
    }

    try {
      // Send signup data to backend API
      const response = await fetch('http://localhost:3030/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('New customer signed up:', data);
        navigate('/CustomerLandingPage'); // Redirect to customer landing page after successful signup
      } else {
        setSignupError(data.error || 'Failed to sign up');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setSignupError('An error occurred during signup');
    }
  };

  return (
    <>
      <Header />
      <div className="signup-page">
        <div className="signup-box">
          <section id="content">
            <h2> Customer SignUp</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {emailError && <p className="error">{emailError}</p>}
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
                {passwordError && <p className="error">{passwordError}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password:</label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPasswordError && <p className="error">{confirmPasswordError}</p>}
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                  />
                  I accept the <a href="#terms">terms and agreements</a>
                </label>
                {termsError && <p className="error">{termsError}</p>}
              </div>
              {signupError && <p className="error">{signupError}</p>}
              <button type="submit">Sign Up</button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}

export default CustomerSignupPage;
