import React from "react";
import styled from "styled-components";
import { Element } from "react-scroll";
import { Col, Container, Row } from "react-bootstrap";
import Title from "./Title";

// #region styled-components
const StyledExperience = styled.section`
  .experience-item {
    margin-bottom: 2rem;

    h3 {
      font-size: 1.25rem;
      margin-bottom: 0.3rem;
    }

    .role {
      font-weight: 500;
      margin-bottom: 0.3rem;
      font-size: 1.05rem;
      color: #999;
    }

    .date-location {
      font-size: 0.95rem;
      color: #777;
      margin-bottom: 0.5rem;
    }

    ul {
      padding-left: 1.2rem;
      margin: 0;
      list-style-type: disc;
      color: #555;
      font-size: 1rem;

      li {
        margin-bottom: 0.3rem;
      }
    }
  }
`;
// #endregion

// #region component
const experienceData = [
  {
    company: "University of Nevada, Las Vegas",
    role: "Graduate Assistant",
    location: "Las Vegas, NV",
    years: "2021–Current",
    bullets: [
      "Theoretical and computational high-energy and multi-messenger astrophysics",
      "Gamma-ray bursts",
      "Fast radio bursts",
      "Neutrino Astrophysics",
    ],
  },
  {
    company: "SOFIA Science Center – NASA Ames Research Center",
    role: "Research Intern",
    location: "Mountain View, CA",
    years: "2020–2021",
    bullets: [
      "Radiative Alignment Torque Modeling | Advisors: Dr. B-G Andersson and Dr. Kristin Kulas",
      "Modeled observed polarization in the interstellar medium for various grain characteristics",
      "Presented research at USRA, Santa Clara University, and AAS 238th meeting",
    ],
  },
  {
    company: "Age of Learning Inc.",
    role: "Software Engineer",
    location: "Glendale, CA",
    years: "2015–2016",
    bullets: [
      "Software engineer for the product management team",
      "Instituted an employee training course using JavaScript, Node.js, MySQL, jQuery, HTML, CSS",
      "Mapped and developed an interactive floor plan using JavaScript and CSS",
    ],
  },
];

const Experience = () => {
  return (
    <Element name={"Experience"} id="experience">
      <StyledExperience className="section">
        <Container>
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"Experience"} />
          </Container>
          <Row className="mt-5">
            {experienceData.map((exp, index) => (
              <Col key={index} xs={12} md={6} className="experience-item">
                <h3>{exp.company}</h3>
                <div className="role">{exp.role}</div>
                <div className="date-location">
                  {exp.location} | {exp.years}
                </div>
                {exp.bullets && (
                  <ul>
                    {exp.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </Col>
            ))}
          </Row>
        </Container>
      </StyledExperience>
    </Element>
  );
};

export default Experience;