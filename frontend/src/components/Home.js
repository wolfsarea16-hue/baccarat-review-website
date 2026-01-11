// frontend/src/components/Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Sidebar from './Sidebar';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      setLoading(false);
      
      if (err.response?.status === 401) {
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 1000);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-with-sidebar home-page">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="page-with-sidebar home-page">
        <Sidebar />
        <div className="main-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sidebar home-page">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="main-content home-content-wrapper">

        {/* 🎥 BACKGROUND VIDEO */}
        <video
          className="home-bg-video"
          src="/bcc.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />

        {/* Overlay */}
        <div className="home-bg-overlay" />

        {/* CONTENT */}
        <div className="home-container">
          <div className="home-header">
            <h1>Welcome, {username}!</h1>
          </div>

          <div className="home-content">
            <div
              className="menu-card"
              onClick={() => navigate('/review')}
            >
              <h2>Start Reviewing</h2>
              <p>Review products and earn commissions</p>
            </div>

            <div
              className="menu-card"
              onClick={() => navigate('/history')}
            >
              <h2>Review History</h2>
              <p>View all your completed and pending reviews</p>
            </div>

            {user && (
              <div className="info-card menu-card">
                <h3>Account Balance</h3>
                <p className="balance">
                  ${user.accountBalance ? user.accountBalance.toFixed(2) : '0.00'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;