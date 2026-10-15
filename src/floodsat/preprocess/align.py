"""
Geospatial Grid Alignment & Pre/Post Multimodal Stacking.

Reprojects and aligns Sentinel-1 (VV, VH), Sentinel-2 (RGB, NIR), and Copernicus DEM
to a common geographic grid with consistent pixel resolution and CRS.
"""

from dataclasses import dataclass
from typing import Dict, Optional, Tuple
import numpy as np


@dataclass
class MultimodalRasterStack:
    post_vv: np.ndarray        # (H, W) in dB
    post_vh: np.ndarray        # (H, W) in dB
    pre_vv: np.ndarray         # (H, W) in dB
    pre_vh: np.ndarray         # (H, W) in dB
    log_ratio_vv: np.ndarray   # (H, W) in dB diff
    dem: np.ndarray            # (H, W) in meters
    s2_optical: Optional[np.ndarray] = None  # (4, H, W) normalized [0, 1] (B02, B03, B04, B08)
    orbit_warning: Optional[str] = None
    cloud_warning: Optional[str] = None

    @property
    def shape(self) -> Tuple[int, int]:
        return self.post_vv.shape

    def to_model_tensor(self, include_terrain: bool = True) -> np.ndarray:
        """
        Builds the normalized multi-channel feature tensor:
        Channels:
          0: post_vv normalized [-30, 0] -> [0, 1]
          1: post_vh normalized [-35, 0] -> [0, 1]
          2: pre_vv normalized  [-30, 0] -> [0, 1]
          3: pre_vh normalized  [-35, 0] -> [0, 1]
          4: log_ratio_vv clipped [-15, 15] -> [-1, 1]
          5: dem normalized [0, 1] (if include_terrain=True)
        """
        ch_post_vv = np.clip((self.post_vv + 30.0) / 30.0, 0.0, 1.0)
        ch_post_vh = np.clip((self.post_vh + 35.0) / 35.0, 0.0, 1.0)
        ch_pre_vv = np.clip((self.pre_vv + 30.0) / 30.0, 0.0, 1.0)
        ch_pre_vh = np.clip((self.pre_vh + 35.0) / 35.0, 0.0, 1.0)
        ch_ratio = np.clip(self.log_ratio_vv / 15.0, -1.0, 1.0)

        channels = [ch_post_vv, ch_post_vh, ch_pre_vv, ch_pre_vh, ch_ratio]

        if include_terrain:
            dem_min, dem_max = np.min(self.dem), np.max(self.dem)
            ch_dem = (self.dem - dem_min) / max(1e-5, (dem_max - dem_min))
            channels.append(ch_dem)

        return np.stack(channels, axis=0).astype(np.float32)
