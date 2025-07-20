import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about">
      <section className="about-hero">
        <div className="container">
          <h1>About Excel Care Solutions</h1>
          <p>Empowering organizations and individuals through premium healthcare services</p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="about-text">
            <h2>About Us</h2>
            <p>
              At ECS, we specialize in delivering premium services in niche areas of
              Pharmaceuticals, Digital Health, Diagnostics & Clinical Laboratories, Healthcare and
              Logistics Management to transform challenges into opportunities. Our strategic
              partnership with our partners enhances our ability to deliver our services in a time
              bound manner.
            </p>
            <p>
              In the last decade, we've partnered with businesses to align our strategies with
              evolving objectives and goals. New collaborations and associations that have
              been made has strengthened our commitment in providing innovative solutions that
              drive sustainable business results, helping our clients thrive in today's dynamic
              environment while preparing for the future.
            </p>
            <div className="highlight">
              Together with our partners, we remain dedicated to building resilience, readiness, and results for customer organizations and individuals alike.
            </div>
          </div>
        </div>
      </section>

      <section className="mission">
        <div className="container">
          <h2>Our Mission</h2>
          <div className="mission-statement">
            <p>
              To provide active support and excellent services in key verticals of Pharmaceutics, 
              Clinical Laboratories, Hospitality and Logistic management to the public, the healthcare 
              industry, private & public sector organizations and other allied strategic socio-economic 
              sectors for a positive, scalable and lasting outcome.
            </p>
          </div>
          
          <h3>Our mission is to develop strong business relationships by:</h3>
          <div className="mission-points">
            <div className="mission-point">
              <div className="point-number">01</div>
              <div className="point-content">
                <p>
                  Taking a genuine interest in our clients and striving to understand how they
                  define success. Working hard to provide superior services on a timely, effective,
                  and efficient basis, while maintaining the highest standards of professional
                  integrity.
                </p>
              </div>
            </div>
            
            <div className="mission-point">
              <div className="point-number">02</div>
              <div className="point-content">
                <p>
                  Fostering an enjoyable working environment, based on open communication and
                  mutual respect, and encouraging initiative, innovation, teamwork, and loyalty.
                </p>
              </div>
            </div>
            
            <div className="mission-point">
              <div className="point-number">03</div>
              <div className="point-content">
                <p>
                  Working to achieve profitable growth and long-term financial success for today
                  and future generations.
                </p>
              </div>
            </div>
            
            <div className="mission-point">
              <div className="point-number">04</div>
              <div className="point-content">
                <p>
                  Our mission is to create synergies of the various professional values with a
                  focus on delivering value-based services that result in the maximization of client
                  worth and the enhancement of business prospects and growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vision">
        <div className="container">
          <h2>Our Vision</h2>
          <div className="vision-content">
            <p>
              To be the most preferred partner in our chosen mission sectors, while promoting scale and 
              sustainable growth with focus on creating value for all stakeholders and become a company 
              of stature where customer satisfaction and their interests are cared for by a professional 
              team that enjoys working with them and one another by constantly striving for excellence 
              in all related activities by ensuring the highest quality standards.
            </p>
          </div>
        </div>
      </section>

      <section className="core-values">
        <div className="container">
          <h2>Core Values</h2>
          <div className="values-intro">
            <p>
              We are a company committed to top class affordable quality services to our
              clients, with the highest level of integrity, customer focus and impeccable
              credibility.
            </p>
            <p>
              To make a positive impact in the lives and livelihood of our society leading to
              sustainable growth, thus contributing towards the Creation of a Vibrant Bharat
              through:
            </p>
          </div>
          
          <div className="values-grid">
            <div className="value-card">
              <h3>FOCUSSED RELATIONSHIPS</h3>
              <p>
                We believe in building engaged relationships with our clients, partners,
                employees, and community. The growth and success of our business is built on our belief
                in developing sustainable long-term relationships and customer engagement.
              </p>
            </div>
            
            <div className="value-card">
              <h3>TRUST & COMMITMENT</h3>
              <p>
                We foster an environment of trust and commitments for our clients, to each
                other, and to the company. We take ownership of our work and hold ourselves
                accountable for results that is mutually beneficial for a sustained growth.
              </p>
            </div>
            
            <div className="value-card">
              <h3>INTEGRITY</h3>
              <p>
                We deliver our services with the highest degree of professionalism, integrity,
                and courtesy in our actions with each other and our clients.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
