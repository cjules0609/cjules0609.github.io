import React from "react";

// Components
import { Element } from "react-scroll";
import {Col, Container, Row } from "react-bootstrap";
import Title from "./Title";
// Config
import { skillData } from "../config";

// #region component
const Skills = () => {

  return (
    <Element name={"Skills"} id="skills">
      <section className="section">
        <Container className="text-center">
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"Skills"} />
          </Container>
          <Row className="mt-3 align-items-center">
            {skillData.map((skills) => {
              return (
                <Col xs={4} key={skills.id} className="my-md-5">
                  <figure>
                    {skills.skill}
                    <figcaption>{skills.name}</figcaption>
                  </figure>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>
    </Element>
  );
};
// #endregion

export default Skills;
