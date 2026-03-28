import React from 'react';
import { Link } from 'react-router-dom';
import './HealthNWealth.css';

const HealthNWealthPrivacyPolicy = () => {
  return (
    <div className="healthnwealth">
      <section className="hnw-hero">
        <div className="hnw-hero-content">
          <h1>Privacy Policy</h1>
          <p className="hnw-hero-tagline">Health N Wealth</p>
          <p className="hnw-hero-sub">Last Updated: March 2026</p>
          <div className="hnw-hero-buttons">
            <Link to="/healthnwealth" className="hnw-link-btn">Back to Health N Wealth</Link>
          </div>
        </div>
      </section>

      <section className="hnw-privacy-section">
        <div className="container">
          <div className="hnw-privacy-content">
            <p className="hnw-privacy-intro">
              Health N Wealth ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
            </p>

            <div className="hnw-privacy-block">
              <h2>1. Information We Collect</h2>
              <h3>Personal Information:</h3>
              <ul>
                <li>Name and contact details (phone number, email address)</li>
                <li>Location data (city/district for finding nearby hospitals)</li>
                <li>Health package booking history and preferences</li>
                <li>Payment transaction details (processed securely via Razorpay)</li>
                <li>Device information and push notification tokens</li>
              </ul>
              <h3>We do NOT collect:</h3>
              <ul>
                <li>Health records or medical history</li>
                <li>Biometric data</li>
                <li>Photos or camera data</li>
                <li>Contacts or address book data</li>
              </ul>
            </div>

            <div className="hnw-privacy-block">
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our health package booking services</li>
                <li>Process payments securely through our payment partner (Razorpay)</li>
                <li>Send booking confirmations and updates via push notifications</li>
                <li>Improve and personalise your experience</li>
                <li>Detect and prevent fraudulent transactions</li>
                <li>Communicate service updates and support responses</li>
              </ul>
            </div>

            <div className="hnw-privacy-block">
              <h2>3. Data Storage and Security</h2>
              <p>Your data is stored securely using Supabase, which provides:</p>
              <ul>
                <li>End-to-end encryption for data in transit (TLS 1.2+)</li>
                <li>Encryption at rest for stored data</li>
                <li>Row-level security policies for data access control</li>
                <li>Regular security audits and compliance monitoring</li>
              </ul>
              <p>Payment information is processed by Razorpay and is never stored on our servers. Razorpay is PCI DSS Level 1 compliant.</p>
            </div>

            <div className="hnw-privacy-block">
              <h2>4. Data Sharing</h2>
              <p>We do not sell your personal information. We share data only with:</p>
              <ul>
                <li>Hospital partners (name and contact for booking fulfilment)</li>
                <li>Razorpay (payment processing only)</li>
                <li>Supabase (secure data storage)</li>
              </ul>
            </div>

            <div className="hnw-privacy-block">
              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data through the Profile section</li>
                <li>Update or correct your information at any time</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of push notifications via device settings</li>
              </ul>
              <p>To exercise any of these rights, contact us at <a href="mailto:info@excelcare.us">info@excelcare.us</a>.</p>
            </div>

            <div className="hnw-privacy-block">
              <h2>6. Data Retention</h2>
              <p>We retain your personal data for as long as your account is active. Booking history is retained for 2 years for reference. You may request deletion at any time.</p>
            </div>

            <div className="hnw-privacy-block">
              <h2>7. Children's Privacy</h2>
              <p>Our service is not directed to individuals under 18. We do not knowingly collect information from children.</p>
            </div>

            <div className="hnw-privacy-block">
              <h2>8. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy in the app.</p>
            </div>

            <div className="hnw-privacy-block">
              <h2>9. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, contact us at:</p>
              <p><strong>Email:</strong> <a href="mailto:info@excelcare.us">info@excelcare.us</a></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthNWealthPrivacyPolicy;
