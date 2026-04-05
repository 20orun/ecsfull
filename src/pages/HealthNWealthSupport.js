import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HealthNWealth.css';

const HealthNWealthSupport = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How do I book a health package?',
      a: 'From the Home screen, select a service, choose a hospital in your location, pick a package, set your preferred appointment date, and proceed to payment.'
    },
    {
      q: 'What payment methods are accepted?',
      a: 'We accept UPI, credit/debit cards, net banking from major Indian banks, and digital wallets. All payments are processed securely through Razorpay.'
    },
    {
      q: 'What is the concierge service?',
      a: 'The concierge service is an optional add-on that assigns a dedicated Health Coordinator to your booking. Your coordinator helps with scheduling, reminders, and support.'
    },
    {
      q: 'How do I cancel a booking?',
      a: 'Contact our support team at info@excelcare.us with your booking ID. Cancellation policies are determined by individual hospitals. Refund timelines may vary.'
    },
    {
      q: 'Which locations are supported?',
      a: 'We currently operate across multiple cities in India. Available hospitals and services may vary based on location.'
    },
    {
      q: 'How do I update my profile or change my location?',
      a: 'Go to Profile, where you can edit your details and preferred location.'
    },
    {
      q: 'How do I manage notifications?',
      a: 'Push notifications can be controlled through your device settings.'
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. All data is encrypted in transit and at rest. Payments are processed by Razorpay and sensitive payment details are not stored on our servers.'
    },
    {
      q: 'How do I delete my account?',
      a: null
    }
  ];

  return (
    <div className="healthnwealth">
      <section className="hnw-hero">
        <div className="hnw-hero-content">
          <h1>Health N Wealth — Support</h1>
          <p className="hnw-hero-tagline">How can we help?</p>
          <p className="hnw-hero-sub">If you have questions, issues, or feedback about Health N Wealth, we're here to assist.</p>
          <div className="hnw-hero-buttons">
            <Link to="/healthnwealth" className="hnw-link-btn">Back to Health N Wealth</Link>
          </div>
        </div>
      </section>

      <section className="hnw-faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="hnw-faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`hnw-faq-item ${openFaq === index ? 'open' : ''}`}
              >
                <button
                  className="hnw-faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span>Q: {faq.q}</span>
                  <span className="hnw-faq-toggle">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="hnw-faq-answer">
                    {faq.a ? (
                      <p>A: {faq.a}</p>
                    ) : (
                      <p>A: You can delete your account from the app or by contacting us. Visit our <Link to="/healthnwealth/delete-account">Delete Account</Link> page for detailed steps.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hnw-contact-section">
        <div className="container">
          <h2>Contact Us</h2>
          <div className="hnw-contact-card">
            <div className="hnw-contact-item">
              <span className="hnw-contact-label">Email</span>
              <a href="mailto:info@excelcare.us">info@excelcare.us</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthNWealthSupport;
