"""
Unit tests for tiled inference, ensemble uncertainty quantification,
and the end-to-end prediction engine.
"""

import numpy as np
import pytest
import torch

from floodsat.infer.tiling import create_2d_gaussian_window, predict_sliding_window
from floodsat.infer.uncertainty import DeepEnsemblePredictor, apply_test_time_augmentation
from floodsat.infer.predict import FloodInferenceEngine
from floodsat.models.unet import FloodUNetPlusPlus
from floodsat.preprocess.align import MultimodalRasterStack


def test_gaussian_window_creation():
    """Verify Gaussian window is symmetric and maximal at center."""
    win = create_2d_gaussian_window(64, sigma=0.25)
    assert win.shape == (64, 64)
    assert win[32, 32] == pytest.approx(1.0, rel=1e-2)
    assert win[0, 0] < 0.1


def test_predict_sliding_window_stitching():
    """Verify tiled prediction produces full-size seamless probability map."""
    h, w = 120, 140
    dummy_input = np.random.randn(6, h, w).astype(np.float32)

    # Simple mock model that returns uniform logits
    def mock_model(x):
        b, c, ph, pw = x.shape
        return torch.zeros((b, 3, ph, pw))

    probs, uncertainty = predict_sliding_window(
        model_fn=mock_model,
        input_tensor=dummy_input,
        patch_size=64,
        stride=48,
        num_classes=3,
        device=torch.device("cpu"),
    )

    assert probs.shape == (3, h, w)
    assert uncertainty.shape == (h, w)
    # Probabilities must sum to 1.0 across classes
    assert np.allclose(np.sum(probs, axis=0), 1.0, atol=1e-3)


def test_flood_inference_engine_runs_and_prunes_mountain_shadow():
    """Verify full inference pipeline generates masks, debris, and purges mountain shadow."""
    h, w = 60, 60
    dem = np.ones((h, w), dtype=np.float32) * 1500.0
    dem[20:40, :] = 400.0  # Valley canyon

    post_vv = np.ones((h, w), dtype=np.float32) * -12.0
    pre_vv = np.ones((h, w), dtype=np.float32) * -10.0
    post_vv[25:35, 10:50] = -21.0  # Valley flood (diff = -11 dB)
    post_vv[0:10, 0:10] = -22.0    # Mountain shadow (diff = -12 dB)

    diff_vv = post_vv - pre_vv
    stack = MultimodalRasterStack(
        post_vv=post_vv,
        post_vh=post_vv - 6.0,
        pre_vv=pre_vv,
        pre_vh=pre_vv - 6.0,
        log_ratio_vv=diff_vv,
        dem=dem,
    )

    engine = FloodInferenceEngine(
        ensemble_models=None,
        patch_size=32,
        stride=24,
        max_slope_deg=15.0,
        max_hand_meters=35.0,
    )

    result = engine.predict(stack, device=torch.device("cpu"))

    assert result.flood_mask.shape == (h, w)
    assert result.debris_mask.shape == (h, w)
    assert result.uncertainty_map.shape == (h, w)

    # Mountain shadow must be purged
    assert np.sum(result.flood_mask[0:10, 0:10] == 1) == 0
    # Valley flood must be retained
    assert np.sum(result.flood_mask[25:35, 10:50] == 1) > 50
    # Tracked false positives removed
    assert result.false_positives_removed > 0
