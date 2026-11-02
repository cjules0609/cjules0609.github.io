#!/usr/bin/env python3
"""Assemble the reviewed static site without drafts or local metadata."""
from pathlib import Path
import shutil

source = Path(__file__).resolve().parent
target = source / "_site"
files = ["travel.js", "research.html", "app.js", "contact.html", "personal.html", "personal.js", "index.html", "styles.css", "script.js", "service-worker.js",
         "assets/Connery-Chen-CV.pdf", "assets/travel-land.svg", "assets/travel-places.json", "assets/portrait.png", "assets/home-graduation.jpg",
         "assets/favicon.svg", "assets/favicon.ico", "assets/favicon.png",
         "assets/apple-touch-icon.png", "assets/promptx-logo.svg",
         "assets/vegasafterglow-logo.svg"]
for name in files:
    if not (source / name).is_file():
        raise FileNotFoundError(name)
if target.exists():
    shutil.rmtree(target)
for name in files:
    destination = target / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source / name, destination)
(target / ".nojekyll").touch()
print(f"Assembled {len(files)} public files in {target}")
