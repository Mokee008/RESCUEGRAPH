"""
Unit tests for End-to-End run(bbox, flood_date) and Non-Himalayan Generalization (Rule M4 & M5).
"""

from pathlib import Path
import pytest

from floodsat.run import run


def test_run_trishuli_case_study(tmp_path):
    """Verify run() executes end-to-end on Trishuli case study and produces results.json."""
    bbox = (85.15, 27.95, 85.35, 28.15)
    date = "2026-08-02"
    out_dir = tmp_path / "results_trishuli"

    results = run(
        bbox=bbox,
        flood_date=date,
        aoi_name="Trishuli River Basin, Nepal",
        use_ml_model=True,
        output_dir=str(out_dir),
    )

    assert (out_dir / "results.json").exists()
    assert "flood_and_debris" in results
    assert "damage_assessment" in results
    assert "cutoff_settlements" in results
    assert results["metadata"]["aoi_name"] == "Trishuli River Basin, Nepal"
    assert results["flood_and_debris"]["flood_extent_sq_km"] > 0.0


def test_run_non_himalayan_generalization_rule_m4(tmp_path):
    """
    Test Rule M4: Test on an arbitrary non-Himalayan scene (e.g. Emilia-Romagna plain, Italy).
    Must execute cleanly without crashing on gentle topography.
    """
    # Emilia-Romagna bounding box: flat agricultural plain
    bbox = (11.8, 44.3, 12.1, 44.5)
    date = "2023-05-18"
    out_dir = tmp_path / "results_italy"

    results = run(
        bbox=bbox,
        flood_date=date,
        aoi_name="Emilia-Romagna, Italy",
        use_ml_model=False,  # Baseline fast-mode
        output_dir=str(out_dir),
    )

    assert (out_dir / "results.json").exists()
    assert results["metadata"]["aoi_name"] == "Emilia-Romagna, Italy"
    # Even on flat terrain with zero Himalayan shadow, it must succeed gracefully
    assert results["flood_and_debris"]["mean_confidence"] > 0.0
