"""
Unit tests for Infrastructure Damage Assessment and Settlement Cut-Off Graph Analysis (Rule D & Rule R3).
"""

import json
from pathlib import Path
import numpy as np
import pytest

from floodsat.analysis.damage import DamageAssessor
from floodsat.analysis.cutoff import SettlementCutoffEngine
from floodsat.analysis.results_aggregator import generate_results_json


def test_damage_assessment_categorization():
    """Verify buildings and roads are accurately categorized into confirmed/likely/uncertain."""
    h, w = 50, 50
    bbox = (85.1, 27.9, 85.3, 28.1)

    # 1. Flood and debris mock rasters
    flood_mask = np.zeros((h, w), dtype=np.uint8)
    flood_prob = np.zeros((h, w), dtype=np.float32)
    debris_mask = np.zeros((h, w), dtype=np.uint8)

    # Place a confirmed flood zone in center
    flood_mask[20:30, 20:30] = 1
    flood_prob[20:30, 20:30] = 0.90  # Confirmed

    # Place a debris zone
    debris_mask[35:40, 35:40] = 1

    # 2. Mock OSM infrastructure
    osm_infrastructure = {
        "buildings": {
            "features": [
                # Building inside confirmed flood zone
                {"type": "Feature", "geometry": {"type": "Point", "coordinates": [85.2, 28.0]}},
                # Building in safe area
                {"type": "Feature", "geometry": {"type": "Point", "coordinates": [85.12, 27.92]}},
            ]
        },
        "roads": {
            "features": [
                # Road crossing flood zone
                {
                    "type": "Feature",
                    "id": "way_primary_1",
                    "properties": {"name": "Trishuli Highway"},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[85.18, 28.0], [85.20, 28.0], [85.22, 28.0]],
                    },
                }
            ]
        },
        "bridges": {
            "features": [
                {"type": "Feature", "geometry": {"type": "Point", "coordinates": [85.20, 28.0]}}
            ]
        },
    }

    assessor = DamageAssessor()
    summary = assessor.assess_damage(
        flood_mask=flood_mask,
        flood_prob=flood_prob,
        debris_mask=debris_mask,
        osm_infrastructure=osm_infrastructure,
        bbox=bbox,
    )

    assert summary.confirmed_buildings == 1
    assert summary.total_buildings_affected == 1
    assert summary.damaged_bridges_count == 1
    assert len(summary.hit_road_segments) == 1
    assert summary.hit_road_segments[0]["status"] == "CONFIRMED"


def test_settlement_cutoff_graph_and_breaking_point():
    """Verify cut-off settlement detection, breaking-point segment, and detour routing."""
    # Build a simple topology:
    # Settlement A (85.15, 28.00) ---> [Bridge B (85.20, 28.00)] ---> Hospital H (85.25, 28.00)
    osm_infrastructure = {
        "settlements": [
            {
                "type": "Feature",
                "properties": {"name": "Mailung Village", "building_count": 50},
                "geometry": {"type": "Point", "coordinates": [85.15, 28.00]},
            }
        ],
        "roads": {
            "features": [
                {
                    "type": "Feature",
                    "id": "seg_valley_bridge",
                    "properties": {"name": "Mailung Suspension Bridge"},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[85.15, 28.00], [85.20, 28.00], [85.25, 28.00]],
                    },
                }
            ]
        },
        "hospitals": {
            "features": [
                {
                    "type": "Feature",
                    "properties": {"name": "Trishuli District Hospital"},
                    "geometry": {"type": "Point", "coordinates": [85.25, 28.00]},
                }
            ]
        },
    }

    # Simulate that the bridge is severed
    hit_segments = [
        {
            "segment_id": "seg_valley_bridge",
            "name": "Mailung Suspension Bridge",
            "status": "CONFIRMED",
            "length_km": 11.1,
        }
    ]

    engine = SettlementCutoffEngine(avg_people_per_building=5)
    result = engine.analyze_connectivity(osm_infrastructure, hit_segments)

    assert result.total_cut_off_count == 1
    assert len(result.isolated_settlements) == 1
    cutoff_village = result.isolated_settlements[0]
    assert cutoff_village.name == "Mailung Village"
    assert cutoff_village.status == "CUT_OFF"
    assert cutoff_village.building_count == 50
    assert cutoff_village.breaking_point_segment == "Mailung Suspension Bridge"
    assert result.total_isolated_population_estimate == 250


def test_results_json_generation_rule_r3(tmp_path):
    """Verify results.json matches deterministic structure required for report verification."""
    from floodsat.analysis.damage import DamageSummary
    from floodsat.analysis.cutoff import CutoffAnalysisResult, CutoffSettlement

    dummy_damage = DamageSummary(
        confirmed_buildings=14,
        likely_buildings=6,
        uncertain_buildings=2,
        total_buildings_affected=22,
        confirmed_roads_km=5.4,
        likely_roads_km=2.1,
        uncertain_roads_km=0.8,
        total_roads_km_affected=8.3,
        damaged_bridges_count=2,
        hit_road_segments=[],
        details={},
    )

    dummy_cutoff = CutoffAnalysisResult(
        isolated_settlements=[
            CutoffSettlement(
                name="Syabrubesi",
                settlement_id="village_101",
                status="CUT_OFF",
                building_count=72,
                breaking_point_segment="Trishuli Canyon Bridge",
                original_hospital_name="Dhunche Hospital",
                detour_length_km=24.5,
                alternative_hospital="Bidur Hospital",
                coordinates=(85.33, 28.16),
            )
        ],
        total_cut_off_count=1,
        total_possibly_cut_off_count=0,
        total_isolated_population_estimate=360,
        sparse_osm_warning=None,
        metadata={},
    )

    json_path = tmp_path / "results.json"
    results = generate_results_json(
        aoi_name="Trishuli Basin, Nepal",
        bbox=(85.1, 27.9, 85.4, 28.2),
        event_date="2026-08-02T00:00:00Z",
        damage_summary=dummy_damage,
        cutoff_result=dummy_cutoff,
        flood_extent_sq_km=18.45,
        debris_extent_sq_km=6.20,
        mean_confidence=0.892,
        false_positives_cleaned=142,
        output_path=str(json_path),
    )

    assert json_path.exists()
    assert results["damage_assessment"]["confirmed_buildings"] == 14
    assert results["damage_assessment"]["total_roads_km_affected"] == 8.3
    assert results["cutoff_settlements"]["total_isolated_population"] == 360
