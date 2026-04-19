import React from 'react';
import { Link } from 'react-router-dom';
import './Healthix.css';

const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.healthnwealth.app';
const IOS_URL = 'https://apps.apple.com/us/app/healthix/id6757195357';

const getDeviceType = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  return 'other';
};

const Healthix = () => {
  const device = getDeviceType();
  const isMobile = device === 'android' || device === 'ios';

  const handleDownload = () => {
    if (device === 'android') {
      window.location.href = ANDROID_URL;
    } else if (device === 'ios') {
      window.location.href = IOS_URL;
    }
  };

  return (
    <div className="healthix">
      <section className="hnw-hero">
        <div className="hnw-hero-content">
          <h1>Healthix</h1>
          <p className="hnw-hero-tagline">Your Health, Simplified</p>
          <p className="hnw-hero-sub">Book trusted health packages in just a few taps.</p>
          <div className="hnw-hero-buttons">
            <Link to="/healthix/support" className="hnw-link-btn">Support</Link>
            <Link to="/healthix/privacypolicy" className="hnw-link-btn">Privacy Policy</Link>
          </div>
        </div>
      </section>

      <section className="hnw-download-section">
        <div className="container">
          <h2>Get the App</h2>
          <p className="hnw-download-sub">{isMobile ? 'Scan the QR code or tap the button below to download Healthix.' : 'Scan the QR code with your phone to download Healthix.'}</p>
          <div className="hnw-download-content">
            <img
              src="/healthixqr.svg"
              alt="Scan to download Healthix"
              className="hnw-qr-code"
            />
            {isMobile && (
              <button onClick={handleDownload} className="hnw-download-btn">
                Download Healthix
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="hnw-why-section">
        <div className="container">
          <h2>Why Healthix?</h2>
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

export default Healthix;
