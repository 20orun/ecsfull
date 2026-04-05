import React from 'react';
import { Link } from 'react-router-dom';
import './HealthNWealth.css';

const HealthNWealthDeleteAccount = () => {
  return (
    <div className="healthnwealth">
      <section className="hnw-hero">
        <div className="hnw-hero-content">
          <h1>Delete Your Account</h1>
          <p className="hnw-hero-tagline">Excel Care by ECS</p>
          <p className="hnw-hero-sub">Request deletion of your account and associated data</p>
          <div className="hnw-hero-buttons">
            <Link to="/healthnwealth" className="hnw-link-btn">Back to Health N Wealth</Link>
          </div>
        </div>
      </section>

      <section className="hnw-privacy-section">
        <div className="container">
          <div className="hnw-privacy-content">
            <p className="hnw-privacy-intro">
              If you would like to delete your account and associated data from Health N Wealth by ECS, follow the steps below.
            </p>

            <div className="hnw-privacy-block">
              <h2>Steps to Request Account Deletion</h2>
              <ul>
                <li>Open the app</li>
                <li>Go to Menu</li>
                <li>Tap on Profile</li>
                <li>Select Delete Account</li>
                <li>Confirm your request</li>
              </ul>
            </div>

            <div className="hnw-privacy-block">
              <h2>Alternative Method</h2>
              <p>If you are unable to access your account, you can request deletion by contacting us:</p>
              <p><a href="mailto:info@excelcare.us">info@excelcare.us</a></p>
            </div>

            <div className="hnw-privacy-block">
              <h2>What Data is Deleted</h2>
              <p>When you delete your account:</p>
              <ul>
                <li>Your personal information (name, phone number, email) is permanently deleted</li>
                <li>Your app usage data and profile details are removed</li>
              </ul>
            </div>

            <div className="hnw-privacy-block">
              <h2>Data Retention (if any)</h2>
              <ul>
                <li>Some data may be retained for a limited period (e.g., up to 30 days) for legal, audit, or security purposes</li>
                <li>After this period, all data is permanently deleted</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthNWealthDeleteAccount;
