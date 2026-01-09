// frontend/src/components/WithdrawalHistory.js
import React, { useEffect, useState } from 'react';
import { withdrawalAPI } from '../services/api';
import Sidebar from './Sidebar';
import './WithdrawalHistory.css';

function WithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await withdrawalAPI.getHistory();
      setWithdrawals(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching withdrawal history:', err);
      setLoading(false);
    }
  };

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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-with-sidebar withdrawal-history-page">
      <Sidebar />
      <div className="main-content">
        <div className="withdrawal-history-container">
          <h1>Withdrawal History</h1>

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
                      {withdrawal.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="withdrawal-details">
                    <div className="detail-row">
                      <label>Amount:</label>
                      <span className="amount">${withdrawal.amount.toFixed(2)}</span>
                    </div>

                    <div className="detail-row">
                      <label>Wallet Address:</label>
                      <span className="wallet">{withdrawal.walletAddress}</span>
                    </div>

                    <div className="detail-row">
                      <label>Currency:</label>
                      <span>{withdrawal.currency}</span>
                    </div>

                    <div className="detail-row">
                      <label>Network:</label>
                      <span>{withdrawal.network}</span>
                    </div>

                    <div className="detail-row">
                      <label>Requested:</label>
                      <span>{new Date(withdrawal.requestedAt).toLocaleString()}</span>
                    </div>

                    {withdrawal.processedAt && (
                      <div className="detail-row">
                        <label>Processed:</label>
                        <span>{new Date(withdrawal.processedAt).toLocaleString()}</span>
                      </div>
                    )}

                    {withdrawal.adminNotes && (
                      <div className="detail-row notes">
                        <label>Admin Notes:</label>
                        <span>{withdrawal.adminNotes}</span>
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