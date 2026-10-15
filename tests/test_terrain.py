"""
Unit tests for topographic slope, HAND calculation, radar shadow detection,
and terrain false-positive cleaning (Rule M3).
"""

import numpy as np
import pytest

from floodsat.terrain.slope import compute_slope_degrees
from floodsat.terrain.hand import approximate_hand
from floodsat.terrain.shadow import detect_radar_shadow_layover, clean_water_mask_with_terrain
from floodsat.terrain.connectivity import filter_disconnected_water_patches


def test_compute_slope_degrees_flat_vs_steep():
    """Verify flat DEM yields ~0 deg slope, while steep ramp yields high slope."""
    # Flat plain
    flat_dem = np.ones((50, 50), dtype=np.float32) * 500.0
    flat_slope = compute_slope_degrees(flat_dem, pixel_size_meters=30.0)
    assert np.allclose(flat_slope, 0.0, atol=1e-3)

    # Steep 45-degree ramp (elevation rises 30m every 30m pixel)
    x = np.arange(50) * 30.0
    ramp_dem = np.tile(x, (50, 1)).astype(np.float32)
    ramp_slope = compute_slope_degrees(ramp_dem, pixel_size_meters=30.0)
    # Interior slope should be approx 45 degrees
    assert np.isclose(np.mean(ramp_slope[5:-5, 5:-5]), 45.0, atol=2.0)


def test_approximate_hand_valley():
    """Verify HAND elevation rises as we move away from valley bottom."""
    h, w = 40, 40
    # V-shaped canyon with river in the center column (w // 2)
    dist_from_river = np.abs(np.arange(w) - (w // 2))
    canyon_dem = np.tile(dist_from_river * 10.0, (h, 1)).astype(np.float32) + 600.0

    river_mask = np.zeros((h, w), dtype=bool)
    river_mask[:, w // 2] = True

    hand = approximate_hand(canyon_dem, drainage_mask=river_mask)
    assert np.all(hand[:, w // 2] == 0.0)
    assert np.all(hand[:, 0] > 100.0)  # Valley ridges have high HAND


def test_terrain_cleaning_removes_mountain_radar_shadow_rule_m3():
    """
    Test Rule M3: Water mask false positives on mountain slopes and ridges
    must be removed, and false positives count must be accurately reported.
    """
    h, w = 30, 30
    slope_deg = np.zeros((h, w), dtype=np.float32)
    hand = np.zeros((h, w), dtype=np.float32)

    # Top half: riverbed (flat, low HAND)
    slope_deg[:15, :] = 2.0
    hand[:15, :] = 5.0

    # Bottom half: steep mountain ridge (high slope, high HAND)
    slope_deg[15:, :] = 35.0
    hand[15:, :] = 120.0

    # Raw water mask containing 10 true flood pixels in valley and 10 shadow false positives on ridge
    raw_mask = np.zeros((h, w), dtype=np.uint8)
    raw_mask[5:15, 10] = 1   # Valley (valid)
    raw_mask[20:30, 10] = 1  # Ridge shadow (invalid)

    cleaned_mask, fp_removed = clean_water_mask_with_terrain(
        raw_mask, slope_deg, hand, max_slope_deg=15.0, max_hand_meters=35.0
    )

    assert fp_removed == 10
    assert np.sum(cleaned_mask[:15, :]) == 10  # Valley water preserved
    assert np.sum(cleaned_mask[15:, :]) == 0   # Mountain false alarm purged


def test_filter_disconnected_water_patches():
    """Verify small isolated specks disconnected from the river are purged."""
    h, w = 40, 40
    river_mask = np.zeros((h, w), dtype=bool)
    river_mask[:, 20] = True

    candidate_mask = np.zeros((h, w), dtype=np.uint8)
    # Patch 1: Connected to river (20 pixels)
    candidate_mask[10:30, 20] = 1

    # Patch 2: Disconnected 3-pixel speck far away on a mountain
    candidate_mask[2:5, 2] = 1

    filtered, removed = filter_disconnected_water_patches(
        candidate_mask, drainage_mask=river_mask, min_patch_pixels=10
    )

    assert removed >= 3
    assert np.sum(filtered[2:5, 2]) == 0
    assert np.sum(filtered[10:30, 20]) == 20
