
// frontend/src/components/Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Sidebar from './Sidebar';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 401) {
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 1000);
      }
    }
  };

  return (
    <div className="page-with-sidebar home-page">
      {/* 🎥 BACKGROUND VIDEO - Now positioned absolutely relative to viewport */}
      <video
        className="home-bg-video"
        src="/bcc.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Overlay */}
      <div className="home-bg-overlay" />

      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="home-container">
          <div className="home-header">
            <h1>Welcome, {username}!</h1>
          </div>

          <div className="home-content">
            <div className="menu-card" onClick={() => navigate('/review')}>
              <h2>Start Reviewing</h2>
              <p>Review products and earn commissions</p>
            </div>

            <div className="menu-card" onClick={() => navigate('/history')}>
              <h2>Review History</h2>
              <p>View all your completed and pending reviews</p>
            </div>

            {user && (
              <div className="info-card">
                <h3>Account Balance</h3>
                <p className="balance">${user.accountBalance.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;