// frontend/src/components/Sidebar.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/baccarat-logo.svg';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const username = localStorage.getItem('username');

  const menuItems = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/review', icon: '⭐', label: 'Reviews' },
    { path: '/history', icon: '📜', label: 'Review History' },
    { path: '/withdrawal', icon: '💰', label: 'Withdrawal' },
    { path: '/withdrawal-history', icon: '📋', label: 'Withdrawal History' },
    { path: '/certification', icon: '🎓', label: 'Certification' },
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
          {isOpen && <p className="sidebar-username">{username}</p>}
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