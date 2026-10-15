"""
Sentinel-1 Same-Orbit Pairing Module (Rule M2 Compliance).

HARD RULES & MISTAKE SAFEGUARDS:
Rule M2: Pair S1 scenes ONLY with the SAME relative orbit AND SAME pass direction
         (Ascending vs Descending), ideally 12 days apart.
         If none exists, fall back with an explicit structured warning in the
         results and report. NEVER mix orbits silently.
"""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Union


@dataclass
class OrbitPair:
    pre_scene: Dict[str, Any]
    post_scene: Dict[str, Any]
    relative_orbit: Optional[int]
    orbit_direction: str
    revisit_delta_days: float
    is_exact_match: bool
    warning: Optional[str] = None


class OrbitPairingEngine:
    """
    Selects optimal pre-event and post-event Sentinel-1 SAR acquisition pairs.
    Enforces strict relative orbit matching to avoid false mountain distortion.
    """

    def __init__(self, ideal_delta_days: int = 12, max_delta_days: int = 36):
        self.ideal_delta_days = ideal_delta_days
        self.max_delta_days = max_delta_days

    def _parse_timestamp(self, scene: Dict[str, Any]) -> datetime:
        content_date = scene.get("ContentDate", {})
        start_str = content_date.get("Start") or scene.get("date") or "2026-01-01T00:00:00Z"
        dt = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt

    def _extract_orbit_meta(self, scene: Dict[str, Any]) -> Tuple[Optional[int], str]:
        # Support OData attributes or flat dict metadata
        rel_orbit = scene.get("relativeOrbitNumber")
        orbit_dir = scene.get("orbitDirection", "DESCENDING").upper()

        attrs = scene.get("Attributes", [])
        if isinstance(attrs, list):
            for att in attrs:
                name = att.get("Name")
                if name == "relativeOrbitNumber":
                    rel_orbit = int(att.get("OData.CSC.IntegerAttribute", {}).get("Value", rel_orbit or 0))
                elif name == "orbitDirection":
                    orbit_dir = att.get("OData.CSC.StringAttribute", {}).get("Value", orbit_dir).upper()

        return rel_orbit, orbit_dir

    def find_best_pair(
        self,
        candidate_scenes: List[Dict[str, Any]],
        event_date: Optional[Union[str, datetime]] = None,
    ) -> OrbitPair:
        """
        Finds the highest quality pre/post Sentinel-1 scene pair.
        """
        if isinstance(event_date, str):
            ev_dt = datetime.fromisoformat(event_date.replace("Z", "+00:00"))
        elif isinstance(event_date, datetime):
            ev_dt = event_date
        else:
            ev_dt = datetime(2026, 8, 2, 0, 0, 0, tzinfo=timezone.utc)

        if ev_dt.tzinfo is None:
            ev_dt = ev_dt.replace(tzinfo=timezone.utc)

        pre_candidates = []
        post_candidates = []

        for sc in candidate_scenes:
            sc_dt = self._parse_timestamp(sc)
            rel_orbit, orbit_dir = self._extract_orbit_meta(sc)
            sc_meta = {
                "raw": sc,
                "dt": sc_dt,
                "relative_orbit": rel_orbit,
                "orbit_direction": orbit_dir,
            }
            if sc_dt < ev_dt:
                pre_candidates.append(sc_meta)
            else:
                post_candidates.append(sc_meta)

        if not post_candidates or not pre_candidates:
            raise ValueError(
                f"Cannot find SAR pair: Found {len(pre_candidates)} pre-event and "
                f"{len(post_candidates)} post-event scenes around event {ev_dt.isoformat()}."
            )

        # Sort post candidates chronologically closest to event
        post_candidates.sort(key=lambda s: abs((s["dt"] - ev_dt).total_seconds()))
        best_post = post_candidates[0]

        # First priority: Same relative orbit AND same pass direction
        matching_pre = [
            s for s in pre_candidates
            if s["relative_orbit"] == best_post["relative_orbit"]
            and s["orbit_direction"] == best_post["orbit_direction"]
            and best_post["relative_orbit"] is not None
        ]

        if matching_pre:
            # Pick one closest to 12 days before the post scene
            matching_pre.sort(
                key=lambda s: abs((best_post["dt"] - s["dt"]).total_seconds() - (self.ideal_delta_days * 86400))
            )
            best_pre = matching_pre[0]
            delta_days = (best_post["dt"] - best_pre["dt"]).total_seconds() / 86400.0
            return OrbitPair(
                pre_scene=best_pre["raw"],
                post_scene=best_post["raw"],
                relative_orbit=best_post["relative_orbit"],
                orbit_direction=best_post["orbit_direction"],
                revisit_delta_days=round(delta_days, 2),
                is_exact_match=True,
                warning=None,
            )

        # Fallback priority: Same direction but different orbit (explicit warning)
        same_dir_pre = [
            s for s in pre_candidates if s["orbit_direction"] == best_post["orbit_direction"]
        ]
        if same_dir_pre:
            same_dir_pre.sort(key=lambda s: abs((best_post["dt"] - s["dt"]).total_seconds()))
            best_pre = same_dir_pre[0]
            delta_days = (best_post["dt"] - best_pre["dt"]).total_seconds() / 86400.0
            return OrbitPair(
                pre_scene=best_pre["raw"],
                post_scene=best_post["raw"],
                relative_orbit=best_post["relative_orbit"],
                orbit_direction=best_post["orbit_direction"],
                revisit_delta_days=round(delta_days, 2),
                is_exact_match=False,
                warning=(
                    f"ORBIT MISMATCH WARNING (Rule M2): No identical relative orbit found. "
                    f"Paired pre-event orbit {best_pre['relative_orbit']} with post-event orbit {best_post['relative_orbit']} "
                    f"({best_post['orbit_direction']}). Slope correction will be applied to mitigate terrain look-angle bias."
                ),
            )

        # Last resort fallback: closest pre scene
        pre_candidates.sort(key=lambda s: abs((best_post["dt"] - s["dt"]).total_seconds()))
        best_pre = pre_candidates[0]
        delta_days = (best_post["dt"] - best_pre["dt"]).total_seconds() / 86400.0
        return OrbitPair(
            pre_scene=best_pre["raw"],
            post_scene=best_post["raw"],
            relative_orbit=best_post["relative_orbit"],
            orbit_direction=best_post["orbit_direction"],
            revisit_delta_days=round(delta_days, 2),
            is_exact_match=False,
            warning=(
                f"CRITICAL ORBIT MISMATCH WARNING (Rule M2): Mixing opposing pass directions "
                f"({best_pre['orbit_direction']} vs {best_post['orbit_direction']}). "
                f"Strong radar shadow artifacts expected."
            ),
        )
