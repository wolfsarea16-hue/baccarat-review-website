// frontend/src/components/Profile.js
import React, { useEffect, useState, useRef } from 'react';
import { userAPI } from '../services/api';
import Sidebar from './Sidebar';
import Modal from './Modal';
import logo from '../assets/baccarat-logo.svg';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert'
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
      if (response.data.profileImage) {
        setProfileImage(response.data.profileImage);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (profileImage) {
      setShowImageModal(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleChangeImage = () => {
    setShowImageModal(false);
    fileInputRef.current?.click();
  };

  const handleViewImage = () => {
    // Open image in new tab
    const newWindow = window.open();
    newWindow.document.write(`<img src="${profileImage}" style="max-width: 100%; height: auto;" />`);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Convert to base64 and crop to square
    const reader = new FileReader();
    reader.onloadend = async () => {
      const img = new Image();
      img.onload = async () => {
        // Create canvas for cropping to square
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
        setProfileImage(croppedBase64);

        // Upload to server
        try {
          await userAPI.updateProfileImage({ profileImage: croppedBase64 });
          setModalConfig({
            isOpen: true,
            title: 'SUCCESS!',
            message: 'Your profile picture has been updated successfully.',
            type: 'alert'
          });
          fetchProfile();
        } catch (err) {
          console.error('Error uploading profile image:', err);
          setModalConfig({
            isOpen: true,
            title: 'ERROR!',
            message: 'Failed to update profile picture. Please try again.',
            type: 'alert'
          });
          setProfileImage(user.profileImage || null);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
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
          {/* Profile Header */}
          <div className="profile-header">
            <h1>My profile</h1>
          </div>

          {/* User Avatar and Name */}
          <div className="profile-avatar">
            <div className={`avatar-circle ${!profileImage ? 'no-image' : ''}`} onClick={handleAvatarClick}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-image" />
              ) : (
                <img src={logo} alt="Default Profile" className="profile-image default-logo" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <h2 className="username">{user.username}</h2>

            {/* Reputation Slider */}
            <div className="profile-reputation-container">
              <div className="profile-reputation-line"></div>
              <div
                className="profile-reputation-badge"
                style={{ right: `${Math.max(0, Math.min(100, 100 - (user.reputationPoints || 100)))}%` }}
              >
                {user.reputationPoints || 100}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-top-row">
            <div className="stat-box">
              <span className="stat-label">Account Balance</span>
              <span className="stat-value">${user.accountBalance ? user.accountBalance.toFixed(2) : '0.00'}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Audits Completed</span>
              <span className="stat-value">{user.reviewsCompleted || 0}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Commission earned</span>
              <span className="stat-value">${user.currentSessionCommission ? user.currentSessionCommission.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          {/* Member Since Section */}
          <div className="member-since-section">
            <div className="levels-container">
              <img src="/levels1.png" alt="Levels" className="levels-image" />
            </div>
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

      {/* Image Options Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Profile Picture</h3>
            <div className="modal-buttons">
              <button onClick={handleViewImage} className="btn btn-primary">
                View Full Image
              </button>
              <button onClick={handleChangeImage} className="btn btn-secondary">
                Change Picture
              </button>
              <button onClick={() => setShowImageModal(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        image="/profile-success.png"
      />
    </div>
  );
}

export default Profile;