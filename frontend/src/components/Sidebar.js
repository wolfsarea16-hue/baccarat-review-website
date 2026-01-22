// frontend/src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/baccarat-logo.svg';
import './Sidebar.css';

import { userAPI } from '../services/api';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    // Fetch user profile to get reputation points
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUserProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile for sidebar:', err);
      }
    };

    if (localStorage.getItem('token')) {
      fetchProfile();
    }
  }, [isOpen]); // Refetch when sidebar opens to ensure fresh data

  const menuItems = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/review', icon: '⭐', label: 'Reviews' },
    { path: '/history', icon: '📜', label: 'Review History' },
    { path: '/withdrawal', icon: '💰', label: 'Withdrawal' },
    { path: '/withdrawal-history', icon: '📋', label: 'Withdrawal History' },
    { path: '/certification', icon: '🎓', label: 'Certification' },
    { path: '/forum', icon: '💬', label: 'Forum' },
    { path: '/faq', icon: '❓', label: 'FAQ' },
    { path: '/terms', icon: '📝', label: 'T&C' },
    { path: '/about', icon: '🤓', label: 'About Us' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setTimeout(() => setIsOpen(false), 100);
  };

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      setIsOpen(false);
      navigate('/');
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Calculate reputation slider position
  // 100 points = 0% right (completely right)
  // 0 points = 100% right (completely left of the bar, if bar width is reference)
  // Let's assume the bar is 100% width of a container. 
  // If points < 100, we want it to move left.
  const reputationPoints = userProfile?.reputationPoints !== undefined ? userProfile.reputationPoints : 100;
  // If 100, right: 0. If 50, right: 50%.
  const sliderPosition = Math.max(0, Math.min(100, 100 - reputationPoints));

  return (
    <>
      {!isOpen && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      )}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
          </div>
          {isOpen && (
            <div className="sidebar-user-info">
              <p className="sidebar-username">{username}</p>
              <div className="reputation-container">
                <div className="reputation-line"></div>
                <div
                  className="reputation-badge"
                  style={{ right: `${sliderPosition}%` }}
                >
                  {reputationPoints}
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
              title={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {isOpen && <span className="sidebar-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item logout" onClick={handleLogoutClick}>
            <span className="sidebar-icon">🚪</span>
            {isOpen && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;