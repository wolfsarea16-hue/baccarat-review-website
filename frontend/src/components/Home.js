// frontend/src/components/Home.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Sidebar from './Sidebar';
import GlassSurfaceOptimized from './GlassSurfaceOptimized';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isHowModalOpen, setIsHowModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const videoRef = useRef(null);

  // Sync video playback with sidebar state (mobile optimization)
  useEffect(() => {
    if (!videoRef.current) return;

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      if (isSidebarOpen) {
        videoRef.current.pause();
      } else {
        // Only resume if it was playing/supposed to play
        videoRef.current.play().catch(err => console.log("Video play interrupted:", err));
      }
    }
  }, [isSidebarOpen]);

  const openHowModal = () => {
    setIsHowModalOpen(true);
    setIsZoomed(false); // Reset zoom when opening
  };
  const closeHowModal = () => {
    setIsHowModalOpen(false);
    setIsZoomed(false);
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  // Prevent right-click on image
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

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
      <Sidebar onToggle={(isOpen) => setIsSidebarOpen(isOpen)} />

      {/* MAIN CONTENT */}
      <div className="main-content home-content-wrapper">

        {/* 🎥 BACKGROUND VIDEO */}
        <video
          ref={videoRef}
          className="home-bg-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="/bcc.webm" type="video/webm" />
          <source src="/bcc.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

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
            <button className="bell-icon-btn" onClick={openHowModal} title="How it works">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="bell-icon"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
          </div>

          <div className="home-content">
            <GlassSurfaceOptimized
              width="100%"
              height="auto"
              borderRadius={15}
              brightness={45}
              opacity={0.85}
              blur={10}
              saturation={1.2}
              className="menu-card-glass"
            >
              <div
                className="menu-card-content"
                onClick={() => navigate('/review')}
              >
                <h2>Start Auditing</h2>
                <p>Audit products for commission</p>
              </div>
            </GlassSurfaceOptimized>

            <GlassSurfaceOptimized
              width="100%"
              height="auto"
              borderRadius={15}
              brightness={45}
              opacity={0.85}
              blur={10}
              saturation={1.2}
              className="menu-card-glass"
            >
              <div
                className="menu-card-content"
                onClick={() => navigate('/history')}
              >
                <h2>Audit History</h2>
                <p>View all your completed and pending audits</p>
              </div>
            </GlassSurfaceOptimized>

            {user && (
              <GlassSurfaceOptimized
                width="100%"
                height="auto"
                borderRadius={15}
                brightness={45}
                opacity={0.85}
                blur={10}
                saturation={1.2}
                className="menu-card-glass"
              >
                <div className="menu-card-content info-card">
                  <h3>Account Balance</h3>
                  <p className="balance">
                    ${user.accountBalance ? user.accountBalance.toFixed(2) : '0.00'}
                  </p>
                </div>
              </GlassSurfaceOptimized>
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

          {/* How-To Modal */}
          {isHowModalOpen && (
            <div className="how-modal" onClick={closeHowModal}>
              <div className="how-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="how-modal-close" onClick={closeHowModal}>✕</button>
                <img
                  src="/how.png"
                  alt="How it works"
                  className={`how-modal-image ${isZoomed ? 'zoomed' : ''}`}
                  onClick={toggleZoom}
                  onContextMenu={handleContextMenu}
                  draggable="false"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Home;