import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './admin/AdminLogin';
import AdminDashboardWrapper from './admin/AdminDashboardWrapper';
import './App.css';

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || (role !== 'admin' && role !== 'subadmin')) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Admin Routes */}
                    <Route path="/" element={<AdminLogin />} />
                    <Route path="/dashboard" element={
                        <AdminProtectedRoute>
                            <AdminDashboardWrapper />
                        </AdminProtectedRoute>
                    } />

                    {/* Redirect any other path to login */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
