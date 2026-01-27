// frontend/src/components/ReviewTab.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import Sidebar from './Sidebar';
import './ReviewTab.css';

function ReviewTab() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const response = await reviewAPI.getStatus();
      setStatus(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Failed to load review status');
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
    fetchStatus();
  }, [fetchStatus]);

  /* REMOVED fetchStatus definition from here */

  const handleStartReview = async () => {
    try {
      setError('');

      if (status.hasPendingReview) {
        navigate('/review/product');
        return;
      }

      setLoading(true);
      await reviewAPI.startReview();
      navigate('/review/product');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to start review';
      setError(errorMsg);

      if (errorMsg.includes('balance') || errorMsg.includes('Insufficient')) {
        fetchStatus();
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-with-sidebar review-tab-page">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="page-with-sidebar review-tab-page">
        <Sidebar />
        <div className="main-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sidebar review-tab-page">
      <Sidebar />
      <div className="main-content">
        <div className="review-tab-container">
          <div className="review-tab-header">
            <h1>Audit Dashboard</h1>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="review-stats">
            <div className="stat-card">
              <h3>Account Balance</h3>
              <p className="stat-value">
                ${status?.accountBalance ? status.accountBalance.toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="stat-card">
              <h3>Audits Completed</h3>
              <p className="stat-value">
                {status?.reviewsCompleted || 0} / {status?.totalReviewsAssigned || 0}
              </p>
            </div>

            <div className="stat-card">
              <h3>Audits Remaining</h3>
              <p className="stat-value">{status?.reviewsRemaining || 0}</p>
            </div>
          </div>

          <div className="review-action">
            {status?.accountBalance < 0 ? (
              <div className="error-message" style={{ textAlign: 'center', padding: '20px' }}>
                <h2>⚠️ Negative Balance</h2>
                <p>Your account balance is negative: ${status?.accountBalance?.toFixed(2) || '0.00'}</p>
                <p>Please contact customer support to add balance before you can continue auditing.</p>
              </div>
            ) : status?.reviewsRemaining > 0 ? (
              <>
                <p className="review-instruction">
                  {status?.hasPendingReview
                    ? 'You have a pending audit. Click below to continue.'
                    : 'Click the button below to start auditing a product.'}
                </p>
                <button
                  onClick={handleStartReview}
                  className="btn btn-primary btn-large"
                  disabled={loading}
                >
                  {status?.hasPendingReview ? 'Continue Audit' : 'Start Audit'}
                </button>
              </>
            ) : (
              <div className="completed-message">
                <h2>🎉 All Audits Completed!</h2>
                <p>You have successfully completed all assigned audits.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewTab;