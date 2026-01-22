// frontend/src/components/Home.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Sidebar from './Sidebar';
import GlassSurface from './GlassSurface';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* REMOVED fetchProfile definition from here */

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
            <h1 style={{
              color: 'white',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              zIndex: 10
            }}>
              Welcome, {user.username}!
            </h1>
          </div>

          <div className="home-content">
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={15}
              brightness={45}
              opacity={0.85}
              blur={10}
              displace={0.5}
              saturation={1.2}
              className="menu-card-glass"
            >
              <div
                className="menu-card-content"
                onClick={() => navigate('/review')}
              >
                <h2>Start Reviewing</h2>
                <p>Review products and earn commissions</p>
              </div>
            </GlassSurface>

            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={15}
              brightness={45}
              opacity={0.85}
              blur={10}
              displace={0.5}
              saturation={1.2}
              className="menu-card-glass"
            >
              <div
                className="menu-card-content"
                onClick={() => navigate('/history')}
              >
                <h2>Review History</h2>
                <p>View all your completed and pending reviews</p>
              </div>
            </GlassSurface>

            {user && (
              <GlassSurface
                width="100%"
                height="auto"
                borderRadius={15}
                brightness={45}
                opacity={0.85}
                blur={10}
                displace={0.5}
                saturation={1.2}
                className="menu-card-glass"
              >
                <div className="menu-card-content info-card">
                  <h3>Account Balance</h3>
                  <p className="balance">
                    ${user.accountBalance ? user.accountBalance.toFixed(2) : '0.00'}
                  </p>
                </div>
              </GlassSurface>
            )}
          </div>

          {/* Footer */}
          <div className="home-footer">
            <p className="copyright">Copyright ©2026 Baccarat. All rights reserved</p>
            <div className="footer-links">
              <button onClick={() => navigate('/home')}>Home</button>
              <button onClick={() => navigate('/about')}>About Us</button>
              <button onClick={() => navigate('/terms')}>T&C</button>
              <button onClick={() => navigate('/faq')}>FAQ</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;