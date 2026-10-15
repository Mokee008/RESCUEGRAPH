"""
OpenStreetMap acquisition client via HeiGIT ohsome API (https://api.ohsome.org/v1).

Strict Hard Rules Enforced:
- Rule R1: Permitted inputs ONLY (pre-event OSM snapshot <= 2026-07-27).
- Rule R2: Must verify requested timestamp with verify_osm_timestamp() to block
  post-event data from entering operational models.
"""

import hashlib
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import requests

from floodsat.data_guard import verify_osm_timestamp, DataGuardViolation

OHSOME_BASE_URL = "https://api.ohsome.org/v1"


class OhsomeClient:
    """
    Client for querying historical OpenStreetMap snapshots through the ohsome API
    with strict pre-event timestamp enforcement.
    """

    def __init__(self, cache_dir: Optional[str] = None):
        self.cache_dir = Path(cache_dir or "data/cache/ohsome").resolve()
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_cache_path(self, prefix: str, key_dict: Dict[str, Any]) -> Path:
        key_str = json.dumps(key_dict, sort_keys=True)
        hash_digest = hashlib.sha256(key_str.encode("utf-8")).hexdigest()[:16]
        return self.cache_dir / f"{prefix}_{hash_digest}.geojson"

    def query_elements(
        self,
        bbox: Tuple[float, float, float, float],
        filter_expr: str,
        snapshot_time: Union[str, datetime],
        event_date: Union[str, datetime],
        geometry_type: str = "geometry",
    ) -> Dict[str, Any]:
        """
        Queries OSM elements at a historical snapshot timestamp.
        
        Args:
            bbox: (min_lon, min_lat, max_lon, max_lat)
            filter_expr: OSM tag filter (e.g. 'building=*', 'highway=*', 'amenity=hospital')
            snapshot_time: Requested historical snapshot date/time
            event_date: The flood event date (used by data guard to enforce Rule R2)
            geometry_type: 'geometry' (full GeoJSON) or 'centroid'

        Raises:
            DataGuardViolation: If snapshot_time >= event_date or > 2026-07-27.
        """
        # Step 1: Enforce Hard Rules R1 & R2 via data guard
        valid_dt = verify_osm_timestamp(snapshot_time, event_date)
        iso_time = valid_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Step 2: Check local disk cache
        cache_key = {
            "bbox": bbox,
            "filter": filter_expr,
            "time": iso_time,
            "geom": geometry_type,
        }
        cache_file = self._get_cache_path("osm", cache_key)
        if cache_file.exists():
            with open(cache_file, "r") as f:
                return json.load(f)

        # Step 3: Fetch from HeiGIT ohsome API
        # Bbox format for ohsome: min_lon,min_lat,max_lon,max_lat
        bbox_str = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
        endpoint = f"{OHSOME_BASE_URL}/elements/{geometry_type}"

        params = {
            "bboxes": bbox_str,
            "time": iso_time,
            "filter": filter_expr,
            "properties": "tags,metadata",
        }

        try:
            resp = requests.post(endpoint, data=params, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                with open(cache_file, "w") as f:
                    json.dump(data, f, indent=2)
                return data
            elif resp.status_code == 400:
                # E.g. empty result or query error
                return {"type": "FeatureCollection", "features": [], "status": resp.status_code}
            else:
                return {"type": "FeatureCollection", "features": [], "status": resp.status_code}
        except Exception as e:
            # Return empty FeatureCollection with warning metadata if offline/sandboxed
            return {
                "type": "FeatureCollection",
                "features": [],
                "warning": f"Network unreachable or ohsome error: {str(e)}",
            }

    def get_infrastructure(
        self,
        bbox: Tuple[float, float, float, float],
        snapshot_time: Union[str, datetime],
        event_date: Union[str, datetime],
    ) -> Dict[str, Dict[str, Any]]:
        """
        Convenience method to retrieve buildings, highways, bridges, hospitals,
        and places using standard disaster-response OSM filters.
        """
        return {
            "buildings": self.query_elements(
                bbox, "building=* and building!=no", snapshot_time, event_date
            ),
            "roads": self.query_elements(
                bbox, "highway=* and highway not in (footway,path,cycleway,track)", snapshot_time, event_date
            ),
            "bridges": self.query_elements(
                bbox, "bridge=yes or man_made=bridge", snapshot_time, event_date
            ),
            "hospitals": self.query_elements(
                bbox, "amenity in (hospital,clinic) or healthcare=hospital", snapshot_time, event_date
            ),
            "settlements": self.query_elements(
                bbox, "place in (city,town,village,hamlet,isolated_dwelling)", snapshot_time, event_date
            ),
        }
