// frontend/src/components/Landing.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Background Video */}
      <video
        className="landing-bg-video"
        src="/homebcc.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Overlay */}
      <div className="landing-overlay" />

      {/* Content */}
      <div className="landing-container">
        <div className="landing-logo">
          <img src="/baccarat-logo.svg" alt="Logo" />
        </div>

        <h1 className="landing-title">Welcome to Baccarat</h1>
        <p className="landing-subtitle"></p>

        <div className="landing-buttons">
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary btn-large"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="btn btn-secondary btn-large"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;