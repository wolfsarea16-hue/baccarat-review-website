// frontend/src/admin/AdminDashboard.js - OPTIMIZED VERSION
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import './Admin.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Load data in parallel for speed
  Promise.all([
    adminAPI.getAllUsers().catch(err => {
      console.error('Users fetch failed:', err);
      return { data: [] };
    }),
    adminAPI.getAllProducts().catch(err => {
      console.error('Products fetch failed:', err);
      return { data: [] };
    })
  ]).then(([usersRes, productsRes]) => {
    // ADD THESE CONSOLE LOGS
    console.log('Users Response:', usersRes);
    console.log('Users Data:', usersRes.data);
    console.log('Is Array?', Array.isArray(usersRes.data));
    
    // Ensure we have arrays
    const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
    const productsData = Array.isArray(productsRes.data) ? productsRes.data : [];
    
    console.log('Final users array:', usersData);
    
    setUsers(usersData);
    setProducts(productsData);
    setLoading(false);
  }).catch(err => {
    console.error('Critical error:', err);
    setUsers([]);
    setProducts([]);
    setLoading(false);
  });
}, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const selectUser = (user) => {
    setSelectedUser(user);
  };

  const handleBalanceAdjust = async (userId, amount, operation) => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await adminAPI.adjustBalance(userId, parseFloat(amount), operation);
      alert('Balance adjusted successfully');
      // Refresh users
      const res = await adminAPI.getAllUsers();
      setUsers(res.data || []);
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to adjust balance: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleToggleFreeze = async (userId) => {
    try {
      await adminAPI.toggleFreeze(userId);
      alert('Account status updated');
      const res = await adminAPI.getAllUsers();
      setUsers(res.data || []);
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSetTargetBalance = async (userId, targetBalance) => {
    if (!targetBalance || targetBalance <= 0) {
      alert('Please enter a valid target balance');
      return;
    }

    try {
      await adminAPI.setTargetBalance(userId, parseFloat(targetBalance));
      alert('Target balance set successfully');
      const res = await adminAPI.getAllUsers();
      setUsers(res.data || []);
    } catch (err) {
      alert('Failed to set target balance');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="search-section">
        <div style={{ flex: 1, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          Total Users: {users.length}
        </div>
      </div>

      <div className="dashboard-content">
        {/* Users List */}
        <div className="users-list">
          <h2>Registered Users</h2>
          <div className="users-table">
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <div
                  key={user._id}
                  className={`user-row ${selectedUser?._id === user._id ? 'selected' : ''}`}
                  onClick={() => selectUser(user)}
                >
                  <div className="user-number">{index + 1}</div>
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                    <span>Balance: ${(user.accountBalance || 0).toFixed(2)}</span>
                    <span>Reviews: {user.reviewsCompleted || 0}/{user.totalReviewsAssigned || 0}</span>
                    {user.isFrozen && <span className="frozen-badge">FROZEN</span>}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No users found. Have you seeded the database?
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        {selectedUser ? (
          <div className="user-details">
            <h2>{selectedUser.username}'s Account</h2>

            {/* Account Info */}
            <div className="detail-section">
              <h3>Account Information</h3>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
                <p><strong>Balance:</strong> ${(selectedUser.accountBalance || 0).toFixed(2)}</p>
                <p><strong>Reviews:</strong> {selectedUser.reviewsCompleted || 0} / {selectedUser.totalReviewsAssigned || 0}</p>
                <p><strong>Status:</strong> {selectedUser.isFrozen ? '🔒 FROZEN' : '✅ ACTIVE'}</p>
              </div>
            </div>

            {/* Target Balance */}
            <div className="detail-section">
              <h3>Set Target Balance</h3>
              <div style={{
                background: (!selectedUser.targetBalance || selectedUser.targetBalance <= 0) ? '#fff3cd' : '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                {(!selectedUser.targetBalance || selectedUser.targetBalance <= 0) && (
                  <p style={{ color: '#856404', fontWeight: 'bold' }}>
                    ⚠️ Target not set! User cannot start reviews.
                  </p>
                )}
                <input
                  type="number"
                  placeholder="Enter target balance"
                  id="targetBalanceInput"
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '10px',
                    marginBottom: '10px',
                    borderRadius: '5px',
                    border: '2px solid #ddd'
                  }}
                  defaultValue={selectedUser.targetBalance || ''}
                />
                <button
                  onClick={() => {
                    const val = document.getElementById('targetBalanceInput').value;
                    handleSetTargetBalance(selectedUser._id, val);
                  }}
                  className="btn btn-primary"
                >
                  Set Target Balance
                </button>
                {selectedUser.targetBalance > 0 && (
                  <p style={{ marginTop: '10px', color: '#28a745' }}>
                    ✅ Current: ${selectedUser.targetBalance.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Balance Adjustment */}
            <div className="detail-section">
              <h3>Adjust Balance</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  placeholder="Amount"
                  id="balanceAmount"
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '2px solid #ddd'
                  }}
                />
                <button
                  onClick={() => {
                    const val = document.getElementById('balanceAmount').value;
                    handleBalanceAdjust(selectedUser._id, val, 'add');
                  }}
                  className="btn btn-success"
                >
                  Add Balance
                </button>
                <button
                  onClick={() => {
                    const val = document.getElementById('balanceAmount').value;
                    handleBalanceAdjust(selectedUser._id, val, 'deduct');
                  }}
                  className="btn btn-danger"
                >
                  Deduct Balance
                </button>
              </div>
            </div>

            {/* Account Control */}
            <div className="detail-section">
              <h3>Account Control</h3>
              <button
                onClick={() => handleToggleFreeze(selectedUser._id)}
                className={`btn ${selectedUser.isFrozen ? 'btn-success' : 'btn-danger'}`}
                style={{ width: '100%' }}
              >
                {selectedUser.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'white',
            borderRadius: '10px',
            padding: '60px',
            color: '#999'
          }}>
            Select a user to view details
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;