import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassSurface from './GlassSurface';
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
          <GlassSurface
            width={200}
            height={60}
            borderRadius={50}
            brightness={60}
            opacity={0.6}
            blur={12}
            borderWidth={0.1}
            className="landing-glass-btn"
          >
            <div
              className="landing-glass-content login"
              onClick={() => navigate('/login')}
            >
              Login
            </div>
          </GlassSurface>

          <GlassSurface
            width={200}
            height={60}
            borderRadius={50}
            brightness={60}
            opacity={0.4}
            blur={12}
            borderWidth={0.1}
            className="landing-glass-btn"
          >
            <div
              className="landing-glass-content signup"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </div>
          </GlassSurface>
        </div>
      </div>
    </div>
  );
}

export default Landing;