import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/LoginHeader'; // Assuming you have a Header component

const AccountInformationPage = () => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    password: '', // Password should be hidden
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user information from localStorage or an API
    const fetchUserInfo = () => {
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo')) || {
        username: 'JohnDoe',
        email: '****************',
        password: '********', // Normally you wouldn't store passwords in plain text
      };
      setUserInfo(storedUserInfo);
    };

    fetchUserInfo();
  }, []);

  return (
    <div>
      <Header />
      <div className="account-info-container">
        <h2>Account Information</h2>
        <div className="account-info">
          <div className="profile-icon">
            <img
              src="/images/profile-icon.png" // Replace with your actual icon path
              alt="Profile Icon"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          </div>
          <div className="info">
            <p><strong>Username:</strong> {userInfo.username}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Password:</strong> {'*'.repeat(userInfo.password.length)}</p>
            <p><strong>Additional Information:</strong></p>
            <ul>
              <li>Account created on: {new Date().toLocaleDateString()}</li>
              <li>Account status: Active</li>
              <li>Subscription Plan: Basic</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInformationPage;
