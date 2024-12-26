import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const correctCredentials = {
  email: 'higherauthority@gmail.com',
  password: 'manager123'
};

function StoreManagerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (email === correctCredentials.email && password === correctCredentials.password) {
      navigate('/store-manager/dashboard'); // Redirect to the store manager dashboard
    } else {
      alert('Your credentials are wrong. Please try again.'); // Show popup message
    }
  };

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-box">
          <section id="content">
            <h2>Store Manager Login</h2>
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
          </section>
        </div>
      </div>
    </>
  );
}

export default StoreManagerLoginPage;
