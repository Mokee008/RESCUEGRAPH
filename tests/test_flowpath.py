"""
Unit tests for Topographic Flow Path Tracing (Track Bonus 6).
"""

import numpy as np
import pytest

from floodsat.terrain.flowpath import FlowPathTracer


def test_flowpath_traces_downhill_along_canyon():
    """Verify D8 flow tracer moves downhill toward valley floor and identifies downstream settlements."""
    h, w = 50, 50
    bbox = (85.1, 27.9, 85.3, 28.1)

    # Synthetic canyon:
    # Elevation drops from top (r=0, elev=2500m) to bottom (r=49, elev=600m)
    # with a center valley groove at c=25
    r_idx = np.arange(h)[:, None]
    c_idx = np.arange(w)[None, :]
    valley_groove = np.abs(c_idx - 25) * 15.0
    dem = (2500.0 - r_idx * 35.0 + valley_groove).astype(np.float32)

    # Downstream settlement at bottom of the groove (lon=85.20, lat=27.92 -> r ~ 45, c=25)
    osm_infrastructure = {
        "settlements": [
            {
                "type": "Feature",
                "properties": {"name": "Downstream Riverside Village", "building_count": 35},
                "geometry": {"type": "Point", "coordinates": [85.20, 27.93]},
            }
        ],
        "roads": [],
    }

    # Start upstream near mountain headwater (c=25, r=5 -> lon=85.20, lat=28.08)
    upstream_coord = (85.20, 28.08)

    tracer = FlowPathTracer(step_size_meters=30.0, corridor_width_pixels=3)
    result = tracer.trace_downstream(
        upstream_coord=upstream_coord,
        dem=dem,
        bbox=bbox,
        osm_infrastructure=osm_infrastructure,
        max_steps=100,
    )

    assert result.path_length_km > 0.5
    assert result.elevation_drop_meters > 500.0
    assert len(result.path_coordinates) >= 10

    # Path must remain centered in the valley groove (lon ~ 85.20)
    avg_lon = np.mean([pt[0] for pt in result.path_coordinates])
    assert avg_lon == pytest.approx(85.20, abs=0.03)

    # Must detect downstream threatened settlement
    assert len(result.threatened_settlements) == 1
    assert result.threatened_settlements[0]["name"] == "Downstream Riverside Village"
