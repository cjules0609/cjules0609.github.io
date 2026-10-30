import React from "react";
import styled from "styled-components";
import { Element } from "react-scroll";
import { Col, Container, Row } from "react-bootstrap";
import Title from "./Title";
import { publicationsData } from "../data/publications";

const StyledPublications = styled.section`
  .publication-item {
    margin-bottom: 1.5rem;

    .authors {
      font-weight: 500;
      color: #999;
    }

    .pub-title {
      font-style: italic;
      color: --bs-primary;
      margin: 0.2rem 0;
      cursor: pointer;
      text-decoration: none;


      &:hover {
        text-decoration: underline;
      }
    }

    .journal-links {
      font-size: 0.95rem;
      color: #777;
    }
  }
`;

const Publications = () => (
  <Element name="Publications" id="publications">
    <StyledPublications className="section">
      <Container>
        <Container className="d-flex justify-content-center">
          <Title size="h2" text="Publications" />
        </Container>
        <Row className="mt-5">
          {publicationsData.map((pub, index) => (
            <Col key={index} xs={12} md={6} className="publication-item">
              {/* Authors with bolded name */}
              <div className="authors">
                {pub.authors.split(", ").map((author, i, arr) => {
                  const isYou =
                    author.includes("C. Chen") || author.includes("C. J. Chen");
                  return (
                    <span key={i}>
                      {isYou ? <strong>{author}</strong> : author}
                      {i < arr.length - 1 ? ", " : ""}
                    </span>
                  );
                })}
              </div>

              {/* Paper title with link */}
              {pub.link ? (
                <a
                  className="pub-title"
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {pub.title}
                </a>
              ) : (
                <div className="pub-title">{pub.title}</div>
              )}

              {/* Journal / arXiv */}
              <div className="journal-links">
                {pub.journal}
                {pub.arxiv && ` | arXiv:${pub.arxiv}`}
                {pub.volume && `, vol. ${pub.volume}`}
                {pub.number && `, no. ${pub.number}`}
                {pub.pages && `, pp. ${pub.pages}`}
                {pub.date && `, ${pub.date}`}
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </StyledPublications>
  </Element>
);

export default Publications;
