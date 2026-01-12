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
          <div className="profile-header">
            <h1>My Profile</h1>
          </div>

          <div className="profile-content">
            {/* Account Overview */}
            <div className="profile-card">
              <h2>Account Overview</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Username</span>
                  <span className="info-value">{user.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{user.phoneNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="profile-card">
              <h2>Financial Summary</h2>
              <div className="financial-grid">
                <div className="financial-item highlight">
                  <span className="financial-label">Account Balance</span>
                  <span className="financial-value">
                    ${user.accountBalance ? user.accountBalance.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Current Session Commission</span>
                  <span className="financial-value">
                    ${user.currentSessionCommission ? user.currentSessionCommission.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Target Balance</span>
                  <span className="financial-value">
                    ${user.targetBalance ? user.targetBalance.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Statistics */}
            <div className="profile-card">
              <h2>Review Statistics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{user.reviewsCompleted || 0}</span>
                  <span className="stat-label">Reviews Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.totalReviewsAssigned || 0}</span>
                  <span className="stat-label">Total Reviews Assigned</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.currentReviewPosition || 0}</span>
                  <span className="stat-label">Current Position</span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="profile-card">
              <h2>Account Status</h2>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Withdrawal Permission</span>
                  <span className={`status-badge ${user.canWithdraw ? 'active' : 'inactive'}`}>
                    {user.canWithdraw ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Account Status</span>
                  <span className={`status-badge ${user.isFrozen ? 'inactive' : 'active'}`}>
                    {user.isFrozen ? 'Frozen' : 'Active'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Withdrawal Details</span>
                  <span className={`status-badge ${user.withdrawalInfo?.isLocked ? 'inactive' : 'active'}`}>
                    {user.withdrawalInfo?.isLocked ? 'Locked' : 'Unlocked'}
                  </span>
                </div>
              </div>
            </div>

            {/* Withdrawal Information */}
            {user.withdrawalInfo && user.withdrawalInfo.walletAddress && (
              <div className="profile-card">
                <h2>Withdrawal Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Currency</span>
                    <span className="info-value">{user.withdrawalInfo.currency}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Network</span>
                    <span className="info-value">{user.withdrawalInfo.network}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Wallet Address</span>
                    <span className="info-value wallet-address">
                      {user.withdrawalInfo.walletAddress}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Special Reviews */}
            {user.specialReviews && user.specialReviews.length > 0 && (
              <div className="profile-card">
                <h2>Special Reviews Assigned</h2>
                <div className="special-reviews-list">
                  {user.specialReviews.map((review, index) => (
                    <div key={index} className="special-review-item">
                      <span>Position: {review.position}</span>
                      <span>Price: ${review.price.toFixed(2)}</span>
                      <span>Commission: ${review.commission.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;