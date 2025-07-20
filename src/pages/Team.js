import React from 'react';
import './Team.css';

const Team = () => {
  const teamMembers = [
    {
      name: 'Jyotiprakash Panda',
      position: 'Group CEO',
      image: 'https://excelcare.us/wp-content/uploads/2025/04/Jyoti-Prakash.png',
      bio: `Mr. Panda has over 15 years of experience in Banking, Finance, Investments,
             Asset Management, Corporate Finance, Private Equity, Equity Research, Real Estate,
             Corporate Strategy and Business Development.`,
      details: [
        'Certified Public Accountant (CPA) from Taxes Board of Accountancy',
        'Advanced Accountancy from Taxes Business School',
        'Masters Degree in Business Administration',
        'Expert in both conventional and corporate banking',
        'Rich experience with large MNC\'s in the Middle East and stock exchanges of UK and USA',
        'Held senior positions as CFO and COO at different corporates, Multinational banks and Private sector',
        'Served as Independent Director and Board Member of several fund companies including London listed financial sector',
        'Instrumental in establishing several Banks and Investment Companies in Kuwait, Saudi Arabia, Bahrain, Dubai, Malaysia, and Mauritius'
      ],
      leadership: 'As Group CEO of Excel Care Solutions Mr.Panda will be instrumental in setting up and developing the services with his strong leadership and communication skills'
    },
    {
      name: 'Dr. Bishnu Charan Pattnaik',
      position: 'Managing Director',
      image: 'https://excelcare.us/wp-content/uploads/2025/04/Dr.-Bishnu-Charan-Pattnaik.png',
      bio: `A dedicated Consultant Physician with 24+ years of experience in Internal Medicine 
            Dr.Bishnu has a keen focus on preventive health and the early detection of diseases.`,
      details: [
        'Expert in developing wellness programs aimed at reducing the risk of chronic illnesses such as diabetes, obesity, and cardiovascular disease',
        'Proven expertise in diagnosing and treating conditions that impact multiple organs',
        'Specialist in autoimmune diseases, metabolic syndrome, and systemic inflammatory conditions',
        '24+ years of experience in Internal Medicine',
        'Focus on preventive health and early detection of diseases'
      ],
      leadership: 'As Managing Director, Dr.Bishnu with his long experience and expertise in the healthcare industry will be crucial to channelise the synergy of Excel Care Solutions to deliver quality services and achieve all round growth.'
    }
  ];

  return (
    <div className="team">
      <section className="team-hero">
        <div className="container">
          <h1>Meet Our Team</h1>
          <p>Leadership driving excellence in healthcare solutions</p>
        </div>
      </section>

      <section className="team-content">
        <div className="container">
          <div className="team-intro">
            <h2>Our Leadership Team</h2>
            <p>
              Our experienced leadership team brings together decades of expertise in healthcare, 
              finance, and business development. Their combined knowledge and vision drive our 
              commitment to delivering exceptional healthcare solutions and fostering strong 
              partnerships worldwide.
            </p>
          </div>

          <div className="team-members">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <div className="member-header">
                  <div className="member-image">
                    <img 
                      src={member.image} 
                      alt={`${member.name} - ${member.position}`}
                      className="member-photo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="image-placeholder" style={{ display: 'none' }}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <h4>{member.position}</h4>
                    <p className="member-bio">{member.bio}</p>
                  </div>
                </div>

                <div className="member-details">
                  <div className="experience-section">
                    <h5>Experience & Qualifications</h5>
                    <ul>
                      {member.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="leadership-section">
                    <h5>Leadership Role at ECS</h5>
                    <p>{member.leadership}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="team-values">
            <h2>Our Team Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <h3>Excellence</h3>
                <p>Committed to delivering the highest quality healthcare solutions</p>
              </div>
              <div className="value-item">
                <h3>Collaboration</h3>
                <p>Working together to achieve common goals and build lasting partnerships</p>
              </div>
              <div className="value-item">
                <h3>Innovation</h3>
                <p>Embracing new technologies and approaches to improve healthcare delivery</p>
              </div>
              <div className="value-item">
                <h3>Leadership</h3>
                <p>Leading by example and inspiring others to achieve their best</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;
