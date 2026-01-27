// frontend/src/components/Modal.js
import React from 'react';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'alert', // 'alert' (one button) or 'confirm' (two buttons)
    confirmText = 'Confirm',
    cancelText = 'Close',
    image = '/modal-success.png', // default image path
    isLogo = false, // new prop to trigger 3d animation
    logoOnly = false // new prop to hide all UI except logo
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${logoOnly ? 'logo-only' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-image-section">
                    {isLogo ? (
                        <div className="modal-logo-container">
                            <img src={image} alt="Rotating Logo" className="modal-logo-3d" />
                        </div>
                    ) : (
                        <img src={image} alt="Modal Header" />
                    )}
                </div>

                <div className="modal-body-section">
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>

                <div className="modal-footer-section">
                    {type === 'confirm' ? (
                        <>
                            <button className="btn-modal-cancel" onClick={onClose}>
                                {cancelText}
                            </button>
                            <button className="btn-modal-confirm" onClick={onConfirm}>
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button className="btn-modal-confirm" style={{ width: '100%' }} onClick={onClose}>
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
