// frontend/src/components/Withdrawal.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { withdrawalAPI, userAPI } from '../services/api';
import Sidebar from './Sidebar';
import './Withdrawal.css';

function Withdrawal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    walletAddress: '',
    confirmWallet: '',
    currency: 'USDT',
    network: 'TRC20'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await userAPI.getProfile();
      setUser(profileRes.data);

      try {
        const detailsRes = await withdrawalAPI.getDetails();
        setDetails(detailsRes.data);
      } catch (detailsErr) {
        console.log('No withdrawal details yet:', detailsErr);
        setDetails({ isLocked: false, hasDetails: false });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load profile information');
      setLoading(false);

      if (err.response?.status === 401) {
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 1000);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSetDetails = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.walletAddress !== formData.confirmWallet) {
      setError('Wallet addresses do not match!');
      return;
    }

    if (formData.walletAddress.length < 10) {
      setError('Please enter a valid wallet address');
      return;
    }

    try {
      setSubmitting(true);
      await withdrawalAPI.setDetails(formData);
      setSuccess('Withdrawal details saved successfully! These details are now locked.');
      fetchData();
      setFormData({
        walletAddress: '',
        confirmWallet: '',
        currency: 'USDT',
        network: 'TRC20'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save withdrawal details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWithdrawal = async () => {
    if (!user?.canWithdraw) {
      setError('Withdrawal is not enabled for your account. Please contact admin.');
      return;
    }

    if ((user?.reviewsCompleted || 0) < (user?.totalReviewsAssigned || 0)) {
      setError(`You must complete all ${user.totalReviewsAssigned} reviews before withdrawing. Currently completed: ${user.reviewsCompleted}`);
      return;
    }

    if ((user?.accountBalance || 0) <= 0) {
      setError('Insufficient balance to withdraw');
      return;
    }

    if (window.confirm(`Confirm withdrawal of $${user.accountBalance.toFixed(2)}? Your balance will be set to $0.`)) {
      try {
        setSubmitting(true);
        setError('');
        await withdrawalAPI.submitRequest();
        setSuccess('Withdrawal request submitted successfully! Your balance is now $0.');
        setTimeout(() => navigate('/withdrawal-history'), 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit withdrawal request');
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-with-sidebar withdrawal-page">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="page-with-sidebar withdrawal-page">
        <Sidebar />
        <div className="main-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sidebar withdrawal-page">
      <Sidebar />
      <div className="main-content">
        <div className="withdrawal-container">
          <h1>Withdrawal</h1>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="withdrawal-balance-card">
            <h3>Available Balance</h3>
            <p className="balance-amount">
              ${user?.accountBalance ? user.accountBalance.toFixed(2) : '0.00'}
            </p>
            <p className="review-progress">
              Reviews Completed: {user?.reviewsCompleted || 0} / {user?.totalReviewsAssigned || 0}
            </p>
            {user && (user.reviewsCompleted || 0) < (user.totalReviewsAssigned || 0) && (
              <p className="warning-text">
                ⚠️ Complete all reviews before withdrawing
              </p>
            )}
          </div>

          {!details?.isLocked ? (
            <div className="withdrawal-form-card">
              <h2>Set Withdrawal Details</h2>
              <p className="info-text">
                ⚠️ Once saved, these details cannot be changed, to make updates contact customer support.
              </p>

              <form onSubmit={handleSetDetails}>
                <div className="form-group">
                  <label>Withdrawal To (Username)</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="form-group">
                  <label>Wallet Address *</label>
                  <input
                    type="text"
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={handleChange}
                    placeholder="Enter your wallet address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Wallet Address *</label>
                  <input
                    type="text"
                    name="confirmWallet"
                    value={formData.confirmWallet}
                    onChange={handleChange}
                    placeholder="Re-enter your wallet address"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Currency *</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                    >
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Network *</label>
                    <select
                      name="network"
                      value={formData.network}
                      onChange={handleChange}
                    >
                      <option value="TRC20">TRC20</option>
                      <option value="ERC20">ERC20</option>
                      <option value="BTC">BTC</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Confirm & Lock Details'}
                </button>
              </form>
            </div>
          ) : (
            <div className="withdrawal-details-card">
              <h2>Your Withdrawal Details</h2>
              <p className="locked-badge">🔒 Locked - Contact customer support to change</p>

              <div className="details-display">
                <div className="detail-item">
                  <label>Withdrawal To:</label>
                  <span>{details.username || user?.username}</span>
                </div>

                <div className="detail-item">
                  <label>Wallet Address:</label>
                  <span className="wallet-address">{details.walletAddress}</span>
                </div>

                <div className="detail-item">
                  <label>Currency:</label>
                  <span>{details.currency}</span>
                </div>

                <div className="detail-item">
                  <label>Network:</label>
                  <span>{details.network}</span>
                </div>
              </div>

              <button
                onClick={handleSubmitWithdrawal}
                className="btn btn-success btn-large"
                disabled={
                  submitting ||
                  !user?.canWithdraw ||
                  (user?.reviewsCompleted || 0) < (user?.totalReviewsAssigned || 0) ||
                  (user?.accountBalance || 0) <= 0
                }
              >
                {submitting
                  ? 'Processing...'
                  : !user?.canWithdraw
                    ? '🔒 Withdrawal Disabled (Contact Admin)'
                    : (user?.reviewsCompleted || 0) < (user?.totalReviewsAssigned || 0)
                      ? '🔒 Complete All Reviews First'
                      : (user?.accountBalance || 0) <= 0
                        ? '🔒 Insufficient Balance'
                        : 'Submit Withdrawal Request'}
              </button>

              <button
                onClick={() => navigate('/withdrawal-history')}
                className="btn btn-secondary"
                style={{ marginTop: '15px' }}
              >
                View Withdrawal History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Withdrawal;