// frontend/src/components/History.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import Sidebar from './Sidebar';
import './History.css';

function History() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      const response = await reviewAPI.getHistory();
      const data = response.data;

      // Make sure we have an array
      if (Array.isArray(data)) {
        setReviews(data);
      } else if (data && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching history:', err);
      setReviews([]);
      setError('Failed to load review history');
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
    fetchHistory();
  }, [fetchHistory]);

  /* REMOVED fetchHistory definition from here */

  if (loading) {
    return (
      <div className="page-with-sidebar history-page">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sidebar history-page">
      <Sidebar />

      <div className="main-content">
        <div className="history-container">

          <div className="history-header">
            <button
              onClick={() => navigate('/home')}
              className="luxury-back-btn"
            >
              Back to Home
            </button>
            <h1>Review History</h1>
            <div></div> {/* Spacer for flex layout */}

          </div>

          {error && <div className="error-message">{error}</div>}

          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet. Start reviewing products to see your history!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-card-header">
                    <h3>{review.productId?.name || 'Product'}</h3>
                    <span className={`status-badge ${review.status}`}>
                      {review.status}
                    </span>
                  </div>

                  <div className="review-card-body">
                    <p>
                      <span style={{ color: "#D4AF37" }}><strong>Price:</strong></span> $
                      {review.productPrice ? review.productPrice.toFixed(2) : '0.00'}
                    </p>

                    <p>
                      <strong>Commission:</strong> $
                      {review.commission ? review.commission.toFixed(2) : '0.00'}
                    </p>

                    <p>
                      <strong>Code:</strong> {review.uniqueCode || 'N/A'}
                    </p>

                    {review.isSpecial && (
                      <span className="special-badge">Special Review</span>
                    )}

                    {review.reviewText && (
                      <div className="review-text">
                        <strong>Review:</strong>
                        <p>{review.reviewText}</p>
                      </div>
                    )}

                    <p className="review-date">
                      {review.status === 'completed' && review.completedAt
                        ? `Completed: ${new Date(review.completedAt).toLocaleDateString()}`
                        : review.createdAt
                          ? `Started: ${new Date(review.createdAt).toLocaleDateString()}`
                          : 'Date unknown'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default History;