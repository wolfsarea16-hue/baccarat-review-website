// frontend/src/admin/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, subAdminAPI } from '../services/api';
import './Admin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try super admin login first
      const response = await authAPI.adminLogin(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('username', response.data.username || 'admin');
      localStorage.removeItem('permissions');
      navigate('/admin/dashboard');
    } catch (adminErr) {
      // If super admin login fails, try sub-admin login
      try {
        const response = await subAdminAPI.login(formData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', 'subadmin');
        localStorage.setItem('username', response.data.username || 'subadmin');
        localStorage.setItem('permissions', JSON.stringify(response.data.permissions || {}));
        navigate('/admin/dashboard');
      } catch (subAdminErr) {
        setError('Invalid username or password');
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-logo">
          <img src="/baccarat-logo.svg" alt="Logo" />
        </div>
        <h2>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;