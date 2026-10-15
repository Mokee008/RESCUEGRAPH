"""
Master Results Aggregator & JSON Serializer (Rule R3 Compliance).

HARD RULES & MISTAKE SAFEGUARDS:
Rule R3: Every number in any report comes strictly from results.json.
         Implement strict JSON formatting so number_checker.py can verify
         every single figure down to the decimal.
"""

import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from floodsat.analysis.damage import DamageSummary
from floodsat.analysis.cutoff import CutoffAnalysisResult


def generate_results_json(
    aoi_name: str,
    bbox: Tuple[float, float, float, float],
    event_date: str,
    damage_summary: DamageSummary,
    cutoff_result: CutoffAnalysisResult,
    flood_extent_sq_km: float,
    debris_extent_sq_km: float,
    mean_confidence: float,
    false_positives_cleaned: int,
    output_path: Optional[str] = "results/results.json",
) -> Dict[str, Any]:
    """
    Serializes complete operational findings into a deterministic results.json file.
    """
    settlement_list = []
    for s in cutoff_result.isolated_settlements:
        settlement_list.append({
            "name": s.name,
            "settlement_id": s.settlement_id,
            "status": s.status,
            "building_count": int(s.building_count),
            "breaking_point_segment": s.breaking_point_segment,
            "original_hospital": s.original_hospital_name,
            "detour_km": float(s.detour_length_km) if s.detour_length_km != float("inf") else -1.0,
            "alternative_hospital": s.alternative_hospital or "NONE",
            "lon": float(s.coordinates[0]),
            "lat": float(s.coordinates[1]),
        })

    results = {
        "metadata": {
            "platform": "FloodSat Disaster Intelligence",
            "aoi_name": aoi_name,
            "bbox": [float(x) for x in bbox],
            "event_date": event_date,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "attribution": "Contains modified Copernicus Sentinel data 2026. (c) OpenStreetMap contributors.",
        },
        "flood_and_debris": {
            "flood_extent_sq_km": round(float(flood_extent_sq_km), 2),
            "debris_extent_sq_km": round(float(debris_extent_sq_km), 2),
            "mean_confidence": round(float(mean_confidence), 3),
            "false_positives_cleaned": int(false_positives_cleaned),
        },
        "damage_assessment": {
            "confirmed_buildings": int(damage_summary.confirmed_buildings),
            "likely_buildings": int(damage_summary.likely_buildings),
            "uncertain_buildings": int(damage_summary.uncertain_buildings),
            "total_buildings_affected": int(damage_summary.total_buildings_affected),
            "confirmed_roads_km": round(float(damage_summary.confirmed_roads_km), 2),
            "likely_roads_km": round(float(damage_summary.likely_roads_km), 2),
            "uncertain_roads_km": round(float(damage_summary.uncertain_roads_km), 2),
            "total_roads_km_affected": round(float(damage_summary.total_roads_km_affected), 2),
            "damaged_bridges_count": int(damage_summary.damaged_bridges_count),
        },
        "cutoff_settlements": {
            "total_cut_off_settlements": int(cutoff_result.total_cut_off_count),
            "total_possibly_cut_off_settlements": int(cutoff_result.total_possibly_cut_off_count),
            "total_isolated_population": int(cutoff_result.total_isolated_population_estimate),
            "sparse_osm_warning": cutoff_result.sparse_osm_warning,
            "settlements": settlement_list,
        },
    }

    if output_path:
        out_p = Path(output_path).resolve()
        out_p.parent.mkdir(parents=True, exist_ok=True)
        with open(out_p, "w") as f:
            json.dump(results, f, indent=2)

    return results
