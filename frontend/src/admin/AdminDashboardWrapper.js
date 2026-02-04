// frontend/src/admin/AdminDashboardWrapper.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import SubAdminTab from './SubAdminTab';
import './Admin.css';

function AdminDashboardWrapper() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');

    // Get user role from localStorage
    const userRole = localStorage.getItem('role');
    const isSuperAdmin = userRole === 'admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/manage/login');
    };

    return (
        <div className="admin-dashboard-wrapper">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                </button>
            </div>

            {/* Tab Navigation - Only show for super admin */}
            {isSuperAdmin && (
                <div className="tab-navigation">
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'subadmins' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subadmins')}
                    >
                        Sub-Admins
                    </button>
                </div>
            )}

            {/* Render content based on active tab */}
            {activeTab === 'subadmins' && isSuperAdmin ? (
                <SubAdminTab />
            ) : (
                <AdminDashboard hideHeader={true} />
            )}
        </div>
    );
}

export default AdminDashboardWrapper;
