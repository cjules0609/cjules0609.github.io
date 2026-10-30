import React from "react";
import styled from "styled-components";
import { Element } from "react-scroll";
import { Col, Container, Row } from "react-bootstrap";
import Title from "./Title";

// #region styled-components
const StyledPresentations = styled.section`
  .presentation-item {
    margin-bottom: 2rem;

    .type-venue {
      font-weight: 500;
      font-size: 1.05rem;
      margin-bottom: 0.3rem;
      color: #999;
    }

    .title {
      font-size: 1rem;
      color: #777;
      margin-bottom: 0.2rem;
    }
  }
`;
// #endregion

// #region component
const presentationsData = [
  {
    type: "Contributed Talk",
    venue: "3rd Multi-messenger Symposium at the Nevada Center for Astrophysics",
    date: "Feb. 2025",
    title: "X-ray Emission Signatures from Neutron Star Mergers",
  },
  {
    type: "Poster",
    venue: "GRB50: The Past, Present, and Future of Gamma-Ray Bursts",
    date: "Aug. 2023",
    title: "Numerical Modeling of TeV Photon Emission From GRB 221009A",
  },
  {
    type: "Invited Talk",
    venue: "Symposium on Fast Radio Bursts and Their Astrophysics",
    date: "May 2023",
    title:
      "FRB-SRB-XRB: Geometric and relativistic beaming constraints of fast radio bursts from the Galactic magnetar SGR J1935+2154",
  },
  {
    type: "Poster",
    venue: "1st Multi-messenger Symposium at the Nevada Center for Astrophysics",
    date: "Feb. 2022",
    title:
      "FRB-SRB-XRB: Geometric and relativistic beaming constraints of fast radio bursts from the Galactic magnetar SGR J1935+2154",
  },
  {
    type: "Poster",
    venue: "238th American Astronomical Society Meeting",
    date: "Jun. 2021",
    title: "Radiative Alignment Torque Modeling",
  },
  {
    type: "Seminar",
    venue: "Universities Space Research Association Annual Symposium",
    date: "Sept. 2020",
    title: "Radiative Alignment Torque Modeling",
  },
];

const Presentations = () => {
  return (
    <Element name={"Presentations"} id="presentations">
      <StyledPresentations className="section">
        <Container>
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"Presentations"} />
          </Container>
          <Row className="mt-5">
            {presentationsData.map((pres, index) => (
              <Col key={index} xs={12} md={6} className="presentation-item">
                <div className="type-venue">
                  {pres.type}: {pres.venue} | {pres.date}
                </div>
                <div className="title">{pres.title}</div>
              </Col>
            ))}
          </Row>
        </Container>
      </StyledPresentations>
    </Element>
  );
};

export default Presentations;