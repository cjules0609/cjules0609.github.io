import React from "react";
// Styles
import styled from "styled-components";
// State
import PropTypes from "prop-types";
// Components
import SocialLinks from "./SocialLinks";

// #region styled-components
const StyledFooter = styled.footer`
  background: var(--bs-primary);
  padding: 1rem 0;

  a {
    color: ${({ $mode }) =>
      $mode?.toLowerCase() === "light" ? "var(--bs-light)" : "var(--bs-gray-dark)"};

    &:hover {
      color: ${({ $mode }) =>
        $mode?.toLowerCase() === "light" ? "var(--bs-gray-dark)" : "var(--bs-light)"};
    }
  }

  .footer-text {
    margin-top: 1rem;
    font-size: 0.5rem;
    color: ${({ $mode }) =>
      $mode?.toLowerCase() === "light" ? "var(--bs-light)" : "var(--bs-gray-dark)"};
    text-align: center;
  }
`;
// #endregion

// #region component
const propTypes = {
  mode: PropTypes.string.isRequired,
};

const Footer = ({ mode }) => {
  return (
    <StyledFooter $mode={mode} className="d-flex flex-column align-items-center">
      <SocialLinks />
      <p className="footer-text">
        Made with ❤️ by Connery Chen
        <br />
        using React.js, Bootstrap and the GitHub REST API
        <br />
        based on <em>A React Portfolio Template for GitHub</em> by <a href="https://github.com/mshuber1981">Michael Huber</a>
      </p>
    </StyledFooter>
  );
};

Footer.propTypes = propTypes;
// #endregion

export default Footer;
