"""Regression checks for polygon corruption and marker alignment."""
import unittest
from scripts.build_travel_land import path, project, render


class TravelLandGeometryTests(unittest.TestCase):
    def test_projection_matches_marker_coordinates(self):
        for lon, lat in [(-180, 90), (180, -90), (121.5654, 25.033), (-122.4194, 37.7749)]:
            self.assertEqual(project((lon, lat)), ((lon + 180) * 2.5, (90 - lat) * 2.5))

    def test_separate_islands_are_not_connected(self):
        data = {'features': [{'geometry': {'type': 'MultiPolygon', 'coordinates': [
            [[[0, 0], [1, 0], [1, 1], [0, 0]]],
            [[[10, 10], [11, 10], [11, 11], [10, 10]]],
        ]}}]}
        output = render(data)
        self.assertEqual(output.count('<path '), 2)
        self.assertEqual(output.count('Z'), 2)

    def test_polygon_hole_remains_a_separate_closed_ring(self):
        data = {'features': [{'geometry': {'type': 'Polygon', 'coordinates': [
            [[0, 0], [5, 0], [5, 5], [0, 0]],
            [[1, 1], [2, 1], [2, 2], [1, 1]],
        ]}}]}
        output = render(data)
        self.assertEqual(output.count('<path '), 1)
        self.assertEqual(output.count('M'), 2)
        self.assertEqual(output.count('Z'), 2)

    def test_dateline_chord_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'antimeridian'):
            path([[179, 1], [-179, 1], [179, 2], [179, 1]], True)

    def test_tiny_island_is_retained(self):
        output = path([[1, 1], [1.0001, 1], [1.0001, 1.0001], [1, 1]], True)
        self.assertTrue(output.endswith('Z'))
        self.assertGreaterEqual(output.count('L'), 2)


if __name__ == '__main__':
    unittest.main()
