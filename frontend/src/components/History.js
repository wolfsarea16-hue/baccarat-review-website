// frontend/src/components/History.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import Sidebar from './Sidebar';
import './History.css';

function History() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await reviewAPI.getHistory();
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
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
          </div>

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
                      {(review.productPrice ?? 0).toFixed(2)}
                    </p>

                    <p>
                      <strong>Commission:</strong> $
                      {(review.commission ?? 0).toFixed(2)}
                    </p>

                    <p>
                      <strong>Code:</strong> {review.uniqueCode}
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
                      {review.status === 'completed'
                        ? `Completed: ${new Date(
                            review.completedAt
                          ).toLocaleDateString()}`
                        : `Started: ${new Date(
                            review.createdAt
                          ).toLocaleDateString()}`
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