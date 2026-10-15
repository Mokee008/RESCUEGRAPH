"""
Unit tests for Sentinel-1 preprocessing, orbit pairing (Rule M2), calibration,
speckle filtering, and tensor stacking.
"""

from datetime import datetime, timezone
import numpy as np
import pytest

from floodsat.preprocess.orbit_pairing import OrbitPairingEngine
from floodsat.preprocess.calibrate import calibrate_to_sigma0_db, lee_filter, compute_sar_log_ratio
from floodsat.preprocess.align import MultimodalRasterStack


def test_orbit_pairing_exact_match():
    """Verify pairing engine selects matching relative orbit and pass direction."""
    engine = OrbitPairingEngine(ideal_delta_days=12)
    event_dt = "2026-08-02T00:00:00Z"

    candidates = [
        # Pre-event candidates
        {
            "Id": "pre_orbit_121",
            "ContentDate": {"Start": "2026-07-21T06:00:00Z"},
            "relativeOrbitNumber": 121,
            "orbitDirection": "DESCENDING",
        },
        {
            "Id": "pre_orbit_48",
            "ContentDate": {"Start": "2026-07-26T06:00:00Z"},
            "relativeOrbitNumber": 48,
            "orbitDirection": "DESCENDING",
        },
        # Post-event candidate
        {
            "Id": "post_orbit_121",
            "ContentDate": {"Start": "2026-08-02T06:00:00Z"},
            "relativeOrbitNumber": 121,
            "orbitDirection": "DESCENDING",
        },
    ]

    pair = engine.find_best_pair(candidates, event_date=event_dt)
    assert pair.is_exact_match is True
    assert pair.relative_orbit == 121
    assert pair.pre_scene["Id"] == "pre_orbit_121"
    assert pair.post_scene["Id"] == "post_orbit_121"
    assert pair.warning is None


def test_orbit_pairing_fallback_warning_rule_m2():
    """Verify that when matching relative orbit is missing, fallback issues Rule M2 warning."""
    engine = OrbitPairingEngine()
    event_dt = "2026-08-02T00:00:00Z"

    candidates = [
        {
            "Id": "pre_orbit_99",
            "ContentDate": {"Start": "2026-07-28T06:00:00Z"},
            "relativeOrbitNumber": 99,
            "orbitDirection": "DESCENDING",
        },
        {
            "Id": "post_orbit_121",
            "ContentDate": {"Start": "2026-08-03T06:00:00Z"},
            "relativeOrbitNumber": 121,
            "orbitDirection": "DESCENDING",
        },
    ]

    pair = engine.find_best_pair(candidates, event_date=event_dt)
    assert pair.is_exact_match is False
    assert pair.warning is not None
    assert "ORBIT MISMATCH WARNING (Rule M2)" in pair.warning


def test_radiometric_calibration_and_speckle():
    """Verify calibration to decibels and Lee filter noise reduction."""
    raw = np.array([[100.0, 500.0], [50.0, 200.0]], dtype=np.float32)
    db = calibrate_to_sigma0_db(raw, clip_min_db=-35.0, clip_max_db=0.0)

    assert db.shape == raw.shape
    assert np.all(db <= 0.0)
    assert np.all(db >= -35.0)

    # Test Lee filter on noisy image
    np.random.seed(42)
    clean = np.ones((64, 64), dtype=np.float32) * -12.0
    noisy = clean + np.random.normal(0, 3.0, size=(64, 64)).astype(np.float32)
    filtered = lee_filter(noisy, window_size=5)

    assert filtered.shape == (64, 64)
    # Variance of filtered image should be strictly lower than noisy image
    assert np.var(filtered) < np.var(noisy)


def test_multimodal_stack_to_model_tensor():
    """Verify raster stack converts to normalized 6-channel model tensor."""
    h, w = 128, 128
    post_vv = np.ones((h, w), dtype=np.float32) * -15.0
    post_vh = np.ones((h, w), dtype=np.float32) * -22.0
    pre_vv = np.ones((h, w), dtype=np.float32) * -10.0
    pre_vh = np.ones((h, w), dtype=np.float32) * -18.0
    diff_vv = compute_sar_log_ratio(post_vv, pre_vv)  # -5.0 dB
    dem = np.linspace(500, 2500, h * w, dtype=np.float32).reshape((h, w))

    stack = MultimodalRasterStack(
        post_vv=post_vv,
        post_vh=post_vh,
        pre_vv=pre_vv,
        pre_vh=pre_vh,
        log_ratio_vv=diff_vv,
        dem=dem,
    )

    tensor = stack.to_model_tensor(include_terrain=True)
    assert tensor.shape == (6, h, w)
    assert tensor.dtype == np.float32
    assert np.min(tensor) >= -1.0
    assert np.max(tensor) <= 1.0
