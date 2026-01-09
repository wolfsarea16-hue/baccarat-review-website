// frontend/src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import Sidebar from './Sidebar';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="page-with-sidebar profile-page">
      <Sidebar />
      <div className="main-content">
        <div className="profile-container">
          <h1>My Profile</h1>
          
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
              <h2>{user?.username}</h2>
            </div>

            <div className="profile-details">
              <div className="profile-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>

              <div className="profile-item">
                <label>Phone Number:</label>
                <span>{user?.phoneNumber}</span>
              </div>

              <div className="profile-item">
                <label>Account Balance:</label>
                <span className="balance">${user?.accountBalance.toFixed(2)}</span>
              </div>

              <div className="profile-item">
                <label>Total Reviews Assigned:</label>
                <span>{user?.totalReviewsAssigned}</span>
              </div>

              <div className="profile-item">
                <label>Reviews Completed:</label>
                <span>{user?.reviewsCompleted}</span>
              </div>

              <div className="profile-item">
                <label>Current Session Commission:</label>
                <span className="commission">${user?.currentSessionCommission.toFixed(2)}</span>
              </div>

              <div className="profile-item">
                <label>Account Status:</label>
                <span className={user?.isFrozen ? 'status-frozen' : 'status-active'}>
                  {user?.isFrozen ? '🔒 Frozen' : '✅ Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;