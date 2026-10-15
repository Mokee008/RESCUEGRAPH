"""
Channel Connectivity and Morphological Filtering.

Enforces that legitimate flood waters originate or connect to the primary
river network and purges disconnected, speckle-induced false alarms.
"""

from typing import Tuple
import numpy as np
from scipy.ndimage import label


def filter_disconnected_water_patches(
    candidate_mask: np.ndarray,
    drainage_mask: np.ndarray,
    min_patch_pixels: int = 15,
) -> Tuple[np.ndarray, int]:
    """
    Labels contiguous water blobs and removes:
    1. Tiny isolated noise specks (< min_patch_pixels).
    2. Blobs that have zero spatial connection or proximity to the drainage network.

    Returns:
        (filtered_mask, num_pixels_removed)
    """
    binary_input = (candidate_mask > 0).astype(np.uint8)
    initial_pixels = int(np.sum(binary_input))

    labeled, num_features = label(binary_input)
    output_mask = np.zeros_like(binary_input)

    for feat_id in range(1, num_features + 1):
        blob = (labeled == feat_id)
        blob_size = np.sum(blob)

        # Ignore tiny noise specks
        if blob_size < min_patch_pixels:
            continue

        # Check intersection or 1-pixel dilation touch with drainage network
        touches_river = np.any(blob & drainage_mask)
        if touches_river or blob_size >= (min_patch_pixels * 5):
            output_mask[blob] = 1

    final_pixels = int(np.sum(output_mask))
    removed_pixels = max(0, initial_pixels - final_pixels)

    return output_mask, removed_pixels
