import React from "react";
import styled from "styled-components";
import { Element } from "react-scroll";
import { Container } from "react-bootstrap";
import Title from "./Title";

const StyledAwards = styled.section`
  ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    color: #999;
  }

  .award-item {
    margin-top: 0.8rem;
    margin-bottom: 0.8rem;
    font-size: 1.1rem;
    color: #999;

    a {
      color: --bs-primary;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const Awards = () => (
  <Element name="Awards" id="awards">
    <StyledAwards className="section">
      <Container>
        <Container className="d-flex justify-content-center">
          <Title size="h2" text="Scholarships and Awards" />
        </Container>

        <ul>
          <li className="award-item">
            <a
              href="https://nasa.epscorspo.nevada.edu/funding/2024-2025-nvsgc-fellowship/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nevada NASA Space Grant Graduate Research Opportunity Fellowship
            </a>{" "}
            <span style={{ color: "#999" }}>| 2024 – 2025</span>
          </li>
          {/* Add more awards here */}
        </ul>
      </Container>
    </StyledAwards>
  </Element>
);

export default Awards;
