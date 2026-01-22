// frontend/src/components/FAQ.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import logo from '../assets/baccarat-logo.svg';
import './FAQ.css';

const FAQ = () => {
    const navigate = useNavigate();

    const faqSections = [
        {
            title: "REGISTRATION",
            icon: "📝",
            content: "Members must register an account to browse and start reviewing. Members must provide accurate, complete and current information. To make amends or update your information, please contact the customer support."
        },
        {
            title: "ACCOUNT SECURITY",
            icon: "🔒",
            content: "Members are responsible for maintaining account confidentiality. Any unauthorized use of an account must be reported immediately."
        },
        {
            title: "RECHARGE",
            icon: "💳",
            content: [
                "For each recharge, please redirect to the Customer Support for assistance.",
                "We accept recharges via cryptocurrencies and other methods listed at the time of recharge.",
                "We are not responsible for recharge processing delays cause by financial institutions.",
                "Once you remit the funds to the account provided by the platform's Customer Support, kindly provide a screenshot of the successful transfer. To ensure immediate recharge recognition, please verify the wallet address be matched with the provided details.",
                "If you encounter any issues during the recharge process, contact the Customer Support recharge service. Due to frequent updates, always check the platform's recharge details before proceeding to recharge.",
                "For more inquiries, please refer to the platform's Customer Support."
            ]
        },
        {
            title: "PRODUCT REVIEWING",
            icon: "⭐",
            content: [
                "Once recharged, you may start reviewing, click 'Start Reviewing' or 'Reviews' on the sidebar to redirect to the relevant page to start.",
                "Wait for the system to assign a review, complete the review and submit the review. Once the member receives a review, the system automatically confirms it and cannot cancel any pending review."
            ]
        },
        {
            title: "WITHDRAWAL",
            icon: "💰",
            content: "Before proceed to withdrawal, kindly bind your withdrawal information on the platform. Withdraw your funds from the Withdrawal page. Withdrawal time is from 11:00 to 22:45 daily."
        },
        {
            title: "AGENT",
            icon: "👥",
            content: "Members can become platform agents by recommending new users, and will be entitled to dynamic reward of daily 30% commission for referrals."
        }
    ];

    return (
        <div className="page-with-sidebar faq-page">
            <Sidebar />
            <div className="main-content">
                <div className="faq-container">
                    <div className="faq-header">
                        <img
                            src={logo}
                            alt="Baccarat Logo"
                            className="faq-logo"
                            loading="lazy"
                        />
                        <h1>FAQ</h1>
                    </div>

                    <div className="faq-content">
                        {faqSections.map((section, index) => (
                            <div key={index} className="faq-section">
                                <div className="faq-section-header">
                                    <div className="faq-header-left">
                                        <span className="faq-icon">{section.icon}</span>
                                        <h2>{section.title}</h2>
                                    </div>
                                    <img
                                        src="/bcc-small.png"
                                        alt="Baccarat"
                                        className="faq-header-logo"
                                    />
                                </div>
                                <div className="faq-section-content">
                                    {Array.isArray(section.content) ? (
                                        section.content.map((paragraph, pIndex) => (
                                            <p key={pIndex}>{paragraph}</p>
                                        ))
                                    ) : (
                                        <p>{section.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="faq-footer">
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
        </div>
    );
};

export default FAQ;
