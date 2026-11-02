# Connery J. Chen — final website

A standalone, buildless website for GitHub Pages. The previous React implementation, including its existing local edits, is preserved in `legacy/`. No packages, API keys, external fonts, or server are required for production.

## Preview

From this directory, run `python3 -m http.server 4173` and open http://localhost:4173/ . Opening index.html directly also works.

## Update content

- `index.html`: biography, research, teaching, outreach, links, and section order.
- `script.js`: publication metadata, navigation, email reveal, and the scroll-driven hero.
- `styles.css`: colors, spacing, typography, and mobile breakpoints.
- `assets/Connery-Chen-CV.pdf`: replace with a new PDF using the same filename.
- `assets/portrait.png`: replace with a new portrait using the same filename.

The contact button decodes the email only after interaction. This deters simple scraping; the downloadable CV still includes the public professional email address.

The hero is the only interactive viewing-geometry illustration. Scrolling sweeps a bipolar jet past a fixed detector. The “In beam” indicator follows the visible cone boundary. Three detector-facing signal arcs brighten and glow most strongly at exact alignment, fading smoothly away from the axis. Their brightness is schematic rather than calibrated photometry. Reduced-motion users see a static aligned illustration.

## Assemble the final working version

Run `python3 build.py` from the repository root. It creates `_site/` with only the final HTML, CSS, JavaScript, CV, portrait, official software logos, and transparent CC favicon formats. The output is ignored by Git and can be regenerated. Preview that output with `python3 -m http.server 4174 --directory _site`.

Design option sheets are archived outside the repository. macOS resource-fork metadata (`._*`) is ignored. The current header and favicon use the selected large-C/small-C design; favicon backgrounds are transparent.

## Deploy to GitHub Pages

The supplied `deploy-pages.yml.example` is intentionally inactive during design review. Once the design is agreed:

1. Copy that file to `.github/workflows/deploy-pages.yml` at the repository root.
2. Set the repository's Settings → Pages → Source to GitHub Actions.
3. Review the repository diff, then commit and push the final site and workflow.
4. Push to `main` to deploy automatically, or run “Deploy redesigned website” manually from GitHub Actions.

The workflow runs the same assembly script and uploads `_site/` as the public site. The public output excludes documentation, the workflow example, and `legacy/`. No custom domain is assumed. Publication itself requires GitHub access and has not been performed.

## Verification

Verified in browser at phone and desktop widths: no horizontal overflow, portrait loading, section navigation, mobile menu open/close, expandable research, four publications, email reveal, and scroll-driven alignment, cone-boundary detection, and signal-arc brightness. JavaScript syntax checked. Reduced-motion support and keyboard focus styles are included.

Official software logos are copied from the projects’ assets/logo.svg files: github.com/cjules0609/PromptX and github.com/YihanWangAstro/VegasAfterglow.

## Previous implementation

`legacy/` preserves the old React source, package files, local assets, and previous README. Its existing uncommitted changes were retained. The current site needs no npm install or React build. The workflow example is inactive until copied into `.github/workflows/`.

The root `service-worker.js` retires the previous React offline cache for returning visitors. Keep it in the deployment so old browsers can update.

## Persistent music player

`app.js` keeps one native Spotify playlist iframe mounted while internal navigation changes the page content. It appears as the full playlist on Personal before playback starts. Once started, the same iframe becomes an 80-pixel-tall bottom-center player on every page, including Personal. No custom track-loading buttons replace the playlist context. Spotify provides the compact layout and controls, artwork colors, and playback availability. Refreshing or opening a new tab resets the player.

## Page organization

- `index.html`: introduction, scroll-driven hero, research highlights, and links to the rest of the site.
- `research.html`: detailed research, animated illustrations, scientific software, publications, teaching, and outreach.
- `personal.html`: biography, hobbies, and Spotify playlists.
- `contact.html`: email reveal and professional profiles.

All four pages support direct loading and persistent-player navigation. Legacy homepage research/publication anchors redirect to Research.

### Travel map sync
The Pages workflow refreshes the public Google My Maps locations on every deployment and daily at 11:17 UTC. Run `python3 scripts/sync_travel.py` to refresh locally, then `python3 build.py` to preview. New points use Nominatim for country/state lookup, with requests spaced at least 1.1 seconds apart. Existing coordinate labels are reused. Scheduled deployment data is rebuilt from Google and is not committed to the repository. The map must remain public. Wishlist entries are maintained separately in personal.html.
