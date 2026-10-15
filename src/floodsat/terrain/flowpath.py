"""
Topographic Flow Path Tracing and Downstream Impact Corridor (Track Bonus 6).

Implements:
1. D8 steepest descent flow routing with pit/sink breach handling over Copernicus DEM.
2. Downstream trajectory tracing from an arbitrary upstream clicked coordinate (e.g. glacial lake breach).
3. Geospatial intersection of the simulated downstream flow corridor with settlements and roads.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Tuple
import numpy as np


@dataclass
class FlowPathTraceResult:
    upstream_point: Tuple[float, float]               # (lon, lat)
    path_coordinates: List[Tuple[float, float]]       # [(lon, lat), ...]
    path_length_km: float
    elevation_drop_meters: float
    threatened_settlements: List[Dict[str, Any]]
    threatened_roads_count: int
    corridor_polygon_coords: List[Tuple[float, float]]
    metadata: Dict[str, Any]


class FlowPathTracer:
    """
    Topographic D8 flow routing engine over Copernicus GLO-30 DEM.
    """

    def __init__(self, step_size_meters: float = 30.0, corridor_width_pixels: int = 3):
        self.step_size_meters = step_size_meters
        self.corridor_width_pixels = corridor_width_pixels

        # D8 neighbor offsets: (dy, dx)
        self.d8_offsets = [
            (-1, 0),   # N
            (-1, 1),   # NE
            (0, 1),    # E
            (1, 1),    # SE
            (1, 0),    # S
            (1, -1),   # SW
            (0, -1),   # W
            (-1, -1),  # NW
        ]
        # Diagonal distances
        self.d8_distances = [
            1.0, 1.414, 1.0, 1.414, 1.0, 1.414, 1.0, 1.414
        ]

    def trace_downstream(
        self,
        upstream_coord: Tuple[float, float],
        dem: np.ndarray,
        bbox: Tuple[float, float, float, float],
        osm_infrastructure: Dict[str, Any],
        max_steps: int = 500,
    ) -> FlowPathTraceResult:
        """
        Traces steepest downhill gradient path from upstream_coord.
        """
        h, w = dem.shape
        min_lon, min_lat, max_lon, max_lat = bbox

        def coord_to_rc(lon: float, lat: float) -> Tuple[int, int]:
            r = int((max_lat - lat) / (max_lat - min_lat) * (h - 1))
            c = int((lon - min_lon) / (max_lon - min_lon) * (w - 1))
            return max(0, min(h - 1, r)), max(0, min(w - 1, c))

        def rc_to_coord(r: int, c: int) -> Tuple[float, float]:
            lat = max_lat - (r / (h - 1)) * (max_lat - min_lat)
            lon = min_lon + (c / (w - 1)) * (max_lon - min_lon)
            return round(lon, 5), round(lat, 5)

        curr_r, curr_c = coord_to_rc(upstream_coord[0], upstream_coord[1])
        start_elevation = float(dem[curr_r, curr_c])

        path_rc = [(curr_r, curr_c)]
        visited: Set[Tuple[int, int]] = {(curr_r, curr_c)}

        for _ in range(max_steps):
            curr_elev = dem[curr_r, curr_c]
            best_r, best_c = curr_r, curr_c
            steepest_slope = 0.0

            # Scan 8 neighbors
            for (dr, dc), dist in zip(self.d8_offsets, self.d8_distances):
                nr, nc = curr_r + dr, curr_c + dc
                if 0 <= nr < h and 0 <= nc < w:
                    if (nr, nc) in visited:
                        continue
                    drop = curr_elev - dem[nr, nc]
                    slope = drop / (dist * self.step_size_meters)
                    if slope > steepest_slope:
                        steepest_slope = slope
                        best_r, best_c = nr, nc

            # If local pit or flat, breach downhill toward global valley minimum
            if (best_r, best_c) == (curr_r, curr_c):
                # Search 5x5 window for lowest elevation to escape local depression
                r_min, r_max = max(0, curr_r - 2), min(h, curr_r + 3)
                c_min, c_max = max(0, curr_c - 2), min(w, curr_c + 3)
                window = dem[r_min:r_max, c_min:c_max]
                min_idx = np.unravel_index(np.argmin(window), window.shape)
                cand_r, cand_c = r_min + min_idx[0], c_min + min_idx[1]
                if (cand_r, cand_c) not in visited and dem[cand_r, cand_c] < curr_elev:
                    best_r, best_c = cand_r, cand_c
                else:
                    break

            curr_r, curr_c = best_r, best_c
            visited.add((curr_r, curr_c))
            path_rc.append((curr_r, curr_c))

            # Stop if reaching boundary
            if curr_r in (0, h - 1) or curr_c in (0, w - 1):
                break

        # Calculate path length and elevation drop
        total_len_km = round((len(path_rc) * self.step_size_meters) / 1000.0, 2)
        end_elevation = float(dem[path_rc[-1][0], path_rc[-1][1]])
        elev_drop = round(max(0.0, start_elevation - end_elevation), 1)

        path_coords = [rc_to_coord(r, c) for (r, c) in path_rc]

        # Generate corridor footprint buffer (pixels in corridor)
        corridor_mask = np.zeros((h, w), dtype=bool)
        for (pr, pc) in path_rc:
            r0, r1 = max(0, pr - self.corridor_width_pixels), min(h, pr + self.corridor_width_pixels + 1)
            c0, c1 = max(0, pc - self.corridor_width_pixels), min(w, pc + self.corridor_width_pixels + 1)
            corridor_mask[r0:r1, c0:c1] = True

        # Intersect with settlements
        settlements_raw = osm_infrastructure.get("settlements", [])
        settlements = settlements_raw.get("features", []) if isinstance(settlements_raw, dict) else settlements_raw
        threatened_settlements = []

        for s_feat in settlements:
            coords = s_feat.get("geometry", {}).get("coordinates", [])
            if coords:
                sr, sc = coord_to_rc(coords[0], coords[1])
                if corridor_mask[sr, sc]:
                    threatened_settlements.append({
                        "name": s_feat.get("properties", {}).get("name", "Downstream Village"),
                        "building_count": s_feat.get("properties", {}).get("building_count", 30),
                        "lon": coords[0],
                        "lat": coords[1],
                    })

        # Intersect with roads
        roads_raw = osm_infrastructure.get("roads", [])
        roads = roads_raw.get("features", []) if isinstance(roads_raw, dict) else roads_raw
        threatened_roads = 0
        for r_feat in roads:
            coords = r_feat.get("geometry", {}).get("coordinates", [])
            if any(corridor_mask[coord_to_rc(pt[0], pt[1])] for pt in coords):
                threatened_roads += 1

        return FlowPathTraceResult(
            upstream_point=upstream_coord,
            path_coordinates=path_coords,
            path_length_km=total_len_km,
            elevation_drop_meters=elev_drop,
            threatened_settlements=threatened_settlements,
            threatened_roads_count=threatened_roads,
            corridor_polygon_coords=path_coords,
            metadata={
                "steps_traced": len(path_rc),
                "start_elevation": start_elevation,
                "end_elevation": end_elevation,
            },
        )
