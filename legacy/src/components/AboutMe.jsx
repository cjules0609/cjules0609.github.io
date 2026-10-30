import React from "react";
// Styles
import styled from "styled-components";
// State
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectMode } from "../app/appSlice";
// Components
import { Element } from "react-scroll";
import { Button, Col, Container, Row } from "react-bootstrap";
import Title from "./Title";
import { resume } from "../config";

// #region styled-components
const StyledAboutMe = styled.section`
  p {
    font-size: 1.25rem;
  }
  .img {
    width: 18rem;
    height: 18rem;
  }
`;
// #endregion

// #region component
const propTypes = {
  avatar_url: PropTypes.string.isRequired,
  bio: PropTypes.string,
  moreInfo: PropTypes.string,
};

const AboutMe = ({ avatar_url, bio, moreInfo }) => {
  const theme = useSelector(selectMode);

  return (
    <Element name={"About"} id="about">
      <StyledAboutMe className="section">
        <Container>
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"About Me"} />
          </Container>
          <Row className="align-items-center mt-5">
            <Col className="d-flex flex-column text-center">
              <Container>
                {bio && <p>{bio}</p>}
                {moreInfo && <p>{moreInfo}</p>}
                {resume && (
            <a href={resume}>
              <Button
                size="lg"
                variant={theme === "light" ? "outline-dark" : "outline-light"}
                className="mt-5"
              >
                View my CV here
              </Button>
            </a>
          )}
              </Container>
            </Col>
            <Col className="d-none d-md-block text-center">
              <img
                src={avatar_url}
                alt="GitHub Avatar"
                loading="lazy"
                className="mx-auto rounded-circle border border-primary-subtle"
                style={{ width: "15rem", height: "15rem" }}
              />
            </Col>
          </Row>
        </Container>
      </StyledAboutMe>
    </Element>
  );
};

AboutMe.propTypes = propTypes;
// #endregion

export default AboutMe;
