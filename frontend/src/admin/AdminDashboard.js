// frontend/src/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import './Admin.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userWithdrawals, setUserWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [balanceAdjust, setBalanceAdjust] = useState({ amount: 0, operation: 'add' });
  const [targetBalance, setTargetBalance] = useState(0);
  const [specialReview, setSpecialReview] = useState({
    position: 0,
    productId: '',
    price: 0,
    commission: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        // Only redirect if truly unauthorized
        setTimeout(() => {
          localStorage.clear();
          navigate('/admin/login');
        }, 1000);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getAllProducts();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      const response = await adminAPI.searchUsers(searchQuery);
      setUsers(response.data);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    setEditData({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      accountBalance: user.accountBalance,
      totalReviewsAssigned: user.totalReviewsAssigned
    });
    setTargetBalance(user.targetBalance || 0);
    
    // Fetch user's withdrawal requests
    try {
      const response = await adminAPI.getUserWithdrawals(user._id);
      setUserWithdrawals(response.data);
    } catch (err) {
      console.error('Error fetching user withdrawals:', err);
      setUserWithdrawals([]);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await adminAPI.updateUser(selectedUser._id, editData);
      alert('User updated successfully');
      setEditMode(false);
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const handleBalanceAdjust = async () => {
    try {
      await adminAPI.adjustBalance(
        selectedUser._id,
        parseFloat(balanceAdjust.amount),
        balanceAdjust.operation
      );
      alert('Balance adjusted successfully');
      fetchUsers();
      setBalanceAdjust({ amount: 0, operation: 'add' });
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to adjust balance');
    }
  };

  const handleToggleFreeze = async (userId) => {
    try {
      await adminAPI.toggleFreeze(userId);
      alert('Account status updated');
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
    } catch (err) {
      alert('Failed to update account status');
    }
  };

  const handleResetAccount = async (userId) => {
    const confirmReset = window.confirm(
      '⚠️ WARNING: This will:\n\n' +
      '• Set account balance to $0\n' +
      '• Reset reviews completed to 0\n' +
      '• Clear current review position\n' +
      '• Delete all review history\n' +
      '• Remove pending reviews\n' +
      '• Clear all special review assignments\n' +
      '• Reset session commission to $0\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you sure you want to reset this account?'
    );

    if (!confirmReset) {
      return;
    }

    // Double confirmation
    const doubleConfirm = window.confirm(
      'FINAL CONFIRMATION\n\n' +
      'This will permanently delete all data for this user.\n\n' +
      'Type YES in your mind and click OK to proceed.'
    );

    if (!doubleConfirm) {
      return;
    }

    try {
      await adminAPI.resetAccount(userId);
      alert('✅ Account reset successfully');
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      alert('❌ Failed to reset account: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleToggleWithdrawal = async (userId) => {
    try {
      await adminAPI.toggleWithdrawal(userId);
      alert('Withdrawal permission updated');
      fetchUsers();
    } catch (err) {
      alert('Failed to update withdrawal permission');
    }
  };

  const handleUnlockWithdrawal = async (userId) => {
    if (!window.confirm('Are you sure you want to unlock withdrawal details? User will be able to change their withdrawal information.')) {
      return;
    }

    try {
      await adminAPI.unlockWithdrawalDetails(userId);
      alert('Withdrawal details unlocked');
      fetchUsers();
    } catch (err) {
      alert('Failed to unlock withdrawal details');
    }
  };

  const handleSetTargetBalance = async () => {
    if (!targetBalance || targetBalance <= 0) {
      alert('Please enter a valid target balance');
      return;
    }

    try {
      await adminAPI.setTargetBalance(selectedUser._id, parseFloat(targetBalance));
      alert('Target balance set successfully');
      fetchUsers();
    } catch (err) {
      alert('Failed to set target balance');
    }
  };

  const handleUpdateWithdrawalStatus = async (withdrawalId, newStatus, notes = '') => {
    try {
      await adminAPI.updateWithdrawal(withdrawalId, { status: newStatus, adminNotes: notes });
      alert('Withdrawal status updated');
      // Refresh user withdrawals
      const response = await adminAPI.getUserWithdrawals(selectedUser._id);
      setUserWithdrawals(response.data);
    } catch (err) {
      alert('Failed to update withdrawal status');
    }
  };

  const handleSpecialReview = async () => {
    try {
      await adminAPI.assignSpecialReview(selectedUser._id, {
        position: parseInt(specialReview.position),
        productId: specialReview.productId,
        price: parseFloat(specialReview.price),
        commission: parseFloat(specialReview.commission)
      });
      alert('Special review assigned successfully');
      setSpecialReview({ position: 0, productId: '', price: 0, commission: 0 });
    } catch (err) {
      alert('Failed to assign special review');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search by username, email, or phone"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="btn btn-primary">Search</button>
        <button onClick={fetchUsers} className="btn btn-secondary">Show All</button>
      </div>

      <div className="dashboard-content">
        <div className="users-list">
          <h2>Registered Users ({users.length})</h2>
          <div className="users-table">
            {users.map((user, index) => (
              <div
                key={user._id}
                className={`user-row ${selectedUser?._id === user._id ? 'selected' : ''}`}
                onClick={() => selectUser(user)}
              >
                <div className="user-number">{index + 1}</div>
                <div className="user-info">
                  <strong>{user.username}</strong>
                  <span>{user.email}</span>
                  <span>Balance: ${user.accountBalance.toFixed(2)}</span>
                  <span>Reviews: {user.reviewsCompleted}/{user.totalReviewsAssigned}</span>
                  {user.isFrozen && <span className="frozen-badge">FROZEN</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedUser && (
          <div className="user-details">
            <h2>User Details</h2>
            
            <div className="detail-section">
              <h3>Target Balance Configuration</h3>
              <div className="target-balance-form" style={{
                background: (!selectedUser.targetBalance || selectedUser.targetBalance <=0) ? '#fff3cd' : '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                border: (!selectedUser.targetBalance || selectedUser.targetBalance <= 0) ? '2px solid #ffc107' : '1px solid #dee2e6'
              }}>
                {(!selectedUser.targetBalance || selectedUser.targetBalance <= 0) && (
                  <div style={{
                    color: '#856404',
                    marginBottom: '15px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    ⚠️ Target balance not set! User cannot start reviews.
                  </div>
                )}
                <div className="form-group">
                  <label>Target Balance (Final balance after all reviews) *</label>
                  <input
                    type="number"
                    value={targetBalance}
                    onChange={(e) => setTargetBalance(e.target.value)}
                    placeholder="e.g., 110"
                  />
                  <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
                    This determines the product prices so user reaches approximately this balance after completing all reviews.
                  </small>
                </div>
                <button onClick={handleSetTargetBalance} className="btn btn-primary">
                  Set Target Balance
                </button>
                {selectedUser.targetBalance > 0 && (
                  <div style={{marginTop: '10px', color: '#28a745'}}>
                    ✅ Current target: ${selectedUser.targetBalance.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Withdrawal Settings</h3>
              <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                <button
                  onClick={() => handleToggleWithdrawal(selectedUser._id)}
                  className={`btn ${selectedUser.canWithdraw ? 'btn-danger' : 'btn-success'}`}
                >
                  {selectedUser.canWithdraw ? 'Disable Withdrawal' : 'Enable Withdrawal'}
                </button>
                
                {selectedUser.withdrawalInfo?.isLocked && (
                  <button
                    onClick={() => handleUnlockWithdrawal(selectedUser._id)}
                    className="btn"
                    style={{background: '#ffc107', color: '#000'}}
                  >
                    🔓 Unlock Withdrawal Details
                  </button>
                )}
                
                {selectedUser.withdrawalInfo?.isLocked && (
                  <div style={{
                    background: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginTop: '10px'
                  }}>
                    <strong>Current Withdrawal Info:</strong>
                    <p style={{margin: '5px 0'}}>Wallet: {selectedUser.withdrawalInfo.walletAddress}</p>
                    <p style={{margin: '5px 0'}}>Currency: {selectedUser.withdrawalInfo.currency}</p>
                    <p style={{margin: '5px 0'}}>Network: {selectedUser.withdrawalInfo.network}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Account Information</h3>
              {!editMode ? (
                <div className="info-display">
                  <p><strong>Username:</strong> {selectedUser.username}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
                  <p><strong>Balance:</strong> ${selectedUser.accountBalance.toFixed(2)}</p>
                  <p><strong>Total Reviews Assigned:</strong> {selectedUser.totalReviewsAssigned}</p>
                  <p><strong>Reviews Completed:</strong> {selectedUser.reviewsCompleted}</p>
                  <p><strong>Current Position:</strong> {selectedUser.currentReviewPosition}</p>
                  <p><strong>Status:</strong> {selectedUser.isFrozen ? 'FROZEN' : 'ACTIVE'}</p>
                  <button onClick={() => setEditMode(true)} className="btn btn-primary">
                    Edit User
                  </button>
                </div>
              ) : (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={editData.phoneNumber}
                      onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Balance</label>
                    <input
                      type="number"
                      value={editData.accountBalance}
                      onChange={(e) => setEditData({ ...editData, accountBalance: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Reviews Assigned</label>
                    <input
                      type="number"
                      value={editData.totalReviewsAssigned}
                      onChange={(e) => setEditData({ ...editData, totalReviewsAssigned: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="button-group">
                    <button onClick={handleUpdateUser} className="btn btn-primary">
                      Save Changes
                    </button>
                    <button onClick={() => setEditMode(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Balance Adjustment</h3>
              <div className="balance-form">
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={balanceAdjust.amount}
                    onChange={(e) => setBalanceAdjust({ ...balanceAdjust, amount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Operation</label>
                  <select
                    value={balanceAdjust.operation}
                    onChange={(e) => setBalanceAdjust({ ...balanceAdjust, operation: e.target.value })}
                  >
                    <option value="add">Add</option>
                    <option value="deduct">Deduct</option>
                  </select>
                </div>
                <button onClick={handleBalanceAdjust} className="btn btn-primary">
                  Adjust Balance
                </button>
              </div>
            </div>

            <div className="detail-section">
              <h3>Assign Special Review</h3>
              <div className="special-review-form">
                <div className="form-group">
                  <label>Review Position</label>
                  <input
                    type="number"
                    value={specialReview.position}
                    onChange={(e) => setSpecialReview({ ...specialReview, position: e.target.value })}
                    placeholder="e.g., 9"
                  />
                </div>
                <div className="form-group">
                  <label>Product</label>
                  <select
                    value={specialReview.productId}
                    onChange={(e) => setSpecialReview({ ...specialReview, productId: e.target.value })}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={specialReview.price}
                    onChange={(e) => setSpecialReview({ ...specialReview, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Commission (%)</label>
                  <input
                    type="number"
                    value={specialReview.commission}
                    onChange={(e) => setSpecialReview({ ...specialReview, commission: e.target.value })}
                    placeholder="e.g., 16"
                  />
                </div>
                <button onClick={handleSpecialReview} className="btn btn-primary">
                  Assign Special Review
                </button>
              </div>
            </div>

            <div className="detail-section">
              <h3>Account Control</h3>
              <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                <button
                  onClick={() => handleToggleFreeze(selectedUser._id)}
                  className={`btn ${selectedUser.isFrozen ? 'btn-success' : 'btn-danger'}`}
                >
                  {selectedUser.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                </button>
                
                <button
                  onClick={() => handleResetAccount(selectedUser._id)}
                  className="btn"
                  style={{
                    background: '#ff4444',
                    color: 'white',
                    border: '2px solid #cc0000'
                  }}
                >
                  🔄 Reset Account (Danger Zone)
                </button>
              </div>
            </div>

            <div className="detail-section">
              <h3>Withdrawal Requests</h3>
              {userWithdrawals.length === 0 ? (
                <p style={{color: '#666', fontStyle: 'italic'}}>No withdrawal requests yet.</p>
              ) : (
                <div style={{display: 'grid', gap: '15px'}}>
                  {userWithdrawals.map((withdrawal) => (
                    <div key={withdrawal._id} style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                        <strong>Amount: ${withdrawal.amount.toFixed(2)}</strong>
                        <span style={{
                          background: 
                            withdrawal.status === 'completed' ? '#d4edda' :
                            withdrawal.status === 'processed' ? '#d1ecf1' :
                            withdrawal.status === 'cancelled' ? '#f8d7da' :
                            '#fff3cd',
                          color:
                            withdrawal.status === 'completed' ? '#155724' :
                            withdrawal.status === 'processed' ? '#0c5460' :
                            withdrawal.status === 'cancelled' ? '#721c24' :
                            '#856404',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {withdrawal.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
                        <div>Wallet: {withdrawal.walletAddress}</div>
                        <div>Currency: {withdrawal.currency} ({withdrawal.network})</div>
                        <div>Requested: {new Date(withdrawal.requestedAt).toLocaleString()}</div>
                        {withdrawal.adminNotes && (
                          <div style={{marginTop: '5px', color: '#333'}}>
                            <strong>Notes:</strong> {withdrawal.adminNotes}
                          </div>
                        )}
                      </div>
                      {withdrawal.status === 'pending' && (
                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                          <button
                            onClick={() => handleUpdateWithdrawalStatus(withdrawal._id, 'processed')}
                            className="btn"
                            style={{flex: 1, background: '#17a2b8', color: 'white', padding: '8px'}}
                          >
                            Mark as Processed
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter notes (optional):');
                              handleUpdateWithdrawalStatus(withdrawal._id, 'cancelled', notes || '');
                            }}
                            className="btn"
                            style={{flex: 1, background: '#dc3545', color: 'white', padding: '8px'}}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {withdrawal.status === 'processed' && (
                        <button
                          onClick={() => handleUpdateWithdrawalStatus(withdrawal._id, 'completed')}
                          className="btn btn-success"
                          style={{width: '100%', marginTop: '10px', padding: '8px'}}
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;