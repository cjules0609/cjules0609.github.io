#!/usr/bin/env python3
"""Assemble the static site: copy assets and render pages/ into the shared layout."""
import hashlib
import re
import shutil
from datetime import date
from pathlib import Path

SOURCE = Path(__file__).resolve().parent
TARGET = SOURCE / "_site"
PAGES_DIR = SOURCE / "pages"
PARTIALS_DIR = SOURCE / "partials"
SITE_URL = "https://cjules0609.github.io/"
SHARE_IMAGE = "assets/og-image.png"

# Explicit allowlist: every file copied into _site/ must be listed here.
ASSETS = [
    "travel.js",
    "app.js",
    "personal.js",
    "styles.css",
    "script.js",
    "service-worker.js",
    "assets/Connery-Chen-CV.pdf",
    "assets/travel-land.svg",
    "assets/travel-places.json",
    "assets/portrait.webp",
    "assets/home-graduation.webp",
    "assets/og-image.png",
    "assets/favicon.svg",
    "assets/favicon.ico",
    "assets/favicon.png",
    "assets/apple-touch-icon.png",
    "assets/promptx-logo.svg",
    "assets/vegasafterglow-logo.svg",
]

FRONT_MATTER = re.compile(r"---\n(.*?)\n---\n(.*)", re.S)
PLACEHOLDER = re.compile(r"\{\{(\w+)\}\}")
CURRENT_NAV = re.compile(r"\{\{current:(\w+)\}\}")
CACHE_BUSTED = re.compile(
    r"(?P<path>[\w./-]+\.(?:css|js|ico|svg|png|jpg|webp))\?v=[\w.-]+"
)


def copy_assets():
    """Copy the allowlisted assets into a fresh output directory."""
    for name in ASSETS:
        if not (SOURCE / name).is_file():
            raise FileNotFoundError(name)
    if TARGET.exists():
        shutil.rmtree(TARGET)
    for name in ASSETS:
        destination = TARGET / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(SOURCE / name, destination)


def read_page(path):
    """Split a page into front matter (key: value lines) and its <main> markup."""
    text = path.read_text(encoding="utf-8")
    match = FRONT_MATTER.match(text)
    if not match:
        raise ValueError(f"{path.name}: missing front matter")
    meta = dict(line.split(": ", 1) for line in match[1].splitlines())
    return meta, match[2].strip()


def read_partial(name):
    """Return the contents of partials/<name>.html."""
    return (PARTIALS_DIR / f"{name}.html").read_text(encoding="utf-8").strip()


def page_url(name):
    """Return the absolute URL of a built page (the home page is the site root)."""
    return SITE_URL if name == "index.html" else SITE_URL + name


def render(meta, content, name):
    """Render one page into the shared layout."""
    values = {
        "url": page_url(name),
        "site_url": SITE_URL,
        "image": SITE_URL + SHARE_IMAGE,
        "header": read_partial("header"),
        "footer": read_partial("footer"),
        "return_top": (
            read_partial("return-top") if meta["return_top"] == "yes" else ""
        ),
        "title": meta["title"],
        "description": meta["description"],
        "content": content,
    }
    page = PLACEHOLDER.sub(lambda m: values[m[1]], read_partial("layout"))
    # Mark the nav link for the current page.
    return CURRENT_NAV.sub(
        lambda m: ' aria-current="page"' if m[1] == meta["nav"] else "", page
    )


def render_pages():
    """Render every page in pages/ into the output directory."""
    paths = sorted(path for path in PAGES_DIR.glob("*.html") if not path.name.startswith("."))
    for path in paths:
        meta, content = read_page(path)
        (TARGET / path.name).write_text(render(meta, content, path.name), encoding="utf-8")
    return len(paths)


def write_search_files():
    """Write robots.txt and sitemap.xml for search engines."""
    (TARGET / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n",
        encoding="utf-8",
    )
    entries = []
    for path in sorted(path for path in PAGES_DIR.glob("*.html") if not path.name.startswith(".")):
        modified = date.fromtimestamp(path.stat().st_mtime).isoformat()
        entries.append(
            f"  <url><loc>{page_url(path.name)}</loc>"
            f"<lastmod>{modified}</lastmod></url>"
        )
    (TARGET / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>\n",
        encoding="utf-8",
    )


def stamp(match):
    """Replace a ?v= query string with a short hash of the asset's contents."""
    digest = hashlib.sha1((TARGET / match["path"]).read_bytes()).hexdigest()[:8]
    return f'{match["path"]}?v={digest}'


def cache_bust():
    """Rewrite ?v= placeholders so browsers refetch a file only when it changes."""
    for page in TARGET.glob("*.html"):
        if page.name.startswith("."):
            continue
        text = page.read_text(encoding="utf-8")
        page.write_text(CACHE_BUSTED.sub(stamp, text), encoding="utf-8")


def main():
    copy_assets()
    page_count = render_pages()
    cache_bust()
    write_search_files()
    (TARGET / ".nojekyll").touch()
    print(f"Assembled {len(ASSETS)} assets and {page_count} pages in {TARGET}")


if __name__ == "__main__":
    main()
