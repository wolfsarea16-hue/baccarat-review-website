// frontend/src/components/Forum.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import logo from '../assets/baccarat-logo.svg';
import './Forum.css';
import api from '../services/api';

function Forum() {
    const navigate = useNavigate();
    const [groupLink, setGroupLink] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroupLink();
    }, []);

    const fetchGroupLink = async () => {
        try {
            const response = await api.get('/user/group-link');
            setGroupLink(response.data.groupLink || '');
        } catch (err) {
            console.error('Error fetching group link:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClick = () => {
        if (groupLink) {
            window.open(groupLink, '_blank');
        } else {
            alert('Group link not available. Please contact support.');
        }
    };

    return (
        <div className="forum-page">
            <Sidebar />

            <div className="forum-container">
                <div className="forum-content">
                    {/* Header */}
                    <div className="forum-header">
                        <h1 className="forum-title">Forum</h1>
                    </div>

                    {/* Logo */}
                    <div className="forum-logo-container">
                        <img src={logo} alt="Baccarat Logo" className="forum-logo" />
                    </div>

                    {/* Main Content */}
                    <div className="forum-main">
                        {/* Ghosted 01 Background */}
                        <div className="ghosted-number">01</div>

                        {/* Baccarat Elites Section */}
                        <div className="forum-elites">
                            <h2 className="elites-title">Baccarat Elites</h2>
                            <p className="elites-subtitle">A members only group</p>
                        </div>

                        {/* Join Button */}
                        <button
                            className="forum-join-btn"
                            onClick={handleJoinClick}
                            disabled={!groupLink || loading}
                        >
                            Join
                        </button>

                        {/* Description */}
                        <p className="forum-description">
                            Discuss the brand, verified reviews, and insider insights, all in one place
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="forum-footer">
                    <p className="copyright">Copyright ©2026 Baccarat. All rights reserved</p>
                    <div className="footer-links">
                        <button onClick={() => navigate('/home')}>Home</button>
                        <button onClick={() => navigate('/about')}>About Us</button>
                        <button onClick={() => navigate('/terms')}>T&C</button>
                        <button onClick={() => navigate('/faq')}>FAQ</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Forum;
