// frontend/src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Sidebar from './Sidebar';
import logo from '../assets/baccarat-logo.svg';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    }
  };

  if (loading) {
    return (
      <div className="page-with-sidebar profile-page">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page-with-sidebar profile-page">
        <Sidebar />
        <div className="main-content">
          <div className="error-message">{error || 'No user data found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sidebar profile-page">
      <Sidebar />

      <div className="main-content">
        <div className="profile-container">
          {/* Profile Header - Centered Title */}
          <div className="profile-header">
            <button 
              onClick={() => navigate('/home')} 
              className="back-to-home-btn"
            >
              back to home
            </button>
            <h1>My profile</h1>
            <div className="spacer"></div>
          </div>

          {/* User Avatar and Name */}
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="username">{user.username}</h2>
          </div>

          {/* Stats Grid - Top Row */}
          <div className="stats-top-row">
            <div className="stat-box">
              <span className="stat-label">Account Balance</span>
              <span className="stat-value">${user.accountBalance ? user.accountBalance.toFixed(2) : '0.00'}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Reviews Completed</span>
              <span className="stat-value">{user.reviewsCompleted || 0}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Commission earned</span>
              <span className="stat-value">${user.currentSessionCommission ? user.currentSessionCommission.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          {/* Member Since Section - Date Next to Label, Logo Below */}
          <div className="member-since-section">
            <div className="member-info-row">
              <span className="member-label">Member since :</span>
              <span className="member-date">
                {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="logo-container">
              <img src={logo} alt="Baccarat Logo" className="profile-logo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;