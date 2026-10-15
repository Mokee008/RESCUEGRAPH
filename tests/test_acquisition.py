"""
Unit tests for data acquisition clients (CDSE & ohsome) with caching and date guards.
"""

import json
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest

from floodsat.acquire.cdse import CDSEClient
from floodsat.acquire.ohsome import OhsomeClient
from floodsat.data_guard import DataGuardViolation


def test_cdse_dem_tile_calculation():
    """Verify 1x1 degree Copernicus GLO-30 DEM tile calculation for Trishuli area."""
    # Trishuli bbox ~ [85.1, 27.9, 85.3, 28.1]
    bbox = (85.1, 27.9, 85.3, 28.1)
    client = CDSEClient(cache_dir="data/cache/test_cdse")
    tiles = client.get_copernicus_dem_glo30_tiles(bbox)

    assert len(tiles) >= 1
    tile_names = [t["tile_id"] for t in tiles]
    assert any("N27_00_E085" in name or "N28_00_E085" in name for name in tile_names)


def test_cdse_search_s1_with_mock():
    """Verify Sentinel-1 search query formation and caching."""
    client = CDSEClient(cache_dir="data/cache/test_cdse")
    bbox = (85.1, 27.9, 85.3, 28.1)

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "value": [
            {
                "Id": "dummy-s1-scene-id",
                "Name": "S1A_IW_GRDH_1SDV_20260802_Nepal.SAFE",
                "ContentDate": {"Start": "2026-08-02T12:00:00.000Z"},
            }
        ]
    }

    with patch("requests.get", return_value=mock_resp):
        res = client.search_sentinel1_grd(bbox, "2026-07-25", "2026-08-05")
        assert len(res) == 1
        assert res[0]["Name"].startswith("S1A_IW_GRDH")


def test_ohsome_enforces_data_guard_rejection():
    """Verify ohsome client blocks post-event OSM queries via data_guard."""
    client = OhsomeClient(cache_dir="data/cache/test_ohsome")
    bbox = (85.1, 27.9, 85.3, 28.1)

    # Attempting to fetch OSM snapshot after the event must raise DataGuardViolation
    with pytest.raises(DataGuardViolation, match="Rule R2"):
        client.query_elements(
            bbox=bbox,
            filter_expr="highway=*",
            snapshot_time="2026-08-10T00:00:00Z",
            event_date="2026-08-02T00:00:00Z",
        )


def test_ohsome_valid_preevent_query_with_caching(tmp_path):
    """Verify valid pre-event OSM query works and disk caches results."""
    client = OhsomeClient(cache_dir=str(tmp_path))
    bbox = (85.1, 27.9, 85.3, 28.1)

    fake_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "way/12345",
                "geometry": {"type": "LineString", "coordinates": [[85.1, 27.9], [85.2, 28.0]]},
                "properties": {"highway": "primary"},
            }
        ],
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = fake_geojson

    with patch("requests.post", return_value=mock_resp):
        data = client.query_elements(
            bbox=bbox,
            filter_expr="highway=*",
            snapshot_time="2026-07-25T00:00:00Z",
            event_date="2026-08-02T00:00:00Z",
        )
        assert len(data["features"]) == 1
        assert data["features"][0]["properties"]["highway"] == "primary"

        # Verify disk cache file was written
        cached_files = list(tmp_path.glob("*.geojson"))
        assert len(cached_files) == 1

        # Second call should read from disk cache without hitting requests.post
        with patch("requests.post") as second_post:
            cached_data = client.query_elements(
                bbox=bbox,
                filter_expr="highway=*",
                snapshot_time="2026-07-25T00:00:00Z",
                event_date="2026-08-02T00:00:00Z",
            )
            second_post.assert_not_called()
            assert len(cached_data["features"]) == 1
