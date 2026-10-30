import React from "react";
import styled from "styled-components";
import { Element } from "react-scroll";
import { Col, Container, Row } from "react-bootstrap";
import Title from "./Title";

// #region styled-components
const StyledEducation = styled.section`
  .education-item {
    margin-bottom: 2rem;

    h3 {
      font-size: 1.25rem;
      margin-bottom: 0.3rem;
    }

    p {
      margin: 0.2rem 0;
      font-size: 1.05rem;
      color: #777;
    }

    .date-location {
      font-size: 0.95rem;
      color: #999;
    }

    .thesis {
      font-style: italic;
      font-size: 1rem;
      color: #555;
      margin-top: 0.2rem;
    }
  }
`;
// #endregion

// #region component
const educationData = [
  {
    school: "University of Nevada, Las Vegas",
    degree: "Ph.D. in Astrophysics",
    advisor: "Bing Zhang",
    gpa: "3.62/4.00",
    thesis:
      "On Reconciling Theory and Observation in Multimessenger Transients via Numerical Modeling of High-Energy Electromagnetic Emission",
    location: "Las Vegas, NV",
    years: "2021 – May 2026 (expected)",
  },
  {
    school: "Santa Clara University",
    degree: "B.S. in Physics",
    gpa: "3.31/4.00",
    location: "Santa Clara, CA",
    years: "2019 - 2021",
  },
  {
    school: "Hack Reactor",
    degree: "Software Engineering Immersive",
    location: "San Francisco, CA",
    years: "2017 – 2018",
  },
  {
    school: "Glendale Community College",
    gpa: "3.40/4.00",
    location: "Glendale, CA",
    years: "2015 – 2017",
  },
  {
    school: "Pasadena City College",
    gpa: "3.64/4.00",
    location: "Pasadena, CA",
    years: "2015 – 2016",
  },
];

const Education = () => {
  return (
    <Element name={"Education"} id="education">
      <StyledEducation className="section">
        <Container>
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"Education"} />
          </Container>
          <Row className="mt-5">
            {educationData.map((edu, index) => (
              <Col key={index} xs={12} md={6} className="education-item">
                <h3>{edu.school}</h3>
                <p className="date-location">
                  {edu.location} | {edu.years}
                </p>
                {edu.degree && (
                  <p>
                    {edu.degree}
                    {edu.advisor && ` | Advisor: ${edu.advisor}`}
                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                  </p>
                )}
                {edu.thesis && (
                  <p className="thesis">
                    Thesis:{" "}
                    {edu.thesis}
                  </p>
                )}
                {!edu.degree && edu.gpa && <p>GPA: {edu.gpa}</p>}
              </Col>
            ))}
          </Row>
        </Container>
      </StyledEducation>
    </Element>
  );
};

export default Education;
