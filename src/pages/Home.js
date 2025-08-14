import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>EXCEL CARE SOLUTIONS (ECS)</h1>
          <h2>EMPOWERING ORGANIZATIONS AND INDIVIDUALS THROUGH PREMIUM SERVICES</h2>
          <p>We live by our motto of "Manage & Support – Engage & Grow"</p>
          <div className="hero-buttons">
            <a href="/about" className="btn-primary">Learn More</a>
            <a href="/services" className="btn-secondary">Our Services</a>
          </div>
        </div>
      </section>

      <section className="intro">
        <div className="container">
          <div className="intro-content">
            <h3>Welcome to Excel Care Solutions</h3>
            <p>
              At ECS, we specialize in delivering premium services in niche areas of 
              Pharmaceuticals, Digital Health, Diagnostics & Clinical Laboratories, 
              Healthcare and Logistics Management to transform challenges into opportunities.
            </p>
            <p>
              As a sister concern of Care Group International, our strategic partnership with our partners enhances our ability to deliver 
              our services in a time bound manner.
            </p>
          </div>
        </div>
      </section>

      <section className="key-areas">
        <div className="container">
          <h3>Our Key Service Areas</h3>
          <div className="areas-grid">
            <div className="area-card">
              <h4>Pharmaceutics</h4>
              <p>Cost-effective pharmaceutical distribution with expertise in logistics and supply chain management.</p>
            </div>
            <div className="area-card">
              <h4>Diagnostics Services</h4>
              <p>Advanced medical diagnostic services including laboratory diagnostics, imaging, and cardiovascular diagnostics.</p>
            </div>
            <div className="area-card">
              <h4>Digital Health</h4>
              <p>Cutting-edge digital health solutions and our Health & Wealth mobile application.</p>
            </div>
            <div className="area-card">
              <h4>Logistics Management</h4>
              <p>Efficient logistics management of medical supplies and commodities with AI-driven solutions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h3>Ready to Transform Your Healthcare Solutions?</h3>
          <p>Partner with us to experience premium healthcare services and innovative solutions.</p>
          <a href="/collaborators" className="btn-primary">View Our Collaborators</a>
        </div>
      </section>
    </div>
  );
};

export default Home;

