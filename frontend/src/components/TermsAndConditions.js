import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import logo from '../assets/baccarat-logo.svg';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
    const navigate = useNavigate();
    const terms = [
        "The Platform will keep all member's information confidential in accordance with the Privacy Policy and Applicable Data Protection Law, and strictly comply with local personal information protection laws.",
        "Every new member needs to add $23 to validate their account.",
        "Please do not disclose your account password to others. Our platform will not be held responsible for any losses caused.",
        "Exclusive audits are randomly allocated by the system and once an audit has been accepted and allocated by the system, any changes, cancellations or abandonment of auditing are strictly not allowed.",
        "Any attempt to disrupt the operation of the platform and it's peaceful working environment will not be tolerated. We will pursue legal responsibility, claim compensation for all losses and defend the reputation and interests of the platform to eliminate any potential dangers on the platform.",
        "Please confirm the recharge address with the Customer Support agent before transferring the money to avoid any loss to members.",
        "All current withdrawal requests will be canceled when a member receives the Newcomer's Reward",
        "When making a deposit, it's crucial to double-check the recipient address and ensure that it is correct before initiating the transaction. Transactions made to incorrect addresses are often irreversible, and the funds may be lost permanently.",
        "Once a member's application applied for extension, it may affect the reputation points of your account.",
        "Once a members account is frozen, the platform will decide the eligibility for unfreezing.",
        "A balance of less than $50 is not allowed to start auditing, members should ensure that they have a balance of $50 before starting audits.",
        "Bank withdraw is only available for higher tiers.",
        "To provide you with a higher quality of service, when your account balance reaches the specified amount, the system will automatically upgrade your membership level.",
        "If a member fails to provide compliant information or complete verification within the specified time, the withdrawal request will be rejected outright.",
        "Members need to complete 33 audits to be eligible for withdrawal.",
        "Members must take responsibility for the confidentiality of their platform account and password. The platform will not compensate for any losses caused by member's negligence.",
        "Members must reconfirm withdrawal information with Customer Support after submitting a withdrawal request and should receive the total withdrawal amount in the same day after the withdrawal request is approved.",
        "The platform will implement identity verification procedures as mandated by local government anti-money laundering and anti-terrorism financing regulations, prohibiting any member's fraudulent and abusive account activities, and member must strictly comply with local and international laws, including tax and foreign exchange regulations.",
        "If a member fails to complete auditing of all products in the account on time and does not provide a reasonable explanation or notify the Customer Support in time, the platform reserves the right to take necessary measures, including temporary account freezing, demanding a security deposit, or taking legal action to pursue personal negligence responsibility.",
        "If you need to turn off membership upgrade privileges, you must go to Customer Support and request that this privilege be turned off before you begin auditing.",
        "The platform reserves the right to update these rules as necessary to ensure compliance with legal regulations and market practices. Any changes will be notified to members in advance through announcements and email"
    ];

    return (
        <div className="page-with-sidebar terms-page">
            <Sidebar />
            <div className="main-content">
                <div className="terms-container">
                    <div className="terms-header">
                        <img
                            src={logo}
                            alt="Logo"
                            className="terms-logo"
                            loading="lazy"
                        />
                        <h1>Terms & Conditions</h1>
                    </div>

                    <div className="terms-content">
                        <ul className="terms-list">
                            {terms.map((term, index) => (
                                <li key={index} className="terms-item">
                                    {term}
                                </li>
                            ))}
                        </ul>

                        <div className="terms-footer">
                            <p>
                                Dear Member, Kindly read our rules declaration carefully and thank you for your cooperation.
                                If you do not understand anything, please contact Customer Support for information.
                            </p>
                        </div>
                    </div>

                    {/* Footer - Copyright Part matching FAQ */}
                    <div className="terms-page-footer">
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

export default TermsAndConditions;
