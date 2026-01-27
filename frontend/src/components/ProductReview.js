// frontend/src/components/ProductReview.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import Sidebar from './Sidebar';
import Modal from './Modal';
import confetti from 'canvas-confetti';
import logo from '../assets/baccarat-logo.svg';
import './ProductReview.css';

function ProductReview() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [activeTab, setActiveTab] = useState('images');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isBalanceNegative, setIsBalanceNegative] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        navigate('/review');
      }, 1500); // 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, navigate]);

  const fetchPendingReview = useCallback(async () => {
    try {
      const response = await reviewAPI.getPending();
      setProduct(response.data);
      setCurrentBalance(response.data.currentBalance);
      setIsBalanceNegative(response.data.isBalanceNegative);
      setLoading(false);
      setError('');

      if (response.data.isSpecial) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
        });
      }
    } catch (err) {
      console.error('Error fetching pending audit:', err);
      if (err.response?.status === 401) {
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 1000);
      } else {
        const errorMsg = err.response?.data?.message || 'No pending audit found';
        setError(errorMsg);
        setLoading(false);
        setTimeout(() => navigate('/review'), 2000);
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchPendingReview();
  }, [fetchPendingReview]);

  /* REMOVED fetchPendingReview definition from here */

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      setError('Please write a review before submitting');
      return;
    }

    if (isBalanceNegative) {
      setError(`Cannot submit audit with negative balance. Your current balance is $${currentBalance.toFixed(2)}. Please contact admin to add at least $${Math.abs(currentBalance).toFixed(2)} to continue.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await reviewAPI.submitReview(product.reviewId, reviewText);
      setShowSuccessModal(true);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.currentBalance < 0) {
        setError(`Cannot submit: Your balance is $${errorData.currentBalance.toFixed(2)}. You need at least $${errorData.requiredAmount.toFixed(2)} added to your account to proceed.`);
      } else {
        setError(errorData?.message || 'Failed to submit audit');
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error && !product) {
    return (
      <div className="error-page" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>⚠️ {error}</h2>
        {error.includes('balance') || error.includes('negative') ? (
          <>
            <p style={{ marginTop: '20px' }}>Please contact customer support to resolve this issue.</p>
            <button onClick={() => navigate('/review')} className="btn btn-primary" style={{ marginTop: '20px' }}>
              Back to Review Tab
            </button>
          </>
        ) : (
          <p>Redirecting...</p>
        )}
      </div>
    );
  }

  return (
    <div className="page-with-sidebar product-review-page">
      <Sidebar />
      <div className="main-content">
        <div className="product-review-container">
          <div className="product-header">
            <button onClick={() => navigate('/review')} className="btn btn-secondary">
              Back
            </button>
            <h1>Product Audit</h1>
          </div>

          {isBalanceNegative && (
            <div className="error-message" style={{
              background: '#ff6b6b',
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              ⚠️ NEGATIVE BALANCE WARNING ⚠️
              <p style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'normal' }}>
                Your current balance is <strong>${currentBalance.toFixed(2)}</strong>.
                You can't submit the audit until your balance is positive.
                <br />
                Please contact customer support to add at least <strong>${Math.abs(currentBalance).toFixed(2)}</strong> to your account.
              </p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="product-display">
            <div className="product-image">
              <img src={product.product.mainImage} alt={product.product.name} />
            </div>

            <div className="product-info">
              <h2>{product.product.name}</h2>
              <div className="product-details">
                <p><strong>Product Price:</strong> ${product.productPrice.toFixed(2)}</p>
                <p><strong>Commission:</strong> ${product.commission.toFixed(2)}</p>
                <p><strong>Unique Code:</strong> {product.uniqueCode}</p>
                <p className={`balance-box ${isBalanceNegative ? 'negative' : 'positive'}`}>
                  <strong>Current Balance:</strong>
                  <span className="balance-value">
                    ${currentBalance.toFixed(2)}
                  </span>
                  {isBalanceNegative && (
                    <span className="balance-warning">
                      ⚠️ Balance is negative - cannot submit audit
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="product-tabs">
            <div className="tab-buttons">
              <button
                className={activeTab === 'images' ? 'tab-active' : ''}
                onClick={() => setActiveTab('images')}
              >
                Additional Images
              </button>
              <button
                className={activeTab === 'description' ? 'tab-active' : ''}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={activeTab === 'review' ? 'tab-active' : ''}
                onClick={() => setActiveTab('review')}
              >
                Write Review
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'images' && (
                <div className="additional-images">
                  {product.product.additionalImages?.length > 0 ? (
                    product.product.additionalImages.map((img, index) => (
                      <img key={index} src={img} alt={`Additional ${index + 1}`} />
                    ))
                  ) : (
                    <p>No additional images available</p>
                  )}
                </div>
              )}

              {activeTab === 'description' && (
                <div className="product-description">
                  <p>{product.product.description || 'No description available'}</p>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="review-form">
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review here..."
                    rows="10"
                    disabled={isBalanceNegative}
                  />
                  {isBalanceNegative && (
                    <div style={{
                      padding: '15px',
                      background: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '5px',
                      marginBottom: '15px',
                      color: '#856404'
                    }}>
                      <strong>⚠️ Cannot Submit Audit</strong>
                      <p style={{ marginTop: '5px', fontSize: '14px' }}>
                        Your balance is negative (${currentBalance.toFixed(2)}).
                        Add at least ${Math.abs(currentBalance).toFixed(2)} to submit this audit.
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={submitting || isBalanceNegative}
                    style={{
                      opacity: isBalanceNegative ? 0.5 : 1,
                      cursor: isBalanceNegative ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submitting ? 'Submitting...' : isBalanceNegative ? '🔒 Submit Blocked (Negative Balance)' : 'Submit Audit'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => navigate('/review')}
        title="AUDIT SUBMITTED!"
        message="Your audit has been successfully processed and your commission added to your balance."
        type="alert"
        cancelText="Return to Dashboard"
        image={logo}
        isLogo={true}
        logoOnly={true}
      />
    </div >
  );
}

export default ProductReview;