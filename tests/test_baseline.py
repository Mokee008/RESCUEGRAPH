"""
Unit tests for the Log-Ratio Threshold Baseline and Terrain Cleaning Engine.
"""

import numpy as np
import pytest

from floodsat.preprocess.align import MultimodalRasterStack
from floodsat.models.baseline import LogRatioThresholdBaseline


def test_baseline_predicts_flood_in_valley_and_purges_shadow():
    """
    Verify baseline identifies backscatter drop in the valley as flood,
    while removing mountain backscatter drops on steep terrain.
    """
    h, w = 40, 40

    # DEM: V-shaped valley in rows 10:25, steep mountains elsewhere
    dem = np.ones((h, w), dtype=np.float32) * 1200.0
    dem[10:25, :] = 450.0  # Valley floor

    # Pre-event SAR: normal land backscatter ~ -10 dB
    pre_vv = np.ones((h, w), dtype=np.float32) * -10.0
    pre_vh = np.ones((h, w), dtype=np.float32) * -18.0

    # Post-event SAR:
    # 1. Valley inundated: backscatter drops to -19 dB (diff = -9 dB)
    # 2. Mountain slope in shadow: backscatter also drops to -20 dB (diff = -10 dB)
    post_vv = np.ones((h, w), dtype=np.float32) * -10.0
    post_vv[12:22, 10:30] = -19.0  # Valley flood (10x20 = 200 pixels)
    post_vv[0:8, 0:8] = -20.0      # Mountain shadow (8x8 = 64 pixels)

    post_vh = post_vv - 7.0
    diff_vv = post_vv - pre_vv

    stack = MultimodalRasterStack(
        post_vv=post_vv,
        post_vh=post_vh,
        pre_vv=pre_vv,
        pre_vh=pre_vh,
        log_ratio_vv=diff_vv,
        dem=dem,
    )

    baseline = LogRatioThresholdBaseline(
        water_backscatter_thresh_db=-14.0,
        flood_diff_thresh_db=-3.5,
        max_slope_deg=15.0,
        max_hand_meters=35.0,
    )

    res = baseline.predict(stack)

    # Assertions
    assert res.flood_mask.shape == (h, w)
    assert res.confidence_map.shape == (h, w)

    # Valley flood should be detected
    valley_flooded = res.flood_mask[12:22, 10:30] == 1
    assert np.sum(valley_flooded) > 100

    # Mountain shadow should be completely cleaned (0 flood pixels in mountain block)
    mountain_shadow = res.flood_mask[0:8, 0:8] == 1
    assert np.sum(mountain_shadow) == 0

    # Tracking metrics must be positive
    assert res.false_positives_removed >= 64
    assert res.metadata["flood_pixel_count"] > 0
    assert np.all(res.confidence_map >= 0.0)
    assert np.all(res.confidence_map <= 1.0)
