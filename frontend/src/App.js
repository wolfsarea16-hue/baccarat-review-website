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
import TermsAndConditions from './components/TermsAndConditions';
import AboutUs from './components/AboutUs';
import Forum from './components/Forum';
import FAQ from './components/FAQ';
import AdminLogin from './admin/AdminLogin';
import AdminDashboardWrapper from './admin/AdminDashboardWrapper';
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

  if (!token || (role !== 'admin' && role !== 'subadmin')) {
    return <Navigate to="/manage/login" replace />;
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
          <Route path="/terms" element={
            <ProtectedRoute>
              <TermsAndConditions />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          } />
          <Route path="/forum" element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          } />
          <Route path="/faq" element={
            <ProtectedRoute>
              <FAQ />
            </ProtectedRoute>
          } />

          {/* Diagnostic Route */}
          <Route path="/check" element={<div style={{ padding: '50px', textAlign: 'center' }}><h1>✅ App is running!</h1></div>} />

          {/* Admin Routes */}
          <Route path="/manage/login" element={<AdminLogin />} />
          <Route path="/manage/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboardWrapper />
            </AdminProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;