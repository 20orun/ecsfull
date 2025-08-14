import React from 'react';
import './Services.css';

const Services = () => {
  return (
    <div className="services">
      <section className="services-hero">
        <div className="container">
          <h1>Our Services</h1>
          <p>Niche Areas of Premium Healthcare Services</p>
        </div>
      </section>

      <section className="services-content">
        <div className="container">
          <div className="service-section" id="pharmaceutics">
            <div className="service-header">
              <span className="service-number">1</span>
              <h2>Pharmaceutics</h2>
            </div>
            <p className="service-intro">
              The pharmaceutical industry is one of the largest in the world and is expected
              to grow rapidly in the coming years. With the increasing demand for medicines,
              there is a huge scope for the pharma distribution network. We provide:
            </p>
            
            <div className="service-features">
              <div className="feature-card">
                <h3>Cost-Effective</h3>
                <p>
                  Leveraging the existing infrastructure = significant cost savings. efficient
                  management and execution of the distribution process.
                </p>
              </div>
              <div className="feature-card">
                <h3>Expertise</h3>
                <p>
                  Logistics and supply chain – We know the ins and outs = ensuring correct
                  products reach correct location on time.
                </p>
              </div>
              <div className="feature-card">
                <h3>Flexibility</h3>
                <p>
                  Scale up or down based on your needs = better inventory management Our
                  Value-added services such as warehousing, transportation, and inventory management will
                  help improve the efficiency of the distribution process and add value to the
                  overall supply chain.
                </p>
              </div>
            </div>
          </div>

          <div className="service-section" id="diagnostics">
            <div className="service-header">
              <span className="service-number">2</span>
              <h2>Diagnostics Services</h2>
            </div>
            <p className="service-intro">
              Medical diagnostic services are continuously evolving with advancements in
              technology, leading to faster, more accurate, and minimally invasive diagnostic
              solutions. Medical diagnostic services encompass a broad range of tests and procedures that
              help healthcare professionals detect, diagnose, and monitor diseases,
              conditions, and overall health status. ECS is at the forefront of providing high quality
              services that are crucial for early intervention, treatment planning, and
              disease prevention though its chain of diagnostic facilities that include:
            </p>
            
            <div className="diagnostic-categories">
              <div className="diagnostic-card">
                <h3>Laboratory Diagnostics</h3>
                <p>
                  Pathology, Clinical Chemistry, Hematology, Microbiology, Molecular Diagnostics, 
                  Immunology & Serology, Genetic & Prenatal Diagnostics
                </p>
              </div>
              <div className="diagnostic-card">
                <h3>Imaging & Radiology</h3>
                <p>
                  X-ray, Ultrasound, CT scan (Computed Tomography), MRI (Magnetic Resonance
                  Imaging), Mammography
                </p>
              </div>
              <div className="diagnostic-card">
                <h3>Cardiovascular Diagnostics</h3>
                <p>
                  Electrocardiogram (ECG/EKG), Echocardiography (Echo)
                </p>
              </div>
            </div>
            
            <div className="future-diagnostics">
              <h3>Future of Medical Diagnostics</h3>
              <p>
                We are also focusing on the future of Medical Diagnostics by integrating AI &
                Machine Learning that will enhances diagnostic accuracy and efficiency that will
                also include:
              </p>
              <ul>
                <li>Point-of-Care Testing</li>
                <li>Rapid diagnostics at patient bedside</li>
                <li>Wearable Health Devices</li>
                <li>Continuous monitoring of vitals</li>
              </ul>
            </div>
          </div>

          <div className="service-section" id="digital-health">
            <div className="service-header">
              <span className="service-number">3</span>
              <h2>Digital Health and Hospitality</h2>
            </div>
            
            <div className="digital-health-content">
              <div className="digital-subsection">
                <h3>Digital Health</h3>
                <p>
                  We are applying broad range of technologies aimed at improving healthcare
                  delivery, patient outcomes, and overall well-being utilizing digital health which will
                  enhance medical practices, healthcare accessibility and patient engagement.
                </p>
              </div>
              
              <div className="digital-subsection">
                <h3>Health and Wealth (mHealth with ECS H&W)</h3>
                <p>
                  The scope of our digital health application encompasses healthcare support
                  services and sustaining and developing your wealth management. It also everything
                  from AI-driven diagnostics to blockchain-powered records management that make our
                  services in healthcare more efficient, accessible, and patient-centric.
                </p>
              </div>
              
              <div className="digital-subsection">
                <h3>Health & Wellness Mobile Application</h3>
                <p>
                  Our Health & wellness mobile application (Health & Wealth) is fully developed to
                  provide easy access to leading healthcare facility in your area and to ensure
                  affordable quality healthcare and sustainable wealth management.
                </p>
              </div>
              
              <div className="digital-subsection">
                <h3>Comprehensive Health Services Available</h3>
                <div className="health-services-grid">
                  <div className="service-card">
                    <div className="service-number">1</div>
                    <h4>Annual Medical Checkup</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">2</div>
                    <h4>Doctor Appointments</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">3</div>
                    <h4>Second Opinions</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">4</div>
                    <h4>Ambulance Services</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">5</div>
                    <h4>Surgery Planning</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">6</div>
                    <h4>Medicines Delivery</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">7</div>
                    <h4>Sending Reminders</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">8</div>
                    <h4>Home Health Visits</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">9</div>
                    <h4>Home Care Nurse</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">10</div>
                    <h4>24 Hours Bedside Care</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">11</div>
                    <h4>Speech & Hearing Aids</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">12</div>
                    <h4>Eye Care</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">13</div>
                    <h4>Dietitian Consultation</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">14</div>
                    <h4>Physiotherapy Services</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">15</div>
                    <h4>Diagnostics Services</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">16</div>
                    <h4>Dental Consultation</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">17</div>
                    <h4>Homeopathy Consultation</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">18</div>
                    <h4>Ayurveda Consultation</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">19</div>
                    <h4>Property Management Assistance</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">20</div>
                    <h4>Transportation Assistance</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">21</div>
                    <h4>Day Outings</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">22</div>
                    <h4>Visa, Passport, Ticketing</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">23</div>
                    <h4>Realtime Updates</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">24</div>
                    <h4>Accompanied Care Manager</h4>
                  </div>
                  
                  <div className="service-card">
                    <div className="service-number">25</div>
                    <h4>24X7 Contact Centre</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="service-section" id="logistics">
            <div className="service-header">
              <span className="service-number">4</span>
              <h2>Commodities and Medical Supplies Logistics Management</h2>
            </div>
            <p className="service-intro">
              Efficient logistics management of medical supplies and commodities is crucial for ensuring the
              availability of essential healthcare resources, minimizing shortages, and maintaining quality standards. This involves the planning, procurement, storage,
              distribution, and monitoring of medical goods, including pharmaceuticals, medical equipment and consumables.
              This being a critical function that ensures the smooth operation of healthcare
              systems, technology, data-driven strategies, supply chain efficiency can be
              significantly improved to enhance patient care and resource utilization.
            </p>
            
            <div className="logistics-services">
              <h3>Our Logistics Management Services Include</h3>
              <div className="logistics-grid">
                <div className="logistics-item">Procurement and Sourcing</div>
                <div className="logistics-item">Inventory Management</div>
                <div className="logistics-item">Storage and Warehousing</div>
                <div className="logistics-item">Distribution and Transportation</div>
                <div className="logistics-item">Drones & Automated Delivery – Faster and more efficient transportation in remote areas</div>
                <div className="logistics-item">Regulatory and Compliance Management</div>
                <div className="logistics-item">AI & Machine Learning – Predictive analytics for demand forecasting</div>
                <div className="logistics-item">Blockchain Technology – Ensuring traceability and authenticity of medical supplies</div>
                <div className="logistics-item">Green Logistics – Eco-friendly packaging and sustainable distribution practices</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
