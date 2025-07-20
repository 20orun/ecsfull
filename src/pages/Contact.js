import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    comments: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      comments: ''
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact</h1>
          <h2>Let's get in touch</h2>
        </div>
      </div>

      <div className="contact-content">
        <div className="container">
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
                
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name here"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name here"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Example: user@website.com"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="comments">Comments / Questions *</label>
                    <textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleInputChange}
                      rows="5"
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="submit-btn">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
