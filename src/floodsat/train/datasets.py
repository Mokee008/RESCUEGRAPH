"""
Kuro Siwo & Sen1Floods11 Multimodal Dataset Loader.

Reads Sentinel-1 pre/post SAR pairs, DEM, and flood ground-truth masks.
Enforces event-level splitting (Rule M1).
"""

from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Set, Tuple
import numpy as np
import torch
from torch.utils.data import Dataset


class KuroSiwoFloodDataset(Dataset):
    """
    Dataset loader for Kuro Siwo (NeurIPS 2024) Sentinel-1 flood benchmark.
    Input channels (6):
      0: post_vv (normalized [0, 1])
      1: post_vh (normalized [0, 1])
      2: pre_vv  (normalized [0, 1])
      3: pre_vh  (normalized [0, 1])
      4: log_ratio_vv (normalized [-1, 1])
      5: dem / terrain (normalized [0, 1])
    Labels:
      0: Background / Non-water
      1: Permanent water
      2: Flood water
    """

    def __init__(
        self,
        samples: List[Dict[str, Any]],
        allowed_events: Optional[Set[str]] = None,
        patch_size: int = 256,
        include_terrain: bool = True,
        augment: bool = False,
    ):
        self.patch_size = patch_size
        self.include_terrain = include_terrain
        self.augment = augment

        # Filter by allowed events to prevent leakage (Rule M1)
        if allowed_events is not None:
            self.samples = [s for s in samples if s.get("event_id") in allowed_events]
        else:
            self.samples = samples

    def __len__(self) -> int:
        return len(self.samples)

    def _augment(self, tensor: np.ndarray, mask: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        # Random horizontal and vertical flips
        if np.random.rand() > 0.5:
            tensor = np.flip(tensor, axis=2).copy()
            mask = np.flip(mask, axis=1).copy()
        if np.random.rand() > 0.5:
            tensor = np.flip(tensor, axis=1).copy()
            mask = np.flip(mask, axis=0).copy()

        # Random speckle / gain jitter on SAR channels [0:4]
        if np.random.rand() > 0.5:
            noise = np.random.normal(0, 0.02, size=tensor[:4].shape).astype(np.float32)
            tensor[:4] = np.clip(tensor[:4] + noise, 0.0, 1.0)

        # Random terrain dropout (Rule A: ensure inference works if DEM missing)
        if np.random.rand() > 0.8:
            tensor[5] = 0.0

        return tensor, mask

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        sample = self.samples[idx]

        # In-memory arrays or loaded from file paths
        tensor = sample["tensor"]  # (6, H, W)
        mask = sample["mask"]      # (H, W)

        if not self.include_terrain:
            tensor = tensor[:5].copy()

        if self.augment:
            tensor, mask = self._augment(tensor, mask)

        return torch.from_numpy(tensor).float(), torch.from_numpy(mask).long()
