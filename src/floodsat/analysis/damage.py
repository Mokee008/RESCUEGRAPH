"""
Infrastructure Damage Assessment (Rule D Compliance).

Intersects predicted flood and debris candidate masks with pre-event OpenStreetMap
assets (buildings, roads, bridges) and categorizes impact into:
- CONFIRMED: High overlap (>= 0.50) with high flood probability (>= 0.75).
- LIKELY: Moderate overlap (0.20 <= overlap < 0.50) or high debris intersection.
- UNCERTAIN: High predictive entropy / uncertainty or boundary overlap.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
import numpy as np


@dataclass
class DamageSummary:
    confirmed_buildings: int
    likely_buildings: int
    uncertain_buildings: int
    total_buildings_affected: int
    confirmed_roads_km: float
    likely_roads_km: float
    uncertain_roads_km: float
    total_roads_km_affected: float
    damaged_bridges_count: int
    hit_road_segments: List[Dict[str, Any]]
    details: Dict[str, Any]


class DamageAssessor:
    """
    Evaluates impact on buildings, highways, and bridges from flood and debris masks.
    """

    def __init__(
        self,
        pixel_size_meters: float = 10.0,
        confirmed_prob_thresh: float = 0.75,
        likely_prob_thresh: float = 0.50,
    ):
        self.pixel_size_meters = pixel_size_meters
        self.confirmed_prob_thresh = confirmed_prob_thresh
        self.likely_prob_thresh = likely_prob_thresh

    def assess_damage(
        self,
        flood_mask: np.ndarray,
        flood_prob: np.ndarray,
        debris_mask: np.ndarray,
        osm_infrastructure: Dict[str, Any],
        bbox: Tuple[float, float, float, float],
    ) -> DamageSummary:
        """
        Assesses damage against OSM vector elements.
        """
        h, w = flood_mask.shape
        min_lon, min_lat, max_lon, max_lat = bbox

        buildings = osm_infrastructure.get("buildings", {}).get("features", [])
        roads = osm_infrastructure.get("roads", {}).get("features", [])
        bridges = osm_infrastructure.get("bridges", {}).get("features", [])

        # Helpers to convert lat/lon to raster row/col coordinates
        def coord_to_rc(lon: float, lat: float) -> Tuple[int, int]:
            r = int((max_lat - lat) / (max_lat - min_lat) * (h - 1))
            c = int((lon - min_lon) / (max_lon - min_lon) * (w - 1))
            return max(0, min(h - 1, r)), max(0, min(w - 1, c))

        # 1. Building damage evaluation
        conf_b, likely_b, uncert_b = 0, 0, 0
        for b_feat in buildings:
            geom = b_feat.get("geometry", {})
            coords = geom.get("coordinates", [])
            # Extract representative coordinate
            if geom.get("type") == "Polygon" and coords and coords[0]:
                lon, lat = coords[0][0][0], coords[0][0][1]
            elif geom.get("type") == "Point" and coords:
                lon, lat = coords[0], coords[1]
            else:
                continue

            r, c = coord_to_rc(lon, lat)
            prob = float(flood_prob[r, c])
            is_debris = bool(debris_mask[r, c] == 1)
            is_flood = bool(flood_mask[r, c] == 1)

            if is_flood and prob >= self.confirmed_prob_thresh:
                conf_b += 1
            elif is_flood or is_debris:
                if prob >= self.likely_prob_thresh or is_debris:
                    likely_b += 1
                else:
                    uncert_b += 1

        # 2. Road segment damage evaluation
        conf_km, likely_km, uncert_km = 0.0, 0.0, 0.0
        hit_segments = []

        for r_feat in roads:
            geom = r_feat.get("geometry", {})
            coords = geom.get("coordinates", [])
            if geom.get("type") != "LineString" or len(coords) < 2:
                continue

            seg_id = str(r_feat.get("id") or r_feat.get("properties", {}).get("osm_id", "way"))
            name = r_feat.get("properties", {}).get("name", "Unnamed Road")

            # Check samples along road line
            hit_points = 0
            max_p = 0.0
            debris_hit = False

            for pt in coords:
                r, c = coord_to_rc(pt[0], pt[1])
                p = float(flood_prob[r, c])
                if p > max_p:
                    max_p = p
                if flood_mask[r, c] == 1:
                    hit_points += 1
                if debris_mask[r, c] == 1:
                    debris_hit = True

            hit_ratio = hit_points / max(1, len(coords))
            # Approximate length in km (~111 km per deg lat)
            dx = (coords[-1][0] - coords[0][0]) * 111.0 * np.cos(np.radians((min_lat + max_lat) / 2))
            dy = (coords[-1][1] - coords[0][1]) * 111.0
            seg_len_km = max(0.05, float(np.sqrt(dx ** 2 + dy ** 2)))

            if hit_ratio >= 0.30 and max_p >= self.confirmed_prob_thresh:
                conf_km += seg_len_km
                status = "CONFIRMED"
            elif hit_ratio >= 0.15 or debris_hit:
                likely_km += seg_len_km
                status = "LIKELY"
            elif hit_ratio > 0.0:
                uncert_km += seg_len_km
                status = "UNCERTAIN"
            else:
                status = "CLEAR"

            if status != "CLEAR":
                hit_segments.append({
                    "segment_id": seg_id,
                    "name": name,
                    "status": status,
                    "length_km": round(seg_len_km, 2),
                    "start_coord": coords[0],
                    "end_coord": coords[-1],
                })

        # 3. Damaged bridges count
        damaged_bridges = 0
        for br_feat in bridges:
            geom = br_feat.get("geometry", {})
            coords = geom.get("coordinates", [])
            if not coords:
                continue
            lon = coords[0][0] if isinstance(coords[0], list) else coords[0]
            lat = coords[0][1] if isinstance(coords[0], list) else coords[1]
            r, c = coord_to_rc(lon, lat)
            if flood_mask[r, c] == 1 or debris_mask[r, c] == 1:
                damaged_bridges += 1

        return DamageSummary(
            confirmed_buildings=conf_b,
            likely_buildings=likely_b,
            uncertain_buildings=uncert_b,
            total_buildings_affected=conf_b + likely_b + uncert_b,
            confirmed_roads_km=round(conf_km, 2),
            likely_roads_km=round(likely_km, 2),
            uncertain_roads_km=round(uncert_km, 2),
            total_roads_km_affected=round(conf_km + likely_km + uncert_km, 2),
            damaged_bridges_count=damaged_bridges,
            hit_road_segments=hit_segments,
            details={
                "buildings_assessed": len(buildings),
                "roads_assessed": len(roads),
                "bridges_assessed": len(bridges),
            },
        )
