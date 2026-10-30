import React from "react";
// Styles
import styled from "styled-components";
// State
import { useGetUsersQuery, useGetSocialsQuery } from "../app/apiSlice";
// Icons
import { Icon } from "@iconify/react";
// Config
import { Blog } from "../config";

// #region styled-components
const StyledSocialLinks = styled.div`
  a {
    margin: 0 1rem;
  }
`;
// #endregion

// #region component
const SocialLinks = () => {
  const { data: userData } = useGetUsersQuery();
  const { isSuccess, error, data: socialsData } = useGetSocialsQuery();

  React.useEffect(() => {
    if (error) {
      console.log(
        `${error.status} - check getSocials query in src/app/apiSlice.js`
      );
    }
  }, [error, socialsData]);

  return (
    <StyledSocialLinks>
      {/* GitHub link */}
      <a
        href={userData.html_url}
        aria-label="Check out my GitHub profile."
        className="link-icons"
      >
        <Icon icon="icomoon-free:github" />
      </a>

      {/* Socials from GitHub API */}
      {isSuccess &&
        socialsData.map((element, index) => {
          let icon;
          switch (element.provider) {
            case "linkedin":
              icon = <Icon icon="bi:linkedin" width="24" height="24"/>;
              break;
            case "twitter":
              icon = <Icon icon="fa6-brands:square-x-twitter" />;
              break;
            case "facebook":
              icon = <Icon icon="fa-brands:facebook-square" />;
              break;
            case "instagram":
              icon = <Icon icon="fa-brands:instagram-square" />;
              break;
            default:
              icon = <Icon icon="ph:link-bold" />;
              break;
          }
          return (
            <a
              key={index}
              href={element.url}
              aria-label="External link"
              className="link-icons"
            >
              {icon}
            </a>
          );
        })}

      {/* ORCID hardcoded */}
      <a
        href="https://orcid.org/YOUR_ORCID_ID"
        aria-label="ORCID profile"
        className="link-icons"
      >
        <Icon icon="simple-icons:orcid" />
      </a>

      {/* Google Scholar hardcoded */}
      <a
        href="https://scholar.google.com/citations?user=hug6jm0AAAAJ&hl=en"
        aria-label="Google Scholar profile"
        className="link-icons"
      >
        <Icon icon="fa7-brands:google-scholar" />
      </a>

      {/* Blog link */}
      {userData.blog && (
        <a
          href={userData.blog}
          aria-label="External link"
          className="link-icons"
        >
          {Blog ? Blog : <Icon icon="ph:link-bold" />}
        </a>
      )}
    </StyledSocialLinks>
  );
};


export default SocialLinks;
