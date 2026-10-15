"""
End-to-End Prediction Pipeline with Debris Layer and Terrain Safeguards.

Produces:
1. Flood water mask with per-pixel probability and calibrated confidence.
2. Debris / riverbed change candidate layer (restricted to HAND corridor).
3. Tracked count of false positives removed by terrain cleaning.
4. GeoTIFF and GeoJSON exports.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import torch

from floodsat.infer.tiling import predict_sliding_window
from floodsat.infer.uncertainty import DeepEnsemblePredictor
from floodsat.preprocess.align import MultimodalRasterStack
from floodsat.terrain.slope import compute_slope_degrees
from floodsat.terrain.hand import approximate_hand
from floodsat.terrain.shadow import clean_water_mask_with_terrain
from floodsat.terrain.connectivity import filter_disconnected_water_patches


@dataclass
class ModelInferenceResult:
    flood_mask: np.ndarray           # 0: land, 1: water/flood, 2: debris candidate
    flood_probability: np.ndarray    # [0.0, 1.0]
    uncertainty_map: np.ndarray      # [0.0, 1.0] predictive entropy
    debris_mask: np.ndarray          # 0 or 1
    false_positives_removed: int     # Rule M3 tracked count
    metadata: Dict[str, Any]


class FloodInferenceEngine:
    def __init__(
        self,
        ensemble_models: Optional[List[torch.nn.Module]] = None,
        patch_size: int = 256,
        stride: int = 192,
        temperature: float = 1.15,
        max_slope_deg: float = 15.0,
        max_hand_meters: float = 35.0,
        debris_diff_thresh_db: float = 4.0,
    ):
        self.patch_size = patch_size
        self.stride = stride
        self.max_slope_deg = max_slope_deg
        self.max_hand_meters = max_hand_meters
        self.debris_diff_thresh_db = debris_diff_thresh_db

        if ensemble_models:
            self.predictor = DeepEnsemblePredictor(ensemble_models, temperature=temperature)
        else:
            self.predictor = None

    def predict(
        self,
        stack: MultimodalRasterStack,
        device: Optional[torch.device] = None,
    ) -> ModelInferenceResult:
        if device is None:
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Step 1: Prepare normalized model input tensor (6, H, W)
        input_tensor = stack.to_model_tensor(include_terrain=True)
        h, w = stack.shape

        # Step 2: Sliding-window inference with Gaussian blending
        if self.predictor is not None:
            prob_map, uncertainty_map = predict_sliding_window(
                model_fn=self.predictor,
                input_tensor=input_tensor,
                patch_size=self.patch_size,
                stride=self.stride,
                num_classes=3,
                device=device,
            )
            raw_flood_mask = (prob_map[2] >= 0.50).astype(np.uint8)
            flood_prob = prob_map[2]
        else:
            # Fallback mock/test mode: high probability where log-ratio is negative in valley
            flood_prob = np.clip((-stack.log_ratio_vv) / 10.0, 0.0, 1.0)
            uncertainty_map = 1.0 - flood_prob
            raw_flood_mask = (flood_prob >= 0.5).astype(np.uint8)

        # Step 3: Compute Topographic Slope and HAND
        slope_deg = compute_slope_degrees(stack.dem, pixel_size_meters=30.0)
        hand = approximate_hand(stack.dem)

        # Step 4: Rule M3 Terrain Cleaning
        cleaned_flood, fp_removed = clean_water_mask_with_terrain(
            raw_flood_mask,
            slope_deg=slope_deg,
            hand=hand,
            max_slope_deg=self.max_slope_deg,
            max_hand_meters=self.max_hand_meters,
        )

        # Step 5: Channel connectivity filtering
        river_channel_mask = (hand <= 5.0) | (stack.post_vv <= -16.0)
        final_flood, _ = filter_disconnected_water_patches(
            cleaned_flood,
            drainage_mask=river_channel_mask,
            min_patch_pixels=10,
        )

        # Step 6: Weakly Supervised Debris / Riverbed Change Layer (Rule B)
        # Restricted strictly to river corridor (HAND <= 20m) where backscatter shifted strongly
        in_corridor = hand <= 20.0
        large_sar_change = np.abs(stack.log_ratio_vv) >= self.debris_diff_thresh_db
        debris_candidate = (in_corridor & large_sar_change & (final_flood == 0)).astype(np.uint8)

        # Multi-class output mask: 0=land, 1=flood, 2=debris
        combined_mask = np.zeros((h, w), dtype=np.uint8)
        combined_mask[debris_candidate == 1] = 2
        combined_mask[final_flood == 1] = 1

        metadata = {
            "method": "FloodInferenceEngine_UNetPlusPlus",
            "patch_size": self.patch_size,
            "stride": self.stride,
            "flood_pixels": int(np.sum(final_flood == 1)),
            "debris_pixels": int(np.sum(debris_candidate == 1)),
            "false_positives_removed": int(fp_removed),
            "orbit_warning": stack.orbit_warning,
        }

        return ModelInferenceResult(
            flood_mask=combined_mask,
            flood_probability=flood_prob,
            uncertainty_map=uncertainty_map,
            debris_mask=debris_candidate,
            false_positives_removed=int(fp_removed),
            metadata=metadata,
        )
