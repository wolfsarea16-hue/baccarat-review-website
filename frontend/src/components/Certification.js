// frontend/src/components/Certification.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import logo from '../assets/baccarat-logo.svg';
import './Certification.css';

function Certification() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Prevent right-click on image
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  return (
    <div className="page-with-sidebar certification-page">
      <Sidebar />
      <div className="main-content">
        <div className="certification-container">
          {/* Header with Logo */}
          <div className="certification-header">
            <img
              src={logo}
              alt="Logo"
              className="certification-logo"
              loading="lazy"
            />
            <h1>Certification</h1>
          </div>

          {/* Certificate Image - Click to view */}
          <div className="certification-image-wrapper">
            <img
              src="/cert.jpg"
              alt="Certification"
              className="certification-image"
              onClick={openModal}
              onContextMenu={handleContextMenu}
              style={{ cursor: 'pointer' }}
              loading="lazy"
            />
            <p className="click-hint">Click to view full size</p>
          </div>

          {/* Modal for full-size view */}
          {isModalOpen && (
            <div className="cert-modal" onClick={closeModal}>
              <div className="cert-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="cert-modal-close" onClick={closeModal}>✕</button>
                <img
                  src="/cert.jpg"
                  alt="Certification Full Size"
                  className="cert-modal-image"
                  onContextMenu={handleContextMenu}
                  draggable="false"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Certification;