// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Profile from './components/Profile';
import ReviewTab from './components/ReviewTab';
import ProductReview from './components/ProductReview';
import History from './components/History';
import Withdrawal from './components/Withdrawal';
import WithdrawalHistory from './components/WithdrawalHistory';
import Certification from './components/Certification';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token || role !== 'user') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      console.log('User session restored:', role);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected User Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/review" element={
            <ProtectedRoute>
              <ReviewTab />
            </ProtectedRoute>
          } />
          <Route path="/review/product" element={
            <ProtectedRoute>
              <ProductReview />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/withdrawal" element={
            <ProtectedRoute>
              <Withdrawal />
            </ProtectedRoute>
          } />
          <Route path="/withdrawal-history" element={
            <ProtectedRoute>
              <WithdrawalHistory />
            </ProtectedRoute>
          } />
          <Route path="/certification" element={
            <ProtectedRoute>
              <Certification />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;