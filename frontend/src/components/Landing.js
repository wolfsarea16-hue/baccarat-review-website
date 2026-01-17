// frontend/src/components/Landing.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Preload video
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/homebcc.mp4';
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setVideoLoaded(true);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Background Video - Only load when ready */}
      {videoLoaded && (
        <video
          className="landing-bg-video"
          src="/homebcc.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      )}

      {/* Fallback background if video not loaded yet */}
      {!videoLoaded && (
        <div className="landing-bg-fallback" />
      )}

      {/* Overlay */}
      <div className="landing-overlay" />

      {/* Content */}
      <div className="landing-container">
        <div className="landing-logo">
          <img
            src="/baccarat-logo.svg"
            alt="Logo"
            loading="lazy"
          />
        </div>

        <h1 className="landing-title">Welcome to Baccarat</h1>
        <p className="landing-subtitle">Because excellence deserves a verdict</p>

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