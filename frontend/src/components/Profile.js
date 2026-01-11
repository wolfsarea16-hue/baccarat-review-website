// frontend/src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Sidebar from './Sidebar';
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
          <div className="error-message">{error || 'Failed to load profile'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sidebar profile-page">
      <Sidebar />
      <div className="main-content">
        <div className="profile-container">
          <h1>Profile</h1>

          <div className="profile-card">
            <div className="profile-section">
              <h2>Account Information</h2>
              <div className="profile-info">
                <div className="info-row">
                  <label>Username:</label>
                  <span>{user.username || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <span>{user.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Phone:</label>
                  <span>{user.phoneNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Balance & Statistics</h2>
              <div className="profile-info">
                <div className="info-row">
                  <label>Account Balance:</label>
                  <span className="balance-amount">
                    ${user.accountBalance ? user.accountBalance.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="info-row">
                  <label>Session Commission:</label>
                  <span className="commission-amount">
                    ${user.sessionCommission ? user.sessionCommission.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="info-row">
                  <label>Reviews Completed:</label>
                  <span>{user.reviewsCompleted || 0} / {user.totalReviewsAssigned || 0}</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Account Status</h2>
              <div className="profile-info">
                <div className="info-row">
                  <label>Status:</label>
                  <span className={user.isFrozen ? 'status-frozen' : 'status-active'}>
                    {user.isFrozen ? '🔒 Frozen' : '✅ Active'}
                  </span>
                </div>
                <div className="info-row">
                  <label>Withdrawal Enabled:</label>
                  <span className={user.withdrawalEnabled ? 'status-active' : 'status-frozen'}>
                    {user.withdrawalEnabled ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;