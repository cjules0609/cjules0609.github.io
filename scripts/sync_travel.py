#!/usr/bin/env python3
"""Refresh the public travel map; retain labels and resolve only new locations."""
import argparse
import json
import time
import urllib.parse
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'assets/travel-places.json'
MAP_URL = 'https://www.google.com/maps/d/kml?mid=17n2ZIb2f9yLA-oxFEmV9xy91XsnNMfE&forcekml=1'
NS = {'k': 'http://www.opengis.net/kml/2.2'}

def download(url):
    return subprocess.check_output([
        'curl', '--fail', '--silent', '--show-error', '--location',
        '--retry', '2', '--max-time', '45',
        '--user-agent', 'ConneryChenTravelMap/1.0 (https://cjules0609.github.io)',
        '--header', 'Accept-Language: en', url,
    ])

def sync(kml=None):
    previous = json.loads(DATA.read_text())
    def key(p):
        return (round(p['lon'], 5), round(p['lat'], 5))
    labels = {key(p): p for p in previous}
    tree = ET.fromstring(Path(kml).read_bytes() if kml else download(MAP_URL))
    result = []
    for marker in tree.findall('.//k:Placemark', NS):
        raw = marker.findtext('.//k:Point/k:coordinates', namespaces=NS)
        if not raw:
            continue
        lon, lat, *_ = map(float, raw.strip().split(','))
        name = marker.findtext('k:name', default='Destination', namespaces=NS)
        place = {'name': name, 'lon': lon, 'lat': lat}
        old = labels.get(key(place))
        if old and old.get('country'):
            place.update({field: old.get(field, '') for field in ('region', 'country')})
        else:
            # Respect Nominatim's maximum request rate, only for newly added points.
            time.sleep(1.1)
            query = urllib.parse.urlencode({'format': 'jsonv2', 'lat': lat, 'lon': lon, 'zoom': 10})
            address = json.loads(download('https://nominatim.openstreetmap.org/reverse?' + query)).get('address', {})
            if not address.get('country'):
                raise RuntimeError(f'Could not resolve country for {name}; existing data left intact')
            place['country'] = address['country']
            place['region'] = address.get('state', address.get('region', ''))
        result.append(place)
    if not result:
        raise RuntimeError('Map returned no locations; existing data left intact')
    DATA.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f'Refreshed {len(result)} travel locations')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--kml', help='Use a local KML export instead of downloading')
    sync(parser.parse_args().kml)
