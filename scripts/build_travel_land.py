#!/usr/bin/env python3
"""Build the travel basemap from Natural Earth's 1:10m physical vectors.

Run manually, not during normal site builds. Source data is cached outside the repo.
Keeps the same equirectangular projection used for marker positions in travel.js.
"""
import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAYERS = ('land', 'minor_islands', 'lakes', 'coastline',
          'admin_0_boundary_lines_land', 'admin_1_states_provinces_lines')
BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
# Simplify subpixel coastline noise at overview; keep regional contours when zoomed.
TOLERANCE = 0.08


def project(point):
    lon, lat = point[:2]
    if not (-180.001 <= lon <= 180.001 and -90.001 <= lat <= 90.001):
        raise ValueError(f'Invalid coordinate {point}')
    return ((lon + 180) * 2.5, (90 - lat) * 2.5)


def simplify(points, tolerance=TOLERANCE):
    """Ramer-Douglas-Peucker, preserving endpoints and ring closure."""
    if len(points) < 3:
        return points
    keep = {0, len(points) - 1}
    pending = [(0, len(points) - 1)]
    while pending:
        start, end = pending.pop()
        ax, ay = points[start]
        dx, dy = points[end][0] - ax, points[end][1] - ay
        length = dx * dx + dy * dy
        maximum, index = 0, start
        for i in range(start + 1, end):
            px, py = points[i][0] - ax, points[i][1] - ay
            t = max(0, min(1, (px * dx + py * dy) / length)) if length else 0
            distance = (px - t * dx) ** 2 + (py - t * dy) ** 2
            if distance > maximum:
                maximum, index = distance, i
        if maximum > tolerance ** 2:
            keep.add(index)
            pending.extend(((start, index), (index, end)))
    return [points[i] for i in sorted(keep)]


def number(value):
    return f'{value:.2f}'.rstrip('0').rstrip('.') or '0'


def path(ring, closed):
    # Native Natural Earth geometries are already cut at ±180 degrees.
    # Reject malformed connections rather than drawing a line across the world.
    if any(abs(a[0] - b[0]) > 180 for a, b in zip(ring, ring[1:])):
        raise ValueError('Unsplit antimeridian edge')
    points = simplify([project(p) for p in ring])
    if closed:
        # Keep even very small islands instead of dropping a collapsed ring.
        if len(points) < 4:
            points = simplify([project(p) for p in ring], tolerance=0.001)
            if len(points) < 4:
                points = [project(p) for p in ring]
        points = points[:-1] if points[0] == points[-1] else points
    return 'M' + 'L'.join(f'{number(x)},{number(y)}' for x, y in points) + ('Z' if closed else '')


def render(data, lines=False):
    paths = []
    for feature in data['features']:
        geometry = feature['geometry']
        if geometry is None:
            continue  # Source records without mapped geometry have nothing to draw.
        kind, coords = geometry['type'], geometry['coordinates']
        if lines:
            if kind not in ('LineString', 'MultiLineString'):
                raise ValueError(kind)
            for line in ([coords] if kind == 'LineString' else coords):
                paths.append(f'<path d="{path(line, False)}"/>')
        else:
            if kind not in ('Polygon', 'MultiPolygon'):
                raise ValueError(kind)
            for polygon in ([coords] if kind == 'Polygon' else coords):
                # Outer ring and holes share one even-odd path. Never connect polygons.
                paths.append('<path d="' + ''.join(path(ring, True) for ring in polygon) + '"/>')
    return ''.join(paths)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, default=Path(tempfile.gettempdir()))
    args = parser.parse_args()
    datasets, hashes = {}, {}
    for name in LAYERS:
        source = args.source_dir / f'travel-10m-{name}.geojson'
        if not source.exists():
            subprocess.run(['curl', '--fail', '--location', '--silent', '--show-error',
                            '--max-time', '120', BASE + f'ne_10m_{name}.geojson',
                            '-o', str(source)], check=True)
        raw = source.read_bytes()
        datasets[name] = json.loads(raw)
        hashes[name] = hashlib.sha256(raw).hexdigest()
    # Keep first-level administrative borders only for U.S. states.
    us_states = {'features': [feature for feature in datasets['admin_1_states_provinces_lines']['features']
                              if feature['properties'].get('ADM0_A3') == 'USA']}
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 450">'
           '<title>World land, coastlines, and administrative borders</title>'
           '<desc>Natural Earth 1:10m physical and administrative vectors, equirectangular projection.</desc>'
           '<g fill="#152934" fill-rule="evenodd" stroke="none">'
           + render(datasets['land']) + render(datasets['minor_islands']) + '</g>'
           '<g fill="#0b1018" fill-rule="evenodd" stroke="none">'
           + render(datasets['lakes']) + '</g>'
           '<g fill="none" stroke="#243b48" stroke-width=".08" stroke-linejoin="round">'
           + render(datasets['coastline'], lines=True) + '</g>'
           '<g fill="none" stroke="#41535f" stroke-opacity=".45" stroke-width=".07" stroke-linejoin="round">'
           + render(us_states, lines=True) + '</g>'
           '<g fill="none" stroke="#526774" stroke-opacity=".6" stroke-width=".13" stroke-linejoin="round">'
           + render(datasets['admin_0_boundary_lines_land'], lines=True) + '</g></svg>')
    output = ROOT / 'assets/travel-land.svg'
    output.write_text(svg)
    (ROOT / 'scripts/travel-map-sources.json').write_text(json.dumps({
        'source': BASE, 'scale': '1:10m', 'projection': 'equirectangular',
        'simplification_tolerance_svg_units': TOLERANCE, 'sha256': hashes,
    }, indent=2) + '\n')
    print(f'Built detailed travel basemap ({output.stat().st_size:,} bytes)')


if __name__ == '__main__':
    main()
