import React, { useState } from 'react';
import './Collaborators.css';

const partnerships = [
  {
    title: 'CT Scan',
    company: 'Siemens - Germany',
    logo: '/Siemens.png',
    details: 'CT scan partnership with Siemens - Germany for advanced imaging equipment and service support.',
  },
  {
    title: 'Mammogram',
    company: 'Xtronics - USA',
    logo: '/Xtronics.png',
    details: 'Mammogram partnership with Xtronics - USA for high-quality imaging solutions.',
  },
  {
    title: 'Ultrasound',
    company: 'Philips - USA',
    logo: '/philips.png',
    details: 'Ultrasound partnership with Philips - USA for cutting-edge diagnostic tools.',
  },
  {
    title: 'Digital X-ray',
    company: 'Allenger - India',
    logo: '/allengers.png',
    details: 'Digital X-ray partnership with Allenger - India for reliable imaging equipment.',
  },
  {
    title: 'ECG',
    company: 'RMS - India',
    logo: '/rms.png',
    details: 'ECG partnership with RMS - India for advanced cardiac monitoring solutions.',
  },
  {
    title: 'Injectable & Nutraceutical Products',
    company: 'Concept Pharmaceutical Ltd - Rwanda',
    logo: '/concept-pharmaceuticals.png',
    details: 'Authorized partner with Concept Pharmaceutical Ltd - Rwanda for injectable and nutraceutical products.',
  },
  {
    title: 'Chemiluminescence Analyzer & Reagents',
    company: 'Agappe Diagnostics Ltd - India & Switzerland',
    logo: '/agappe.png',
    details: 'Authorized partner with Agappe Diagnostics Ltd - India & Switzerland for biochemistry and hematology equipment and reagents.',
  },
  {
    title: 'Chemiluminescence Analyzer, Reagents & Hormones - POCT',
    company: 'Norman Biological Technology - China',
    logo: '/norman.png',
    details: 'Authorized partner with Norman Biological Technology - China for chemiluminescence analyzers, reagents, and POCT hormone testing solutions.',
  },
  {
    title: 'Electrolyte',
    company: 'LAB Nova - India',
    logo: '/labnova.png',
    details: 'Authorized partner with LAB Nova - India for electrolyte testing solutions.',
  },
];

const Card = ({ logo, details, company }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    console.error(`Failed to load image: ${logo} for company: ${company}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log(`Successfully loaded image: ${logo} for company: ${company}`);
    setImageLoaded(true);
  };

  const getCompanyInitials = (company) => {
    return company
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      className={`collaborator-card ${isHovered ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="logo-container">
        {imageError ? (
          <div className="logo-placeholder">
            {getCompanyInitials(company)}
          </div>
        ) : (
          <>
            <div className="shine"></div>
            <img 
              src={logo} 
              alt={`${company} logo`} 
              className="logo"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ 
                opacity: imageLoaded ? 1 : 0.5,
                transition: 'opacity 0.3s ease'
              }}
            />
            {!imageLoaded && !imageError && (
              <div className="logo-placeholder" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                Loading...
              </div>
            )}
          </>
        )}
      </div>
      <h3>{company}</h3>
      <p className="details">{details}</p>
    </div>
  );
};

const Collaborators = () => {
  return (
    <div className="collaborators">
      <section className="collaborators-hero">
        <div className="container">
          <h1>Our Collaborators</h1>
          <p>Trusted partnerships for quality healthcare solutions</p>
        </div>
      </section>

      <section className="collaborators-content">
        <div className="container">
          <div className="intro-text">
            <p>
              Our strategic partnerships with leading healthcare companies worldwide enable us to deliver 
              cutting-edge solutions and maintain the highest standards of quality in our services. These 
              collaborations strengthen our ability to provide comprehensive healthcare solutions across 
              various specialties.
            </p>
          </div>
          
          <div className="collaborators-grid">
            {partnerships.map((item, index) => (
              <Card 
                key={index} 
                logo={item.logo} 
                details={item.details} 
                company={item.company}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Collaborators;
