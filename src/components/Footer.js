import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Excel Care Solutions (ECS)</h3>
            <p>
              Empowering organizations and individuals through premium services in 
              Pharmaceuticals, Digital Health, Diagnostics & Clinical Laboratories, 
              Healthcare and Logistics Management.
            </p>
            <div className="motto">
              "Manage & Support – Engage & Grow"
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/collaborators">Collaborators</a></li>
              <li><a href="/team">Team</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Our Services</h4>
            <ul>
              <li>Pharmaceutics</li>
              <li>Diagnostics Services</li>
              <li>Digital Health</li>
              <li>Logistics Management</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <p>Email: info@excelcare.us</p>
              <p>Website: www.excelcare.us</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-credits">
            <p>&copy; 2025 Excel Care Solutions (ECS). All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

