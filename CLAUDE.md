# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Preview source files directly
python3 -m http.server 4173          # open http://localhost:4173/

# Build the deployable _site/ output
python3 build.py

# Preview the built output
python3 -m http.server 4174 --directory _site

# Refresh travel map data from Google My Maps (requires network)
python3 scripts/sync_travel.py

# Use a local KML export instead of downloading
python3 scripts/sync_travel.py --kml path/to/export.kml
```

`_site/` is generated and git-ignored; regenerate it with `build.py` before previewing the final deployment artifact. Opening `index.html` directly in a browser also works for quick checks.

## Architecture

This is a no-build, no-npm static site. There is no bundler, transpiler, or package manager for the current site. `legacy/` contains the old React implementation and can be ignored.

### SPA-like navigation shell (`app.js`)

`app.js` runs once on page load and is the core of the site. It:

1. Wraps the entire `<body>` in a `#site-content` div and appends a `.spotify-host` div **outside** that wrapper, keeping the Spotify iframe alive across navigations.
2. Intercepts all same-origin `<a>` clicks, fetches the target page, replaces `content.innerHTML` with the response body, and updates `document.title` — no full page reload.
3. After each navigation, calls `init()`, which calls the three optional page-init functions: `window.initResearch?.()`, `window.initPlaylists?.()`, and `window.initTravelMap?.()`.
4. `initResearch` (in `script.js`) returns a cleanup function; `app.js` calls it before tearing down the old page to abort scroll/resize listeners via `AbortController`.

Legacy hash anchors (`#research`, `#about`, `#contact` on `/`) are redirected to their canonical pages by `legacyResearch()` and the inline redirect checks in `app.js`.

### Page-specific init functions

| File | Exported global | Purpose |
|---|---|---|
| `script.js` | `window.initResearch` | Scroll-driven hero animation, research-symbol scrub animations, publication list rendering, ADS links |
| `personal.js` | `window.initPlaylists` | Playlist tab keyboard navigation; delegates to `window.musicPlayer.select()` |
| `travel.js` | `window.initTravelMap` | SVG pan/zoom, point rendering from `assets/travel-places.json` |

### Persistent music player

`app.js` manages the Spotify iframe state machine:

- **Inline mode**: while `#inline-spotify-slot` exists in the DOM and playback hasn't started, the iframe is absolutely positioned over that slot (452 px tall).
- **Docked mode**: once `playback_started` fires, the iframe becomes an 80 px bottom-center bar on every page and `<body>` gets `has-native-music` (used in CSS to add bottom padding).
- `window.musicPlayer` exposes `open()` and `select(id)` for use by `personal.js`.

### Build pipeline

`build.py` is a plain file copier. It maintains an explicit allowlist of files to copy into `_site/` and raises `FileNotFoundError` for any missing entry. Adding a new asset requires adding it to the `files` list in `build.py`.

### Travel data

`assets/travel-places.json` stores visited locations with `{name, lon, lat, region, country}`. `scripts/sync_travel.py` downloads the public Google My Maps KML, diffs against existing coordinates, and calls Nominatim only for newly added points (1.1 s rate limit). The file is committed locally but rebuilt from Google on each scheduled CI run, so committed data may lag the live map by one deploy cycle.

### Deployment

CI (`.github/workflows/deploy-pages.yml`) runs `sync_travel.py` then `build.py` and uploads `_site/` to GitHub Pages on every push to `main` and daily at 11:17 UTC. No custom domain is configured.

### Email obfuscation

The contact email is stored base64-encoded in `app.js` and decoded only on click of `#reveal-email`. Do not replace this with a plaintext `mailto:` link.
