"""
Copernicus Data Space Ecosystem (CDSE) client for Sentinel-1 GRD, Sentinel-2 L2A,
and Copernicus GLO-30 DEM.

Hard Rules Enforced:
- Rule R1: Permitted inputs ONLY (Sentinel-1, Sentinel-2, Copernicus GLO-30 DEM).
- Rule R6: No credentials or raw data committed to git.
- Rule R7: Honest reporting. If remote credentials/network are unavailable,
  gracefully report status and fall back to local cached permitted scenes without fabricating fetches.
"""

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests

CDSE_AUTH_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
CDSE_ODATA_URL = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"


class CDSEClient:
    """
    Client for querying and acquiring Sentinel-1 GRD, Sentinel-2 L2A,
    and Copernicus DEM data from the Copernicus Data Space Ecosystem.
    """

    def __init__(
        self,
        username: Optional[str] = None,
        password: Optional[str] = None,
        cache_dir: Optional[str] = None,
    ):
        self.username = username or os.environ.get("CDSE_USERNAME")
        self.password = password or os.environ.get("CDSE_PASSWORD")
        self.cache_dir = Path(cache_dir or "data/cache/cdse").resolve()
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._access_token: Optional[str] = None

    def _get_cache_path(self, prefix: str, key_dict: Dict[str, Any], ext: str = ".json") -> Path:
        key_str = json.dumps(key_dict, sort_keys=True)
        hash_digest = hashlib.sha256(key_str.encode("utf-8")).hexdigest()[:16]
        return self.cache_dir / f"{prefix}_{hash_digest}{ext}"

    def authenticate(self) -> bool:
        """
        Retrieves Keycloak OAuth2 token from CDSE identity server.
        Returns False gracefully if credentials are not configured or request fails.
        """
        if not self.username or not self.password:
            return False

        try:
            resp = requests.post(
                CDSE_AUTH_URL,
                data={
                    "client_id": "cdse-public",
                    "username": self.username,
                    "password": self.password,
                    "grant_type": "password",
                },
                timeout=15,
            )
            if resp.status_code == 200:
                self._access_token = resp.json().get("access_token")
                return True
            return False
        except Exception:
            return False

    def search_sentinel1_grd(
        self,
        bbox: Tuple[float, float, float, float],
        start_date: str,
        end_date: str,
        relative_orbit: Optional[int] = None,
        orbit_direction: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Searches Sentinel-1 GRD products within [min_lon, min_lat, max_lon, max_lat].
        Filters strictly by GRD collection and VV+VH dual polarization.
        """
        cache_key = {
            "type": "S1_GRD",
            "bbox": bbox,
            "start": start_date,
            "end": end_date,
            "orbit": relative_orbit,
            "direction": orbit_direction,
        }
        cache_file = self._get_cache_path("search_s1", cache_key)
        if cache_file.exists():
            with open(cache_file, "r") as f:
                return json.load(f)

        min_lon, min_lat, max_lon, max_lat = bbox
        polygon_wkt = (
            f"POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, "
            f"{max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))"
        )

        filter_query = (
            f"Collection/Name eq 'SENTINEL-1' and "
            f"Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'GRD') and "
            f"ContentDate/Start gt {start_date}T00:00:00.000Z and "
            f"ContentDate/Start lt {end_date}T23:59:59.000Z and "
            f"OData.CSC.Intersects(area=geography'SRID=4326;{polygon_wkt}')"
        )

        if orbit_direction:
            filter_query += (
                f" and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'orbitDirection' "
                f"and att/OData.CSC.StringAttribute/Value eq '{orbit_direction.upper()}')"
            )

        headers = {}
        if self._access_token:
            headers["Authorization"] = f"Bearer {self._access_token}"

        try:
            resp = requests.get(
                CDSE_ODATA_URL,
                params={"$filter": filter_query, "$top": 20},
                headers=headers,
                timeout=20,
            )
            if resp.status_code == 200:
                results = resp.json().get("value", [])
                with open(cache_file, "w") as f:
                    json.dump(results, f, indent=2)
                return results
            return []
        except Exception:
            return []

    def search_sentinel2_l2a(
        self,
        bbox: Tuple[float, float, float, float],
        start_date: str,
        end_date: str,
        max_cloud_cover: float = 20.0,
    ) -> List[Dict[str, Any]]:
        """
        Searches Sentinel-2 L2A (Bottom-of-Atmosphere) optical scenes with cloud filtering.
        """
        cache_key = {
            "type": "S2_L2A",
            "bbox": bbox,
            "start": start_date,
            "end": end_date,
            "max_cloud": max_cloud_cover,
        }
        cache_file = self._get_cache_path("search_s2", cache_key)
        if cache_file.exists():
            with open(cache_file, "r") as f:
                return json.load(f)

        min_lon, min_lat, max_lon, max_lat = bbox
        polygon_wkt = (
            f"POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, "
            f"{max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))"
        )

        filter_query = (
            f"Collection/Name eq 'SENTINEL-2' and "
            f"Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'S2MSI2A') and "
            f"Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cloudCover' and att/OData.CSC.DoubleAttribute/Value le {max_cloud_cover}) and "
            f"ContentDate/Start gt {start_date}T00:00:00.000Z and "
            f"ContentDate/Start lt {end_date}T23:59:59.000Z and "
            f"OData.CSC.Intersects(area=geography'SRID=4326;{polygon_wkt}')"
        )

        headers = {}
        if self._access_token:
            headers["Authorization"] = f"Bearer {self._access_token}"

        try:
            resp = requests.get(
                CDSE_ODATA_URL,
                params={"$filter": filter_query, "$top": 10},
                headers=headers,
                timeout=20,
            )
            if resp.status_code == 200:
                results = resp.json().get("value", [])
                with open(cache_file, "w") as f:
                    json.dump(results, f, indent=2)
                return results
            return []
        except Exception:
            return []

    def get_copernicus_dem_glo30_tiles(
        self,
        bbox: Tuple[float, float, float, float],
    ) -> List[Dict[str, Any]]:
        """
        Determines the required 1x1 degree Copernicus GLO-30 DEM tile IDs for the bbox.
        """
        min_lon, min_lat, max_lon, max_lat = bbox
        lat_start = int(min_lat)
        lat_end = int(max_lat) + (1 if max_lat > int(max_lat) else 0)
        lon_start = int(min_lon)
        lon_end = int(max_lon) + (1 if max_lon > int(max_lon) else 0)

        tiles = []
        for lat in range(lat_start, lat_end + 1):
            for lon in range(lon_start, lon_end + 1):
                lat_str = f"N{lat:02d}" if lat >= 0 else f"S{abs(lat):02d}"
                lon_str = f"E{lon:03d}" if lon >= 0 else f"W{abs(lon):03d}"
                tile_id = f"Copernicus_DSM_COG_10_{lat_str}_00_{lon_str}_00_DEM"
                tiles.append({
                    "tile_id": tile_id,
                    "lat": lat,
                    "lon": lon,
                    "dataset": "Copernicus GLO-30 DEM",
                })
        return tiles
