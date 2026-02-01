// frontend/src/admin/SubAdminTab.js
import React, { useState, useEffect } from 'react';
import { subAdminAPI } from '../services/api';

function SubAdminTab() {
    const [subAdmins, setSubAdmins] = useState([]);
    const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
    const [activities, setActivities] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Create form state
    const [createForm, setCreateForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        permissions: {
            canEditGroupLinks: false,
            canAdjustBalance: false,
            canSetTargetBalance: false,
            canAssignSpecialReviews: false,
            canViewWithdrawalHistory: false,
            canSetTestingAccount: false,
            canChangePassword: false,
            canProcessWithdrawals: false
        }
    });

    // Password change form
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchSubAdmins();
    }, []);

    const fetchSubAdmins = async () => {
        try {
            const response = await subAdminAPI.getAll();
            setSubAdmins(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching sub-admins:', err);
            setSubAdmins([]);
            setLoading(false);
        }
    };

    const handleSelectSubAdmin = async (subAdmin) => {
        setSelectedSubAdmin(subAdmin);

        // Fetch activities for this sub-admin
        try {
            const response = await subAdminAPI.getActivities(subAdmin._id);
            setActivities(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching activities:', err);
            setActivities([]);
        }
    };

    const handleCreateSubAdmin = async () => {
        // Validation
        if (!createForm.username || !createForm.password) {
            alert('Username and password are required');
            return;
        }

        if (createForm.password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        if (createForm.password !== createForm.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            await subAdminAPI.create({
                username: createForm.username,
                password: createForm.password,
                permissions: createForm.permissions
            });

            alert('Sub-admin created successfully!');
            setCreateForm({
                username: '',
                password: '',
                confirmPassword: '',
                permissions: {
                    canEditGroupLinks: false,
                    canAdjustBalance: false,
                    canSetTargetBalance: false,
                    canAssignSpecialReviews: false,
                    canViewWithdrawalHistory: false,
                    canSetTestingAccount: false,
                    canChangePassword: false,
                    canProcessWithdrawals: false
                }
            });
            setShowCreateForm(false);
            fetchSubAdmins();
        } catch (err) {
            console.error('Error creating sub-admin:', err);
            alert(err.response?.data?.message || 'Failed to create sub-admin');
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (!window.confirm('Are you sure you want to change this sub-admin\'s password?')) {
            return;
        }

        try {
            await subAdminAPI.changePassword(selectedSubAdmin._id, passwordForm.newPassword);
            alert('Password changed successfully!');
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error('Error changing password:', err);
            alert('Failed to change password');
        }
    };

    const handleToggleStatus = async () => {
        try {
            await subAdminAPI.toggleStatus(selectedSubAdmin._id);
            alert(`Sub-admin ${selectedSubAdmin.isActive ? 'disabled' : 'enabled'} successfully!`);
            fetchSubAdmins();

            // Update selected sub-admin
            const updated = subAdmins.find(sa => sa._id === selectedSubAdmin._id);
            if (updated) {
                setSelectedSubAdmin({ ...updated, isActive: !updated.isActive });
            }
        } catch (err) {
            console.error('Error toggling status:', err);
            alert('Failed to toggle status');
        }
    };

    const handleUpdatePermissions = async () => {
        try {
            await subAdminAPI.updatePermissions(selectedSubAdmin._id, selectedSubAdmin.permissions);
            alert('Permissions updated successfully!');
            fetchSubAdmins();
        } catch (err) {
            console.error('Error updating permissions:', err);
            alert('Failed to update permissions');
        }
    };

    const formatActionType = (actionType) => {
        const types = {
            'balance_adjust': 'Balance Adjustment',
            'target_balance': 'Target Balance',
            'special_review': 'Special Review',
            'group_link': 'Group Link Update',
            'user_update': 'User Update',
            'testing_account': 'Set Testing Account',
            'change_password': 'Password Change',
            'process_withdrawal': 'Process Withdrawal'
        };
        return types[actionType] || actionType;
    };

    const formatActivityDetails = (activity) => {
        switch (activity.actionType) {
            case 'balance_adjust':
                return `${activity.details.operation === 'add' ? 'Added' : 'Subtracted'} $${activity.details.amount}`;
            case 'target_balance':
                return `Set target to $${activity.details.targetBalance}`;
            case 'special_review':
                return `Position ${activity.details.position}, Amount: $${activity.details.negativeAmount}`;
            case 'group_link':
                return `Updated to: ${activity.details.groupLink || 'N/A'}`;
            case 'testing_account':
                return 'Set account as testing account ($525 balance + exclusive audit)';
            case 'change_password':
                return 'Changed user password';
            case 'process_withdrawal':
                return `Updated withdrawal status to: ${activity.details.status}`;
            default:
                return JSON.stringify(activity.details);
        }
    };

    if (loading) {
        return <div className="loading">Loading sub-admins...</div>;
    }

    return (
        <div className="subadmin-tab">
            <div className="subadmin-header">
                <h2>Sub-Admin Management</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="btn btn-primary"
                >
                    {showCreateForm ? 'Cancel' : 'Create New Sub-Admin'}
                </button>
            </div>

            {showCreateForm && (
                <div className="create-subadmin-form detail-section">
                    <h3>Create New Sub-Admin</h3>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={createForm.username}
                            onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                            placeholder="Enter username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={createForm.password}
                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            placeholder="Enter password (min 6 characters)"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={createForm.confirmPassword}
                            onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                            placeholder="Confirm password"
                        />
                    </div>

                    <div className="permissions-section">
                        <h4>Permissions</h4>
                        <div className="permissions-grid">
                            <label className="permission-checkbox">
                                <input
                                    type="checkbox"
                                    checked={createForm.permissions.canEditGroupLinks}
                                    onChange={(e) => setCreateForm({
                                        ...createForm,
                                        permissions: { ...createForm.permissions, canEditGroupLinks: e.target.checked }
                                    })}
                                />
                                <span>Can Edit Group Links</span>
                            </label>

                            <label className="permission-checkbox">
                                <input
                                    type="checkbox"
                                    checked={createForm.permissions.canAdjustBalance}
                                    onChange={(e) => setCreateForm({
                                        ...createForm,
                                        permissions: { ...createForm.permissions, canAdjustBalance: e.target.checked }
                                    })}
                                />
                                <span>Can Adjust Balance</span>
                            </label>

                            <label className="permission-checkbox">
                                <input
                                    type="checkbox"
                                    checked={createForm.permissions.canSetTargetBalance}
                                    onChange={(e) => setCreateForm({
                                        ...createForm,
                                        permissions: { ...createForm.permissions, canSetTargetBalance: e.target.checked }
                                    })}
                                />
                                <span>Can Set Target Balance</span>
                            </label>

                            <label className="permission-checkbox">
                                <input
                                    type="checkbox"
                                    checked={createForm.permissions.canAssignSpecialReviews}
                                    onChange={(e) => setCreateForm({
                                        ...createForm,
                                        permissions: { ...createForm.permissions, canAssignSpecialReviews: e.target.checked }
                                    })}
                                />
                                <span>Can Assign Special Reviews</span>
                            </label>

                            <label className="permission-checkbox">
                                <input
                                    type="checkbox"
                                    checked={createForm.permissions.canViewWithdrawalHistory}
                                    onChange={(e) => setCreateForm({
                                        ...createForm,
                                        permissions: { ...createForm.permissions, canViewWithdrawalHistory: e.target.checked }
                                    })}
                                />
                                <span>Can View Withdrawal History</span>
                            </label>

                            <label className="permission-checkbox">
                                <input
                                    type="checkbox"
                                    checked={createForm.permissions.canSetTestingAccount}
                                    onChange={(e) => setCreateForm({
                                        ...createForm,
                                        permissions: { ...createForm.permissions, canSetTestingAccount: e.target.checked }
                                    })}
                                />
                                <span>Can Set Testing Account</span>
                            </label>

                            <label className="permission-checkbox">
                                <input
                                    type="checkbox"
                                    checked={createForm.permissions.canChangePassword}
                                    onChange={(e) => setCreateForm({
                                        ...createForm,
                                        permissions: { ...createForm.permissions, canChangePassword: e.target.checked }
                                    })}
                                />
                                <span>Can Change User Password</span>
                            </label>

                            <label className="permission-checkbox">
                                <input
                                    type="checkbox"
                                    checked={createForm.permissions.canProcessWithdrawals}
                                    onChange={(e) => setCreateForm({
                                        ...createForm,
                                        permissions: { ...createForm.permissions, canProcessWithdrawals: e.target.checked }
                                    })}
                                />
                                <span>Can Process Withdrawals</span>
                            </label>
                        </div>
                    </div>

                    <button onClick={handleCreateSubAdmin} className="btn btn-success">
                        Create Sub-Admin
                    </button>
                </div>
            )}

            <div className="subadmin-content">
                {/* Sub-Admins List */}
                <div className="subadmins-list">
                    <h3>Sub-Admins ({subAdmins.length})</h3>
                    <div className="subadmins-table">
                        {subAdmins.length === 0 ? (
                            <p>No sub-admins created yet.</p>
                        ) : (
                            subAdmins.map((subAdmin, index) => (
                                <div
                                    key={subAdmin._id}
                                    className={`subadmin-row ${selectedSubAdmin?._id === subAdmin._id ? 'selected' : ''} ${!subAdmin.isActive ? 'disabled' : ''}`}
                                    onClick={() => handleSelectSubAdmin(subAdmin)}
                                >
                                    <span className="subadmin-number">{index + 1}.</span>
                                    <div className="subadmin-info">
                                        <strong>{subAdmin.username}</strong>
                                        <span>Created: {new Date(subAdmin.createdAt).toLocaleDateString()}</span>
                                        {!subAdmin.isActive && <span className="status-badge disabled">DISABLED</span>}
                                        {subAdmin.isActive && <span className="status-badge active">ACTIVE</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sub-Admin Details */}
                <div className="subadmin-details">
                    {!selectedSubAdmin ? (
                        <p>Select a sub-admin to view details</p>
                    ) : (
                        <>
                            {/* Basic Info */}
                            <div className="detail-section">
                                <h3>Sub-Admin Information</h3>
                                <p><strong>Username:</strong> {selectedSubAdmin.username}</p>
                                <p><strong>Status:</strong> {selectedSubAdmin.isActive ? 'Active' : 'Disabled'}</p>
                                <p><strong>Created:</strong> {new Date(selectedSubAdmin.createdAt).toLocaleString()}</p>
                            </div>

                            {/* Permissions */}
                            <div className="detail-section">
                                <h3>Permissions</h3>
                                <div className="permissions-grid">
                                    <label className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubAdmin.permissions?.canEditGroupLinks || false}
                                            onChange={(e) => setSelectedSubAdmin({
                                                ...selectedSubAdmin,
                                                permissions: { ...selectedSubAdmin.permissions, canEditGroupLinks: e.target.checked }
                                            })}
                                        />
                                        <span>Can Edit Group Links</span>
                                    </label>

                                    <label className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubAdmin.permissions?.canAdjustBalance || false}
                                            onChange={(e) => setSelectedSubAdmin({
                                                ...selectedSubAdmin,
                                                permissions: { ...selectedSubAdmin.permissions, canAdjustBalance: e.target.checked }
                                            })}
                                        />
                                        <span>Can Adjust Balance</span>
                                    </label>

                                    <label className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubAdmin.permissions?.canSetTargetBalance || false}
                                            onChange={(e) => setSelectedSubAdmin({
                                                ...selectedSubAdmin,
                                                permissions: { ...selectedSubAdmin.permissions, canSetTargetBalance: e.target.checked }
                                            })}
                                        />
                                        <span>Can Set Target Balance</span>
                                    </label>

                                    <label className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubAdmin.permissions?.canAssignSpecialReviews || false}
                                            onChange={(e) => setSelectedSubAdmin({
                                                ...selectedSubAdmin,
                                                permissions: { ...selectedSubAdmin.permissions, canAssignSpecialReviews: e.target.checked }
                                            })}
                                        />
                                        <span>Can Assign Special Reviews</span>
                                    </label>

                                    <label className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubAdmin.permissions?.canViewWithdrawalHistory || false}
                                            onChange={(e) => setSelectedSubAdmin({
                                                ...selectedSubAdmin,
                                                permissions: { ...selectedSubAdmin.permissions, canViewWithdrawalHistory: e.target.checked }
                                            })}
                                        />
                                        <span>Can View Withdrawal History</span>
                                    </label>

                                    <label className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubAdmin.permissions?.canSetTestingAccount || false}
                                            onChange={(e) => setSelectedSubAdmin({
                                                ...selectedSubAdmin,
                                                permissions: { ...selectedSubAdmin.permissions, canSetTestingAccount: e.target.checked }
                                            })}
                                        />
                                        <span>Can Set Testing Account</span>
                                    </label>

                                    <label className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubAdmin.permissions?.canChangePassword || false}
                                            onChange={(e) => setSelectedSubAdmin({
                                                ...selectedSubAdmin,
                                                permissions: { ...selectedSubAdmin.permissions, canChangePassword: e.target.checked }
                                            })}
                                        />
                                        <span>Can Change User Password</span>
                                    </label>

                                    <label className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubAdmin.permissions?.canProcessWithdrawals || false}
                                            onChange={(e) => setSelectedSubAdmin({
                                                ...selectedSubAdmin,
                                                permissions: { ...selectedSubAdmin.permissions, canProcessWithdrawals: e.target.checked }
                                            })}
                                        />
                                        <span>Can Process Withdrawals</span>
                                    </label>
                                </div>
                                <button onClick={handleUpdatePermissions} className="btn btn-primary" style={{ marginTop: '10px' }}>
                                    Update Permissions
                                </button>
                            </div>

                            {/* Change Password */}
                            <div className="detail-section">
                                <h3>Change Password</h3>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        placeholder="Enter new password (min 6 characters)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <button onClick={handleChangePassword} className="btn btn-primary">
                                    Change Password
                                </button>
                            </div>

                            {/* Account Actions */}
                            <div className="detail-section">
                                <h3>Account Actions</h3>
                                <button
                                    onClick={handleToggleStatus}
                                    className={`btn ${selectedSubAdmin.isActive ? 'btn-danger' : 'btn-success'}`}
                                >
                                    {selectedSubAdmin.isActive ? 'Disable Account' : 'Enable Account'}
                                </button>
                            </div>

                            {/* Activity History */}
                            <div className="detail-section">
                                <h3>Activity History ({activities.length})</h3>
                                {activities.length === 0 ? (
                                    <p>No activities yet.</p>
                                ) : (
                                    <div className="activity-timeline">
                                        {activities.map((activity, index) => (
                                            <div key={index} className="activity-item">
                                                <div className="activity-header">
                                                    <strong>{formatActionType(activity.actionType)}</strong>
                                                    <span className="activity-time">
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="activity-details">
                                                    <p><strong>User:</strong> {activity.targetUsername}</p>
                                                    <p><strong>Details:</strong> {formatActivityDetails(activity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SubAdminTab;
