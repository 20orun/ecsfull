import React from 'react';
import { Link } from 'react-router-dom';
import './HealthNWealth.css';

const HealthNWealth = () => {
  return (
    <div className="healthnwealth">
      <section className="hnw-hero">
        <div className="hnw-hero-content">
          <h1>Health N Wealth</h1>
          <p className="hnw-hero-tagline">Your Health, Simplified</p>
          <p className="hnw-hero-sub">Book trusted health packages in just a few taps.</p>
          <div className="hnw-hero-buttons">
            <Link to="/healthnwealth/support" className="hnw-link-btn">Support</Link>
            <Link to="/healthnwealth/privacypolicy" className="hnw-link-btn">Privacy Policy</Link>
          </div>
        </div>
      </section>

      <section className="hnw-why-section">
        <div className="container">
          <h2>Why Health N Wealth?</h2>
          <div className="hnw-features-grid">
            <div className="hnw-feature-card">
              <div className="hnw-feature-icon">🏥</div>
              <h3>Trusted Hospital Network</h3>
              <p>Every hospital on our platform is vetted and empanelled. Browse packages with transparent pricing.</p>
            </div>
            <div className="hnw-feature-card">
              <div className="hnw-feature-icon">📍</div>
              <h3>Find Hospitals Near You</h3>
              <p>Select your location to discover relevant hospitals, or explore options across different cities.</p>
            </div>
            <div className="hnw-feature-card">
              <div className="hnw-feature-icon">🤝</div>
              <h3>Premium Concierge Service</h3>
              <p>Add a dedicated Health Coordinator to any booking for support with scheduling and reminders.</p>
            </div>
            <div className="hnw-feature-card">
              <div className="hnw-feature-icon">🔒</div>
              <h3>Simple, Secure Payments</h3>
              <p>Pay with UPI, cards, net banking, or wallets through Razorpay.</p>
            </div>
            <div className="hnw-feature-card">
              <div className="hnw-feature-icon">🔔</div>
              <h3>Stay Updated</h3>
              <p>Get notifications for booking confirmations, appointment reminders, and updates.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthNWealth;
