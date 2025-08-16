import React, { useState } from 'react';
import './Collaborators.css';

const diagnosticPartnerships = [
  {
    title: 'Diagnostic and Imaging Partnership',
    company: 'WIWO Speciality Hospital',
    logo: '/wiwo.png',
    details: 'Comprehensive diagnostic and imaging partnership with WIWO Speciality Hospital for advanced healthcare services.',
  },
  {
    title: 'Diagnostic Partnership',
    company: 'Baho Healthcare',
    logo: '/baho.jpg',
    details: 'Strategic diagnostic partnership with Baho Healthcare to enhance medical diagnostic capabilities.',
  },
  {
    title: 'Diagnostic Partnership',
    company: 'Legacy Healthcare',
    logo: '/legacy.png',
    details: 'Collaborative diagnostic services partnership with Legacy Healthcare for quality patient care.',
  },
  {
    title: 'Diagnostic Partnership',
    company: 'La Croix Healthcare',
    logo: '/la-croix.png',
    details: 'Advanced diagnostic partnership with La Croix Healthcare for comprehensive medical services.',
  },
  {
    title: 'Foundation Partnership',
    company: 'Ndengera Foundation',
    logo: '/ndengera.png',
    details: 'Healthcare foundation partnership with Ndengera Foundation to expand community health services.',
  },
  {
    title: 'Clinic Partnership',
    company: 'UBI Caritas Clinic',
    logo: '/ubi-caritas.png',
    details: 'Diagnostic services partnership with UBI Caritas Clinic for enhanced patient care delivery.',
  },
  {
    title: 'Clinic Partnership',
    company: 'Carrefour Poly Clinic',
    logo: '/carrefour.png',
    details: 'Comprehensive clinic partnership with Carrefour Poly Clinic for diagnostic excellence.',
  },
  {
    title: 'Clinic Partnership',
    company: 'Maxcure Polyclinic',
    logo: '/maxcure.png',
    details: 'Strategic diagnostic partnership with Maxcure Polyclinic for advanced medical services.',
  }
];

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
          <h1>Our Collaborations and Strategic Partnerships</h1>
        </div>
      </section>

      <section className="collaborators-content">
        <div className="container">
          <div className="section-header">
            <h2>Collaborations</h2>
            <p>Our collaboration with leading healthcare companies worldwide enable us to deliver 
              cutting-edge solutions and maintain the highest standards of quality in our services, strengthening our ability to provide comprehensive healthcare solutions across 
              various specialties.</p>
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

      <section className="diagnostic-partnerships">
        <div className="container">
          <div className="section-header">
            <h2>Strategic Partnerships</h2>
            <p>Building strong alliances with healthcare institutions worldwide to deliver exceptional medical services and expand our global healthcare impact</p>
          </div>
          
          <div className="collaborators-grid">
            {diagnosticPartnerships.map((item, index) => (
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
