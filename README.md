# Connery J. Chen — final website

A standalone, buildless website for GitHub Pages. The previous React implementation, including its existing local edits, is preserved in `legacy/`. No packages, API keys, external fonts, or server are required for production.

## Preview

Run `python3 build.py`, then `python3 -m http.server 4174 --directory _site` and open http://localhost:4174/ . Re-run the build after each edit.

## Update content

- `pages/*.html`: page copy (front matter plus `<main>`). Shared `<head>`, header/nav and footer live once in `partials/`.
- `script.js`: publication metadata (`publications` array) and the scroll-driven research animations.
- `app.js`: SPA-style navigation, persistent Spotify player, email reveal.
- `styles.css`: colors, spacing, typography, and breakpoints.
- `assets/Connery-Chen-CV.pdf` and `assets/portrait.webp`: replace in place, keeping the filename.

The contact button decodes the email only after interaction. This deters simple scraping; the downloadable CV still includes the public professional email address.

The hero is the only interactive viewing-geometry illustration. Scrolling sweeps a bipolar jet past a fixed detector. The “In beam” indicator follows the visible cone boundary. Three detector-facing signal arcs brighten and glow most strongly at exact alignment, fading smoothly away from the axis. Their brightness is schematic rather than calibrated photometry. Reduced-motion users see a static aligned illustration.

## Assemble the final working version

Run `python3 build.py` from the repository root. It creates `_site/` with only the final HTML, CSS, JavaScript, CV, portrait, official software logos, and transparent CC favicon formats. The output is ignored by Git and can be regenerated. Preview that output with `python3 -m http.server 4174 --directory _site`.

Design option sheets are archived outside the repository. macOS resource-fork metadata (`._*`) is ignored. The current header and favicon use the selected large-C/small-C design; favicon backgrounds are transparent.

## Deploy to GitHub Pages

`.github/workflows/deploy-pages.yml` runs `sync_travel.py` (non-blocking if it fails) and `build.py`, then deploys `_site/` on every push to `main` and daily at 11:17 UTC. Pages source must be set to GitHub Actions. `build.py` also replaces the `?v=` query strings in the HTML with content hashes for cache-busting.

## Verification

Verified in browser at phone and desktop widths: no horizontal overflow, portrait loading, section navigation, mobile menu open/close, expandable research, four publications, email reveal, and scroll-driven alignment, cone-boundary detection, and signal-arc brightness. JavaScript syntax checked. Reduced-motion support and keyboard focus styles are included.

Official software logos are copied from the projects’ assets/logo.svg files: github.com/cjules0609/PromptX and github.com/YihanWangAstro/VegasAfterglow.

## Previous implementation

`legacy/` preserves the old React source, package files, local assets, and previous README. Its existing uncommitted changes were retained. The current site needs no npm install or React build. The workflow example is inactive until copied into `.github/workflows/`.

The root `service-worker.js` retires the previous React offline cache for returning visitors. Keep it in the deployment so old browsers can update.

## Persistent music player

`app.js` keeps one native Spotify playlist iframe mounted while internal navigation changes the page content. It appears as the full playlist on Personal before playback starts. Once started, the same iframe becomes an 80-pixel-tall bottom-center player on every page, including Personal. No custom track-loading buttons replace the playlist context. Spotify provides the compact layout and controls, artwork colors, and playback availability. Refreshing or opening a new tab resets the player.

## Page organization

- `pages/index.html`: introduction, scroll-driven hero, research highlights, and links to the rest of the site.
- `pages/research.html`: detailed research, animated illustrations, scientific software, publications, teaching, and outreach.
- `pages/personal.html`: biography, hobbies, and Spotify playlists.
- `pages/contact.html`: email reveal and professional profiles.

All four pages support direct loading and persistent-player navigation. Legacy homepage research/publication anchors redirect to Research.

### Travel map sync
The Pages workflow refreshes the public Google My Maps locations on every deployment and daily at 11:17 UTC. Run `python3 scripts/sync_travel.py` to refresh locally, then `python3 build.py` to preview. New points use Nominatim for country/state lookup, with requests spaced at least 1.1 seconds apart. Existing coordinate labels are reused. Scheduled deployment data is rebuilt from Google and is not committed to the repository. The map must remain public. Wishlist entries are maintained separately in personal.html.

### Travel basemap geometry
`assets/travel-land.svg` is generated from Natural Earth's public-domain 1:10m land, coastline, minor-island, lake, country-boundary, and state/province-boundary layers, using the same equirectangular projection as the travel markers. Run `python3 scripts/build_travel_land.py` to rebuild it (downloads and caches the source GeoJSON in the system temp directory). `scripts/travel-map-sources.json` records dataset hashes. Land fills and coastline strokes are separate to avoid outlining internal polygon partitions. Rings and polygon holes are preserved, and antimeridian jumps are rejected. This is a detailed world overview, not a street-level map.

The travel map shows country borders worldwide and state borders only in the United States.
