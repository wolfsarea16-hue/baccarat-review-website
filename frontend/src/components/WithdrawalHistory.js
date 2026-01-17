// frontend/src/components/WithdrawalHistory.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { withdrawalAPI } from '../services/api';
import Sidebar from './Sidebar';
import './WithdrawalHistory.css';

function WithdrawalHistory() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      const response = await withdrawalAPI.getHistory();
      const data = response.data;

      // Make sure we have an array
      if (Array.isArray(data)) {
        setWithdrawals(data);
      } else if (data && Array.isArray(data.withdrawals)) {
        setWithdrawals(data.withdrawals);
      } else {
        setWithdrawals([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching withdrawal history:', err);
      setWithdrawals([]);
      setError('Failed to load withdrawal history');
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processed': return 'status-approved';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-rejected';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="page-with-sidebar withdrawal-history-page">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sidebar withdrawal-history-page">
      <Sidebar />
      <div className="main-content">
        <div className="withdrawal-history-container">
          <div className="withdrawal-history-header">
            <div className="spacer"></div>
            <h1>Withdrawal History</h1>
            <div className="spacer"></div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {withdrawals.length === 0 ? (
            <div className="no-withdrawals">
              <p>No withdrawal requests yet.</p>
            </div>
          ) : (
            <div className="withdrawals-list">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal._id} className="withdrawal-card">
                  <div className="withdrawal-header">
                    <h3>Withdrawal Request</h3>
                    <span className={`status-badge ${getStatusBadgeClass(withdrawal.status)}`}>
                      {withdrawal.status ? withdrawal.status.toUpperCase() : 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="withdrawal-details">
                    <div className="detail-row">
                      <label>Amount:</label>
                      <span className="amount">
                        ${withdrawal.amount ? withdrawal.amount.toFixed(2) : '0.00'}
                      </span>
                    </div>

                    <div className="detail-row">
                      <label>Wallet Address:</label>
                      <span className="wallet">{withdrawal.walletAddress || 'N/A'}</span>
                    </div>

                    <div className="detail-row">
                      <label>Currency:</label>
                      <span>{withdrawal.currency || 'N/A'}</span>
                    </div>

                    <div className="detail-row">
                      <label>Network:</label>
                      <span>{withdrawal.network || 'N/A'}</span>
                    </div>

                    <div className="detail-row">
                      <label>Requested:</label>
                      <span>
                        {withdrawal.requestedAt
                          ? new Date(withdrawal.requestedAt).toLocaleString()
                          : 'N/A'
                        }
                      </span>
                    </div>

                    {withdrawal.processedAt && (
                      <div className="detail-row">
                        <label>Processed:</label>
                        <span>{new Date(withdrawal.processedAt).toLocaleString()}</span>
                      </div>
                    )}
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

export default WithdrawalHistory;