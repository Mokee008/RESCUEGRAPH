"""
Classical Log-Ratio Threshold Baseline with Terrain Cleaning (Rule M9 & Baseline Benchmark).

Serves as:
1. The empirical benchmark against which the deep learning model is measured (IoU/F1 comparison).
2. The robust fast-mode / offline fallback engine when GPU or neural weights are unavailable (Rule M9).

Algorithm:
1. Delta_dB = Post_VV_dB - Pre_VV_dB.
2. Candidate water where Post_VV_dB < water_threshold_db AND Delta_dB < diff_threshold_db.
3. Candidate debris/texture change where abs(Delta_dB) > debris_threshold_db.
4. Mandatory terrain cleaning: remove steep slopes (> 15 deg) and high HAND (> 35m).
5. Channel connectivity filtering: remove isolated false-positive specks.
"""

from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple
import numpy as np

from floodsat.preprocess.align import MultimodalRasterStack
from floodsat.terrain.slope import compute_slope_degrees
from floodsat.terrain.hand import approximate_hand
from floodsat.terrain.shadow import clean_water_mask_with_terrain
from floodsat.terrain.connectivity import filter_disconnected_water_patches


@dataclass
class BaselineSegmentationResult:
    flood_mask: np.ndarray             # 0: land, 1: water/flood, 2: debris/change candidate
    confidence_map: np.ndarray         # Per-pixel confidence [0.0, 1.0]
    false_positives_removed: int       # Rule M3 tracked count
    isolated_specks_removed: int
    metadata: Dict[str, Any]


class LogRatioThresholdBaseline:
    """
    Empirical log-ratio thresholding engine combined with rigorous terrain cleaning.
    """

    def __init__(
        self,
        water_backscatter_thresh_db: float = -14.0,
        flood_diff_thresh_db: float = -3.5,
        debris_diff_thresh_db: float = 4.0,
        max_slope_deg: float = 15.0,
        max_hand_meters: float = 35.0,
        min_patch_pixels: int = 10,
    ):
        self.water_backscatter_thresh_db = water_backscatter_thresh_db
        self.flood_diff_thresh_db = flood_diff_thresh_db
        self.debris_diff_thresh_db = debris_diff_thresh_db
        self.max_slope_deg = max_slope_deg
        self.max_hand_meters = max_hand_meters
        self.min_patch_pixels = min_patch_pixels

    def predict(
        self,
        stack: MultimodalRasterStack,
    ) -> BaselineSegmentationResult:
        """
        Runs the baseline segmentation and terrain cleaning pipeline on the raster stack.
        """
        post_vv = stack.post_vv
        diff_vv = stack.log_ratio_vv
        dem = stack.dem

        # Step 1: Compute Topographic slope and HAND
        slope_deg = compute_slope_degrees(dem, pixel_size_meters=30.0)
        hand = approximate_hand(dem)

        # Step 2: Primary threshold detection
        # Water: low absolute post-backscatter AND negative drop in backscatter
        is_dark_water = post_vv <= self.water_backscatter_thresh_db
        has_negative_drop = diff_vv <= self.flood_diff_thresh_db
        raw_flood_candidate = (is_dark_water & has_negative_drop).astype(np.uint8)

        # Debris/change: strong backscatter perturbation along the river corridor
        raw_debris_candidate = (np.abs(diff_vv) >= self.debris_diff_thresh_db).astype(np.uint8)

        # Step 3: Mandatory Terrain Cleaning (Rule M3)
        # Purge mountain radar shadows from both flood and debris candidates
        cleaned_flood, fp_removed_flood = clean_water_mask_with_terrain(
            raw_flood_candidate,
            slope_deg=slope_deg,
            hand=hand,
            max_slope_deg=self.max_slope_deg,
            max_hand_meters=self.max_hand_meters,
        )

        cleaned_debris, fp_removed_debris = clean_water_mask_with_terrain(
            raw_debris_candidate,
            slope_deg=slope_deg,
            hand=hand,
            max_slope_deg=self.max_slope_deg + 5.0,  # Debris can sit slightly higher up slopes
            max_hand_meters=self.max_hand_meters + 15.0,
        )

        # Step 4: River channel connectivity filtering
        river_channel_mask = (hand <= 5.0) | (post_vv <= -16.0)
        final_flood, specks_removed = filter_disconnected_water_patches(
            cleaned_flood,
            drainage_mask=river_channel_mask,
            min_patch_pixels=self.min_patch_pixels,
        )

        # Combine into multi-class mask:
        # 0: Background/Land
        # 1: Flood / Inundation
        # 2: Debris / Riverbed change candidate
        final_mask = np.zeros_like(final_flood, dtype=np.uint8)
        final_mask[cleaned_debris > 0] = 2
        final_mask[final_flood > 0] = 1  # Flood takes precedence over debris

        # Step 5: Confidence estimation based on distance from thresholds
        # Confidence increases as post_vv drops deeper below threshold and drop is stronger
        confidence = np.zeros_like(post_vv, dtype=np.float32)

        flood_mask_bool = (final_mask == 1)
        if np.any(flood_mask_bool):
            # Scale confidence from 0.60 to 0.98 based on darkness and drop strength
            excess_drop = np.clip((self.flood_diff_thresh_db - diff_vv[flood_mask_bool]) / 5.0, 0.0, 1.0)
            excess_dark = np.clip((self.water_backscatter_thresh_db - post_vv[flood_mask_bool]) / 8.0, 0.0, 1.0)
            confidence[flood_mask_bool] = 0.60 + 0.38 * (0.5 * excess_drop + 0.5 * excess_dark)

        debris_mask_bool = (final_mask == 2)
        if np.any(debris_mask_bool):
            # Debris change confidence [0.50, 0.85]
            excess_diff = np.clip((np.abs(diff_vv[debris_mask_bool]) - self.debris_diff_thresh_db) / 6.0, 0.0, 1.0)
            confidence[debris_mask_bool] = 0.50 + 0.35 * excess_diff

        # Background confidence
        land_bool = (final_mask == 0)
        confidence[land_bool] = 0.90

        metadata = {
            "method": "LogRatioThresholdBaseline",
            "water_threshold_db": self.water_backscatter_thresh_db,
            "diff_threshold_db": self.flood_diff_thresh_db,
            "flood_pixel_count": int(np.sum(final_mask == 1)),
            "debris_pixel_count": int(np.sum(final_mask == 2)),
            "total_false_positives_removed": int(fp_removed_flood + fp_removed_debris),
            "specks_removed": int(specks_removed),
            "orbit_warning": stack.orbit_warning,
        }

        return BaselineSegmentationResult(
            flood_mask=final_mask,
            confidence_map=np.clip(confidence, 0.0, 1.0).astype(np.float32),
            false_positives_removed=int(fp_removed_flood + fp_removed_debris),
            isolated_specks_removed=int(specks_removed),
            metadata=metadata,
        )
