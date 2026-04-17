import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { FIRM_CONFIG } from '../config/firmConfig';
import './Contact.css';

const Contact = () => {
  const [state, handleSubmit] = useForm("mvgqyklv");
  const [countryCode, setCountryCode] = useState('+1');

  // Function to get flag emoji from country code
  const getCountryFlag = (code) => {
    const flagMap = {
      '+1': '🇺🇸', // Default to US for +1
      '+7': '🇷🇺',
      '+20': '🇪🇬',
      '+27': '🇿🇦',
      '+30': '🇬🇷',
      '+31': '🇳🇱',
      '+32': '🇧🇪',
      '+33': '🇫🇷',
      '+34': '🇪🇸',
      '+36': '🇭🇺',
      '+39': '🇮🇹',
      '+40': '🇷🇴',
      '+41': '🇨🇭',
      '+43': '🇦🇹',
      '+44': '🇬🇧',
      '+45': '🇩🇰',
      '+46': '🇸🇪',
      '+47': '🇳🇴',
      '+48': '🇵🇱',
      '+49': '🇩🇪',
      '+51': '🇵🇪',
      '+52': '🇲🇽',
      '+53': '🇨🇺',
      '+54': '🇦🇷',
      '+55': '🇧🇷',
      '+56': '🇨🇱',
      '+57': '🇨🇴',
      '+58': '🇻🇪',
      '+60': '🇲🇾',
      '+61': '🇦🇺',
      '+62': '🇮🇩',
      '+63': '🇵🇭',
      '+64': '🇳🇿',
      '+65': '🇸🇬',
      '+66': '🇹🇭',
      '+81': '🇯🇵',
      '+82': '🇰🇷',
      '+84': '🇻🇳',
      '+86': '🇨🇳',
      '+90': '🇹🇷',
      '+91': '🇮🇳',
      '+92': '🇵🇰',
      '+93': '🇦🇫',
      '+94': '🇱🇰',
      '+95': '🇲🇲',
      '+98': '🇮🇷',
      '+212': '🇲🇦',
      '+213': '🇩🇿',
      '+216': '🇹🇳',
      '+218': '🇱🇾',
      '+220': '🇬🇲',
      '+221': '🇸🇳',
      '+222': '🇲🇷',
      '+223': '🇲🇱',
      '+224': '🇬🇳',
      '+225': '🇨🇮',
      '+226': '🇧🇫',
      '+227': '🇳🇪',
      '+228': '🇹🇬',
      '+229': '🇧🇯',
      '+230': '🇲🇺',
      '+231': '🇱🇷',
      '+232': '🇸🇱',
      '+233': '🇬🇭',
      '+234': '🇳🇬',
      '+235': '🇹🇩',
      '+236': '🇨🇫',
      '+237': '🇨🇲',
      '+238': '🇨🇻',
      '+239': '🇸🇹',
      '+240': '🇬🇶',
      '+241': '🇬🇦',
      '+242': '🇨🇬',
      '+243': '🇨🇩',
      '+244': '🇦🇴',
      '+245': '🇬🇼',
      '+246': '🇮🇴',
      '+248': '🇸🇨',
      '+249': '🇸🇩',
      '+250': '🇷🇼',
      '+251': '🇪🇹',
      '+252': '🇸🇴',
      '+253': '🇩🇯',
      '+254': '🇰🇪',
      '+255': '🇹🇿',
      '+256': '🇺🇬',
      '+257': '🇧🇮',
      '+258': '🇲🇿',
      '+260': '🇿🇲',
      '+261': '🇲🇬',
      '+262': '🇷🇪',
      '+263': '🇿🇼',
      '+264': '🇳🇦',
      '+265': '🇲🇼',
      '+266': '🇱🇸',
      '+267': '🇧🇼',
      '+268': '🇸🇿',
      '+269': '🇰🇲',
      '+290': '🇸🇭',
      '+291': '🇪🇷',
      '+297': '🇦🇼',
      '+298': '🇫🇴',
      '+299': '🇬🇱',
      '+350': '🇬🇮',
      '+351': '🇵🇹',
      '+352': '🇱🇺',
      '+353': '🇮🇪',
      '+354': '🇮🇸',
      '+355': '🇦🇱',
      '+356': '🇲🇹',
      '+357': '🇨🇾',
      '+358': '🇫🇮',
      '+359': '🇧🇬',
      '+370': '🇱🇹',
      '+371': '🇱🇻',
      '+372': '🇪🇪',
      '+373': '🇲🇩',
      '+374': '🇦🇲',
      '+375': '🇧🇾',
      '+376': '🇦🇩',
      '+377': '🇲🇨',
      '+378': '🇸🇲',
      '+380': '🇺🇦',
      '+381': '🇷🇸',
      '+382': '🇲🇪',
      '+383': '🇽🇰',
      '+385': '🇭🇷',
      '+386': '🇸🇮',
      '+387': '🇧🇦',
      '+389': '🇳🇲',
      '+420': '🇨🇿',
      '+421': '🇸🇰',
      '+423': '🇱🇮',
      '+500': '🇫🇰',
      '+501': '🇧🇿',
      '+502': '🇬🇹',
      '+503': '🇸🇻',
      '+504': '🇭🇳',
      '+505': '🇳🇮',
      '+506': '🇨🇷',
      '+507': '🇵🇦',
      '+508': '🇵🇲',
      '+509': '🇭🇹',
      '+590': '🇬🇵',
      '+591': '🇧🇴',
      '+592': '🇬🇾',
      '+593': '🇪🇨',
      '+594': '🇬🇫',
      '+595': '🇵🇾',
      '+596': '🇲🇶',
      '+597': '🇸🇷',
      '+598': '🇺🇾',
      '+599': '🇨🇼',
      '+670': '🇹🇱',
      '+672': '🇦🇶',
      '+673': '🇧🇳',
      '+674': '🇳🇷',
      '+675': '🇵🇬',
      '+676': '🇹🇴',
      '+677': '🇸🇧',
      '+678': '🇻🇺',
      '+679': '🇫🇯',
      '+680': '🇵🇼',
      '+681': '🇼🇫',
      '+682': '🇨🇰',
      '+683': '🇳🇺',
      '+684': '🇦🇸',
      '+685': '🇼🇸',
      '+686': '🇰🇮',
      '+687': '🇳🇨',
      '+688': '🇹🇻',
      '+689': '🇵🇫',
      '+690': '🇹🇰',
      '+691': '🇫🇲',
      '+692': '🇲🇭',
      '+850': '🇰🇵',
      '+852': '🇭🇰',
      '+853': '🇲🇴',
      '+855': '🇰🇭',
      '+856': '🇱🇦',
      '+880': '🇧🇩',
      '+886': '🇹🇼',
      '+960': '🇲🇻',
      '+961': '🇱🇧',
      '+962': '🇯🇴',
      '+963': '🇸🇾',
      '+964': '🇮🇶',
      '+965': '🇰🇼',
      '+966': '🇸🇦',
      '+967': '🇾🇪',
      '+968': '🇴🇲',
      '+970': '🇵🇸',
      '+971': '🇦🇪',
      '+972': '🇮🇱',
      '+973': '🇧🇭',
      '+974': '🇶🇦',
      '+975': '🇧🇹',
      '+976': '🇲🇳',
      '+977': '🇳🇵',
      '+992': '🇹🇯',
      '+993': '🇹🇲',
      '+994': '🇦🇿',
      '+995': '🇬🇪',
      '+996': '🇰🇬',
      '+998': '🇺🇿'
    };
    return flagMap[code] || '🌍'; // Default globe emoji if not found
  };

  // Inline styles as fallback for critical styles
  const heroStyle = {
    background: 'linear-gradient(135deg, #004d7a 0%, #008170 100%)',
    color: 'white',
    padding: window.innerWidth <= 768 ? '2.5rem 0 1.5rem' : '6rem 0 4rem',
    textAlign: 'center'
  };

  const contentStyle = {
    padding: window.innerWidth <= 768 ? '2rem 0' : '4rem 0',
    background: '#f8f9fa'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: window.innerWidth <= 480 ? '0 0.8rem' : '0 1rem'
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
                  <p>{FIRM_CONFIG.address}</p>
                  <p><strong>Phone:</strong> {FIRM_CONFIG.phone}</p>
                  <p><strong>Email:</strong> {FIRM_CONFIG.email}</p>
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
                        placeholder="Your email"
                        required
                      />
                      <ValidationError 
                        prefix="Email" 
                        field="email"
                        errors={state.errors}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <div className="phone-input-group">
                        <div className="country-code-input-wrapper">
                          <span className="flag-display">{getCountryFlag(countryCode)}</span>
                          <div className="country-code-input-container">
                            <input
                              type="text"
                              name="countryCode"
                              value={countryCode}
                              onChange={(e) => {
                                let value = e.target.value;
                                
                                // If user clears everything, set to default +1
                                if (value === '') {
                                  setCountryCode('+1');
                                  return;
                                }
                                
                                // If user types only numbers (no +), add + automatically
                                if (/^[0-9]+$/.test(value)) {
                                  setCountryCode('+' + value);
                                  return;
                                }
                                
                                // If user types + followed by numbers, keep as is
                                if (/^\+[0-9]*$/.test(value)) {
                                  setCountryCode(value);
                                  return;
                                }
                                
                                // For any other input, extract only numbers and add +
                                const numbersOnly = value.replace(/[^0-9]/g, '');
                                if (numbersOnly) {
                                  setCountryCode('+' + numbersOnly);
                                } else {
                                  setCountryCode('+1');
                                }
                              }}
                              className="country-code-input"
                              placeholder="+1"
                              maxLength="5"
                            />
                          </div>
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="Your phone number"
                          className="phone-number-input"
                        />
                      </div>
                      <ValidationError 
                        prefix="Phone" 
                        field="phone"
                        errors={state.errors}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="comments">Comments / Questions *</label>
                      <textarea
                        id="comments"
                        name="comments"
                        rows="4"
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
