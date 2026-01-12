// frontend/src/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import './Admin.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserReviews, setSelectedUserReviews] = useState([]);
  const [selectedUserWithdrawals, setSelectedUserWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit forms state
  const [editingUser, setEditingUser] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    accountBalance: 0,
    totalReviewsAssigned: 0
  });

  // Balance adjustment state
  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    operation: 'add'
  });

  // Target balance state
  const [targetBalanceForm, setTargetBalanceForm] = useState({
    targetBalance: ''
  });

  // Special review state
  const [specialReviewForm, setSpecialReviewForm] = useState({
    position: '',
    productId: '',
    price: '',
    commission: ''
  });

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    mainImage: '',
    additionalImages: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchWithdrawals();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getAllProducts();
      const productsData = Array.isArray(response.data) ? response.data : [];
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const response = await adminAPI.getAllWithdrawals();
      const withdrawalsData = Array.isArray(response.data) ? response.data : [];
      setWithdrawals(withdrawalsData);
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      setWithdrawals([]);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      accountBalance: user.accountBalance,
      totalReviewsAssigned: user.totalReviewsAssigned
    });
    setTargetBalanceForm({
      targetBalance: user.targetBalance || 0
    });

    // Fetch user details
    try {
      const response = await adminAPI.getUserDetails(user._id);
      setSelectedUserReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setSelectedUserReviews([]);
    }

    // Fetch user withdrawals
    try {
      const response = await adminAPI.getUserWithdrawals(user._id);
      setSelectedUserWithdrawals(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching user withdrawals:', err);
      setSelectedUserWithdrawals([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      const response = await adminAPI.searchUsers(searchQuery);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await adminAPI.updateUser(selectedUser._id, editForm);
      alert('User updated successfully!');
      setEditingUser(false);
      fetchUsers();
      handleUserSelect({ ...selectedUser, ...editForm });
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user');
    }
  };

  const handleAdjustBalance = async () => {
    try {
      await adminAPI.adjustBalance(
        selectedUser._id,
        parseFloat(balanceForm.amount),
        balanceForm.operation
      );
      alert('Balance adjusted successfully!');
      setBalanceForm({ amount: '', operation: 'add' });
      fetchUsers();
      const updatedUser = users.find(u => u._id === selectedUser._id);
      if (updatedUser) handleUserSelect(updatedUser);
    } catch (err) {
      console.error('Error adjusting balance:', err);
      alert('Failed to adjust balance');
    }
  };

  const handleSetTargetBalance = async () => {
    try {
      await adminAPI.setTargetBalance(
        selectedUser._id,
        parseFloat(targetBalanceForm.targetBalance)
      );
      alert('Target balance set successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Error setting target balance:', err);
      alert('Failed to set target balance');
    }
  };

  const handleAssignSpecialReview = async () => {
    try {
      await adminAPI.assignSpecialReview(selectedUser._id, {
        position: parseInt(specialReviewForm.position),
        productId: specialReviewForm.productId,
        price: parseFloat(specialReviewForm.price),
        commission: parseFloat(specialReviewForm.commission)
      });
      alert('Special review assigned successfully!');
      setSpecialReviewForm({ position: '', productId: '', price: '', commission: '' });
      fetchUsers();
    } catch (err) {
      console.error('Error assigning special review:', err);
      alert('Failed to assign special review');
    }
  };

  const handleToggleFreeze = async () => {
    try {
      await adminAPI.toggleFreeze(selectedUser._id);
      alert(selectedUser.isFrozen ? 'Account unfrozen!' : 'Account frozen!');
      fetchUsers();
      const updatedUser = users.find(u => u._id === selectedUser._id);
      if (updatedUser) handleUserSelect(updatedUser);
    } catch (err) {
      console.error('Error toggling freeze:', err);
      alert('Failed to toggle freeze status');
    }
  };

  const handleResetAccount = async () => {
    if (!window.confirm('Are you sure you want to reset this account? This will delete all reviews and reset balance to 0.')) {
      return;
    }

    try {
      await adminAPI.resetAccount(selectedUser._id);
      alert('Account reset successfully!');
      fetchUsers();
      const updatedUser = users.find(u => u._id === selectedUser._id);
      if (updatedUser) handleUserSelect(updatedUser);
    } catch (err) {
      console.error('Error resetting account:', err);
      alert('Failed to reset account');
    }
  };

  const handleToggleWithdrawal = async () => {
    try {
      await adminAPI.toggleWithdrawal(selectedUser._id);
      alert(selectedUser.canWithdraw ? 'Withdrawal disabled!' : 'Withdrawal enabled!');
      fetchUsers();
      const updatedUser = users.find(u => u._id === selectedUser._id);
      if (updatedUser) handleUserSelect(updatedUser);
    } catch (err) {
      console.error('Error toggling withdrawal:', err);
      alert('Failed to toggle withdrawal permission');
    }
  };

  const handleUnlockWithdrawal = async () => {
    try {
      await adminAPI.unlockWithdrawalDetails(selectedUser._id);
      alert('Withdrawal details unlocked! User can now update their information.');
      fetchUsers();
    } catch (err) {
      console.error('Error unlocking withdrawal:', err);
      alert('Failed to unlock withdrawal details');
    }
  };

  const handleAddProduct = async () => {
    try {
      const additionalImagesArray = productForm.additionalImages
        .split(',')
        .map(url => url.trim())
        .filter(url => url);

      await adminAPI.addProduct({
        name: productForm.name,
        description: productForm.description,
        mainImage: productForm.mainImage,
        additionalImages: additionalImagesArray
      });

      alert('Product added successfully!');
      setProductForm({ name: '', description: '', mainImage: '', additionalImages: '' });
      setShowProductForm(false);
      fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    }
  };

  const handleUpdateWithdrawal = async (withdrawalId, status, adminNotes) => {
    try {
      await adminAPI.updateWithdrawal(withdrawalId, { status, adminNotes });
      alert('Withdrawal status updated!');
      fetchWithdrawals();
      if (selectedUser) {
        const response = await adminAPI.getUserWithdrawals(selectedUser._id);
        setSelectedUserWithdrawals(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error updating withdrawal:', err);
      alert('Failed to update withdrawal status');
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
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search by username, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="btn btn-primary">
          Search
        </button>
        <button onClick={fetchUsers} className="btn btn-secondary">
          Show All
        </button>
      </div>

      <div className="dashboard-content">
        {/* USERS LIST */}
        <div className="users-list">
          <h2>Users ({users.length})</h2>
          <div className="users-table">
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              users.map((user, index) => (
                <div
                  key={user._id}
                  className={`user-row ${selectedUser?._id === user._id ? 'selected' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <span className="user-number">{index + 1}.</span>
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                    <span>Balance: ${user.accountBalance?.toFixed(2) || '0.00'}</span>
                    {user.isFrozen && <span className="frozen-badge">FROZEN</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* USER DETAILS */}
        <div className="user-details">
          {!selectedUser ? (
            <p>Select a user to view details</p>
          ) : (
            <>
              {/* USER INFO SECTION */}
              <div className="detail-section">
                <h3>User Information</h3>
                {!editingUser ? (
                  <div className="info-display">
                    <p><strong>Username:</strong> {selectedUser.username}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
                    <p><strong>Account Balance:</strong> ${selectedUser.accountBalance?.toFixed(2) || '0.00'}</p>
                    <p><strong>Total Reviews Assigned:</strong> {selectedUser.totalReviewsAssigned || 0}</p>
                    <p><strong>Reviews Completed:</strong> {selectedUser.reviewsCompleted || 0}</p>
                    <p><strong>Current Position:</strong> {selectedUser.currentReviewPosition || 0}</p>
                    <p><strong>Frozen:</strong> {selectedUser.isFrozen ? 'Yes' : 'No'}</p>
                    <p><strong>Can Withdraw:</strong> {selectedUser.canWithdraw ? 'Yes' : 'No'}</p>
                    <button onClick={() => setEditingUser(true)} className="btn btn-primary">
                      Edit User
                    </button>
                  </div>
                ) : (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      />
                    </div>
                    <div className="button-group">
                      <button onClick={handleUpdateUser} className="btn btn-success">
                        Save Changes
                      </button>
                      <button onClick={() => setEditingUser(false)} className="btn btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BALANCE ADJUSTMENT SECTION */}
              <div className="detail-section">
                <h3>Adjust Balance</h3>
                <div className="balance-form">
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      value={balanceForm.amount}
                      onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="form-group">
                    <label>Operation</label>
                    <select
                      value={balanceForm.operation}
                      onChange={(e) => setBalanceForm({ ...balanceForm, operation: e.target.value })}
                    >
                      <option value="add">Add</option>
                      <option value="deduct">Deduct</option>
                    </select>
                  </div>
                  <button onClick={handleAdjustBalance} className="btn btn-primary">
                    Adjust Balance
                  </button>
                </div>
              </div>

              {/* TARGET BALANCE SECTION */}
              <div className="detail-section">
                <h3>Target Balance</h3>
                <p>Current Target: ${selectedUser.targetBalance?.toFixed(2) || '0.00'}</p>
                <div className="target-balance-form">
                  <div className="form-group">
                    <label>New Target Balance</label>
                    <input
                      type="number"
                      value={targetBalanceForm.targetBalance}
                      onChange={(e) => setTargetBalanceForm({ targetBalance: e.target.value })}
                      placeholder="Enter target balance"
                    />
                  </div>
                  <button onClick={handleSetTargetBalance} className="btn btn-primary">
                    Set Target Balance
                  </button>
                </div>
              </div>

              {/* SPECIAL REVIEW SECTION */}
              <div className="detail-section">
                <h3>Assign Special Review</h3>
                <div className="special-review-form">
                  <div className="form-group">
                    <label>Position (1-40)</label>
                    <input
                      type="number"
                      value={specialReviewForm.position}
                      onChange={(e) => setSpecialReviewForm({ ...specialReviewForm, position: e.target.value })}
                      placeholder="Position number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Product</label>
                    <select
                      value={specialReviewForm.productId}
                      onChange={(e) => setSpecialReviewForm({ ...specialReviewForm, productId: e.target.value })}
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
                      value={specialReviewForm.price}
                      onChange={(e) => setSpecialReviewForm({ ...specialReviewForm, price: e.target.value })}
                      placeholder="Product price"
                    />
                  </div>
                  <div className="form-group">
                    <label>Commission</label>
                    <input
                      type="number"
                      value={specialReviewForm.commission}
                      onChange={(e) => setSpecialReviewForm({ ...specialReviewForm, commission: e.target.value })}
                      placeholder="Commission amount"
                    />
                  </div>
                  <button onClick={handleAssignSpecialReview} className="btn btn-primary">
                    Assign Special Review
                  </button>
                </div>

                {/* Display current special reviews */}
                {selectedUser.specialReviews && selectedUser.specialReviews.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h4>Current Special Reviews:</h4>
                    {selectedUser.specialReviews.map((sr, idx) => (
                      <p key={idx}>
                        Position {sr.position}: ${sr.price} (Commission: ${sr.commission})
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* ACCOUNT ACTIONS SECTION */}
              <div className="detail-section">
                <h3>Account Actions</h3>
                <div className="button-group">
                  <button onClick={handleToggleFreeze} className={`btn ${selectedUser.isFrozen ? 'btn-success' : 'btn-danger'}`}>
                    {selectedUser.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                  </button>
                  <button onClick={handleToggleWithdrawal} className={`btn ${selectedUser.canWithdraw ? 'btn-danger' : 'btn-success'}`}>
                    {selectedUser.canWithdraw ? 'Disable Withdrawal' : 'Enable Withdrawal'}
                  </button>
                  <button onClick={handleUnlockWithdrawal} className="btn btn-primary">
                    Unlock Withdrawal Details
                  </button>
                  <button onClick={handleResetAccount} className="btn btn-danger">
                    Reset Account
                  </button>
                </div>
              </div>

              {/* USER REVIEWS SECTION */}
              <div className="detail-section">
                <h3>User Reviews ({selectedUserReviews.length})</h3>
                {selectedUserReviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedUserReviews.map(review => (
                      <div key={review._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <p><strong>Product:</strong> {review.productId?.name || 'N/A'}</p>
                        <p><strong>Commission:</strong> ${review.commission?.toFixed(2) || '0.00'}</p>
                        <p><strong>Status:</strong> {review.status}</p>
                        <p><strong>Special:</strong> {review.isSpecial ? 'Yes' : 'No'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* USER WITHDRAWALS SECTION */}
              <div className="detail-section">
                <h3>User Withdrawals ({selectedUserWithdrawals.length})</h3>
                {selectedUserWithdrawals.length === 0 ? (
                  <p>No withdrawal requests.</p>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedUserWithdrawals.map(withdrawal => (
                      <div key={withdrawal._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <p><strong>Amount:</strong> ${withdrawal.amount?.toFixed(2) || '0.00'}</p>
                        <p><strong>Status:</strong> {withdrawal.status}</p>
                        <p><strong>Currency:</strong> {withdrawal.currency}</p>
                        <p><strong>Network:</strong> {withdrawal.network}</p>
                        <p><strong>Wallet:</strong> {withdrawal.walletAddress}</p>
                        <p><strong>Date:</strong> {new Date(withdrawal.requestedAt).toLocaleString()}</p>
                        {withdrawal.status === 'pending' && (
                          <div className="button-group" style={{ marginTop: '10px' }}>
                            <button
                              onClick={() => handleUpdateWithdrawal(withdrawal._id, 'processed', 'Approved by admin')}
                              className="btn btn-success"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateWithdrawal(withdrawal._id, 'cancelled', 'Rejected by admin')}
                              className="btn btn-danger"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <div style={{ marginTop: '40px', background: 'white', padding: '20px', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Products ({products.length})</h2>
          <button onClick={() => setShowProductForm(!showProductForm)} className="btn btn-primary">
            {showProductForm ? 'Hide Form' : 'Add Product'}
          </button>
        </div>

        {showProductForm && (
          <div className="product-form" style={{ marginBottom: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Enter product description"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Main Image URL</label>
              <input
                type="text"
                value={productForm.mainImage}
                onChange={(e) => setProductForm({ ...productForm, mainImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label>Additional Images (comma-separated URLs)</label>
              <input
                type="text"
                value={productForm.additionalImages}
                onChange={(e) => setProductForm({ ...productForm, additionalImages: e.target.value })}
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              />
            </div>
            <button onClick={handleAddProduct} className="btn btn-success">
              Add Product
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {products.map(product => (
            <div key={product._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              {product.mainImage && (
                <img
                  src={product.mainImage}
                  alt={product.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }}
                />
              )}
              <h4>{product.name}</h4>
              <p style={{ fontSize: '14px', color: '#666' }}>{product.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ALL WITHDRAWALS SECTION */}
      <div style={{ marginTop: '40px', background: 'white', padding: '20px', borderRadius: '10px' }}>
        <h2>All Withdrawal Requests ({withdrawals.length})</h2>
        {withdrawals.length === 0 ? (
          <p>No withdrawal requests.</p>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {withdrawals.map(withdrawal => (
              <div key={withdrawal._id} style={{ padding: '15px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                <p><strong>User:</strong> {withdrawal.userId?.username || 'N/A'} ({withdrawal.userId?.email || 'N/A'})</p>
                <p><strong>Amount:</strong> ${withdrawal.amount?.toFixed(2) || '0.00'}</p>
                <p><strong>Status:</strong> <span style={{ 
                  padding: '3px 10px', 
                  borderRadius: '5px', 
                  background: withdrawal.status === 'pending' ? '#fff3cd' : withdrawal.status === 'processed' ? '#d4edda' : '#f8d7da',
                  color: withdrawal.status === 'pending' ? '#856404' : withdrawal.status === 'processed' ? '#155724' : '#721c24'
                }}>{withdrawal.status}</span></p>
                <p><strong>Currency:</strong> {withdrawal.currency} ({withdrawal.network})</p>
                <p><strong>Wallet:</strong> {withdrawal.walletAddress}</p>
                <p><strong>Date:</strong> {new Date(withdrawal.requestedAt).toLocaleString()}</p>
                {withdrawal.adminNotes && <p><strong>Admin Notes:</strong> {withdrawal.adminNotes}</p>}
                {withdrawal.status === 'pending' && (
                  <div className="button-group" style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => handleUpdateWithdrawal(withdrawal._id, 'processed', 'Approved by admin')}
                      className="btn btn-success"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateWithdrawal(withdrawal._id, 'cancelled', 'Rejected by admin')}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;