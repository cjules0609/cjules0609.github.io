#!/usr/bin/env python3
"""Refresh the public travel map; retain labels and resolve only new locations."""
import argparse
import json
import subprocess
import time
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "assets/travel-places.json"
MAP_URL = (
    "https://www.google.com/maps/d/kml"
    "?mid=17n2ZIb2f9yLA-oxFEmV9xy91XsnNMfE&forcekml=1"
)
GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse?"
USER_AGENT = "ConneryChenTravelMap/1.0 (https://cjules0609.github.io)"
KML_NS = {"k": "http://www.opengis.net/kml/2.2"}
GEOCODE_DELAY = 1.1  # Nominatim's maximum request rate is one per second.


def download(url):
    """Fetch a URL with curl and return the response body as bytes."""
    return subprocess.check_output([
        "curl", "--fail", "--silent", "--show-error", "--location",
        "--retry", "2", "--max-time", "45",
        "--user-agent", USER_AGENT,
        "--header", "Accept-Language: en", url,
    ])


def coordinate_key(place):
    """Round coordinates so the same point matches across refreshes."""
    return (round(place["lon"], 5), round(place["lat"], 5))


def parse_placemarks(kml_bytes):
    """Yield {name, lon, lat} for every point placemark in a KML document."""
    root = ET.fromstring(kml_bytes)
    for marker in root.findall(".//k:Placemark", KML_NS):
        raw = marker.findtext(".//k:Point/k:coordinates", namespaces=KML_NS)
        if not raw:
            continue
        lon, lat, *_ = map(float, raw.strip().split(","))
        name = marker.findtext("k:name", default="Destination", namespaces=KML_NS)
        yield {"name": name, "lon": lon, "lat": lat}


def reverse_geocode(place):
    """Return (country, region) for a place via Nominatim."""
    time.sleep(GEOCODE_DELAY)
    query = urllib.parse.urlencode(
        {"format": "jsonv2", "lat": place["lat"], "lon": place["lon"], "zoom": 10}
    )
    address = json.loads(download(GEOCODE_URL + query)).get("address", {})
    if not address.get("country"):
        raise RuntimeError(
            f"Could not resolve country for {place['name']}; "
            "existing data left intact"
        )
    return address["country"], address.get("state", address.get("region", ""))


def sync(kml=None):
    """Rewrite the travel data file, geocoding only newly added points."""
    known = {coordinate_key(p): p for p in json.loads(DATA_PATH.read_text())}
    kml_bytes = Path(kml).read_bytes() if kml else download(MAP_URL)

    result = []
    for place in parse_placemarks(kml_bytes):
        old = known.get(coordinate_key(place))
        if old and old.get("country"):
            place["region"] = old.get("region", "")
            place["country"] = old.get("country", "")
        else:
            place["country"], place["region"] = reverse_geocode(place)
        result.append(place)

    if not result:
        raise RuntimeError("Map returned no locations; existing data left intact")
    DATA_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(f"Refreshed {len(result)} travel locations")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kml", help="Use a local KML export instead of downloading")
    sync(parser.parse_args().kml)


if __name__ == "__main__":
    main()
