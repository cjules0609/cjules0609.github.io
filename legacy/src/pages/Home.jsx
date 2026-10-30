import React from "react";
// State
import { useGetUsersQuery } from "../app/apiSlice";
// Components
import Hero from "../components/Hero";
import AboutMe from "../components/AboutMe";
import Education from "../components/Education";
import Awards from "../components/Awards";
import Experience from "../components/Experience";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import BackToTop from "../components/BackToTop";
// Config
import { filteredProjects, moreInfo } from "../config";
// Utils
import { updateTitle } from "../utils";
import Presentations from "../components/Presentations";
import Publications from "../components/Publications";

// #region component
const Home = () => {
  const { data: userData } = useGetUsersQuery();

  React.useEffect(() => {
    updateTitle(`${userData.name}`);
  }, [userData]);

  return (
    <>
      <Hero name={userData.name} />
      <main>
        <AboutMe
          avatar_url={userData.avatar_url}
          bio={userData.bio}
          moreInfo={moreInfo}
        />
        <Education />
        <Awards />
        <Experience />
        <Skills />
        <Projects filteredProjects={filteredProjects} />
        <Presentations />
        <Publications />
        <Contact />
      </main>
      <BackToTop />
    </>
  );
};
// #endregion

export default Home;
