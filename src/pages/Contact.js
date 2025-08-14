import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import './Contact.css';

const Contact = () => {
  const [state, handleSubmit] = useForm("mvgqyklv");

  // Inline styles as fallback for critical styles
  const heroStyle = {
    background: 'linear-gradient(135deg, #004d7a 0%, #008170 100%)',
    color: 'white',
    padding: '6rem 0 4rem',
    textAlign: 'center'
  };

  const contentStyle = {
    padding: '4rem 0',
    background: '#f8f9fa'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  return (
    <div className="contact-page" style={{minHeight: '100vh'}}>
      <div className="contact-hero" style={heroStyle}>
        <div className="container" style={containerStyle}>
          <h1>Contact</h1>
          <h2>Let's get in touch</h2>
        </div>
      </div>

      <div className="contact-content" style={contentStyle}>
        <div className="container" style={containerStyle}>
          <div className="contact-grid">
            <div className="locations-section">
              <h2>Locations</h2>
              
              <div className="location-card">
                <h3>Rwanda</h3>
                <div className="location-details">
                  <p><strong>Address:</strong></p>
                  <p>Care Group International Ltd., KK 21, AV 56,<br />
                     Niboye, Kicukiro, Kigali, Rwanda</p>
                  <p><strong>Phone:</strong> +250794411233</p>
                  <p><strong>Email:</strong> info@excelcare.us</p>
                </div>
              </div>

              <div className="location-card">
                <h3>India</h3>
                <div className="location-details">
                  <p><strong>Address:</strong></p>
                  <p>Business Centre, Near Lulu Mall,<br />
                     Cochin, Kerala, India</p>
                  <p><strong>Email:</strong> info@excelcare.us</p>
                </div>
              </div>
            </div>

            <div className="contact-form-section">
              <h2>Feel free to reach out to us!</h2>
              <p className="form-subtitle">Let's talk</p>
              
              <div className="contact-form-container">
                <h3>Your Details</h3>
                <p>Let us know how to get back to you.</p>
                
                {state.succeeded ? (
                  <div className="success-message">
                    <p>Thank you for your message! We will get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          placeholder="Your first name"
                          required
                        />
                        <ValidationError 
                          prefix="First Name" 
                          field="firstName"
                          errors={state.errors}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          placeholder="Your last name"
                          required
                        />
                        <ValidationError 
                          prefix="Last Name" 
                          field="lastName"
                          errors={state.errors}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Your Email"
                        required
                      />
                      <ValidationError 
                        prefix="Email" 
                        field="email"
                        errors={state.errors}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="comments">Comments / Questions *</label>
                      <textarea
                        id="comments"
                        name="comments"
                        rows="5"
                        required
                      ></textarea>
                      <ValidationError 
                        prefix="Message" 
                        field="comments"
                        errors={state.errors}
                      />
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={state.submitting}>
                      {state.submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

