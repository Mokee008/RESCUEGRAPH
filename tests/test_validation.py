"""
Unit tests for Phase 12: EMSR927 air-gapped validator and Himalayan test runner.
"""

from pathlib import Path
import numpy as np
import pytest

from scripts.compare_emsr927 import EMSR927Validator
from scripts.run_himalaya_tests import evaluate_himalayan_events, HIMALAYAN_TEST_SCENES


def test_emsr927_validator_metrics():
    """Verify EMSR927 validation metrics calculation."""
    validator = EMSR927Validator(evaluation_dir="evaluation")

    shape = (50, 50)
    ref_mask = np.zeros(shape, dtype=np.uint8)
    ref_mask[10:30, 20:30] = 1  # 200 pixels true water

    pred_mask = np.zeros(shape, dtype=np.uint8)
    pred_mask[10:30, 20:30] = 1  # Exact match (100% IoU)

    res = validator.benchmark_prediction(pred_mask, ref_mask)

    assert res["metrics"]["iou"] == 1.0
    assert res["metrics"]["precision"] == 1.0
    assert res["metrics"]["recall"] == 1.0
    assert "European Union, Copernicus Emergency Management Service data" in res["attribution"]


def test_himalayan_test_scenes_evaluation():
    """Verify Himalayan test suite runs and documents failure modes for each event."""
    results = evaluate_himalayan_events()

    assert len(results) == len(HIMALAYAN_TEST_SCENES)
    event_names = [r["event_name"] for r in results]
    assert "Chamoli Flash Flood" in event_names
    assert "Melamchi Disaster" in event_names
    assert "South Lhonak GLOF" in event_names

    for r in results:
        assert r["benchmark_iou"] > 0.65
        assert r["radar_shadow_fp_cleaned"] > 1000
        assert len(r["documented_failure_mode"]) > 10
