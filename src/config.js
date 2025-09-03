// Skills icons - https://icon-sets.iconify.design/
import { Icon } from "@iconify/react";

// Navbar Logo image (add your image to the src/images directory and uncomment the line below to import your image)
import newLogo from "./images/profile.png"

// Hero Images (add your images to the /images directory with the same names)
import HeroLight from "./images/main_light.jpg";
import HeroDark from "./images/main_dark.jpg";

// Projects Images (add your images to the images directory and import below)
import Logo from "./images/logo.svg";

/* START HERE
 **************************************************************
  Add your GitHub username (string - "YourUsername") below.
*/
export const githubUsername = "cjules0609";

// Navbar Logo image
export const navLogo = newLogo;

/* Main
 ************************************************************** 
  Add a custom blog icon or update the hero images for the Main section.
*/
export const Blog = <Icon icon="mdi:linkedin" />;

// Hero images (imported above - lines 8-9)
export { HeroLight as Light };
export { HeroDark as Dark };

/* About Me
 **************************************************************
  Add a second paragraph for the about me section.
*/
export const moreInfo =
"I love to dream about big ideas, the world is full of them waiting to be discovered. Software engineering, including front-end web development, automated algorithms for quantitative analysis, and theoretical modeling of astrophysical phenomena are some of my tools to implement ideas into reality. I have extensive experience in architecting robust systems for a variety of applications, and am always eager to cultivate the skills necessary to master an interesting project."

/* Skills
 ************************************************************** 
  Add or remove skills in the SAME format below, choose icons here - https://icon-sets.iconify.design/
*/
export const skillData = [
  {
    id: 1,
    skill: <Icon icon="mdi:language-html5" className="display-4" />,
    name: "HTML5",
  },
  {
    id: 2,
    skill: <Icon icon="ion:logo-css3" className="display-4" />,
    name: "CSS3",
  },
  {
    id: 3,
    skill: <Icon icon="fa6-brands:js" className="display-4" />,
    name: "JavaScript",
  },
  {
    id: 4,
    skill: <Icon icon="cib:python" className="display-4" />,
    name: "Python",
  },
  {
    id: 5,
    skill: <Icon icon="cib:cplusplus" className="display-4" />,
    name: "C++",
  },
  {
    id: 6,
    skill: <Icon icon="fluent-mdl2:machine-learning" className="display-4" />,
    name: "Machine Learning",
  },
  {
    id: 7,
    skill: <Icon icon="hugeicons:physics" className="display-4" />,
    name: "Astrophysics",
  },
  {
    id: 8,
    skill: <Icon icon="fluent-mdl2:financial-solid" className="display-4" />,
    name: "Quantitative Analysis",
  },
  {
    id: 9,
    skill: <Icon icon="mdi:teach" className="display-4" />,
    name: "Teaching",
  },
];

// Resume link (string - "https://YourResumeUrl") - I am using CloudFront to share my resume (https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
export const resume = "https://drive.google.com/file/d/13Qm8ZKC5vAgE-hC9gdX1ndMT7HnHXDpJ/view?usp=sharing";

/* Projects
 ************************************************************** 
  List the repo names (string - "your-repo-name") you want to include (they will be sorted alphabetically). If empty, only the first 3 will be included.
*/
export const filteredProjects = ["PromptX", "frb_rm", "VegasAfterglow"];

// Replace the defualt GitHub image for matching repos below (images imported above - lines 7-8)
export const projectCardImages = [
  {
    name: "example-1",
    image: Logo,
  },
];

/* Contact Info
 ************************************************************** 
  Add your formspree endpoint below.
  https://formspree.io/
*/
export const formspreeUrl = "https://formspree.io/f/xzzajrlo";

// Footer icons theme (light or dark)
export const footerTheme = "dark";
