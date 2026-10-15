"""
Height Above Nearest Drainage (HAND) Approximation and Drainage Corridor Extraction.

Floods in mountain valleys (such as the Trishuli river canyon) are strictly constrained
to low relative elevations above the drainage channel. Any candidate water detection
sitting 50+ meters vertically above the valley floor is physically radar shadow, not flood.
"""

from typing import Optional
import numpy as np
from scipy.ndimage import distance_transform_edt, minimum_filter


def approximate_hand(
    dem: np.ndarray,
    drainage_mask: Optional[np.ndarray] = None,
    stream_threshold_percentile: float = 5.0,
    window_size: int = 25,
) -> np.ndarray:
    """
    Computes a robust approximation of Height Above Nearest Drainage (HAND).

    Args:
        dem: 2D array of elevation values in meters.
        drainage_mask: Optional boolean mask where True indicates river network.
                       If None, derived from local topographic minima.
        stream_threshold_percentile: Percentile of lowest elevations considered riverbeds.
        window_size: Neighborhood window for local valley floor elevation interpolation.

    Returns:
        2D array of relative elevation above the nearest drainage in meters (HAND).
    """
    dem_float = dem.astype(np.float32)

    # Step 1: Identify drainage channel if not explicitly provided
    if drainage_mask is None:
        min_elev = float(np.min(dem_float))
        global_threshold = np.percentile(dem_float, stream_threshold_percentile)
        drainage_mask = dem_float <= max(min_elev + 10.0, global_threshold)

    # Step 2: For each pixel, find the elevation of the nearest drainage pixel
    # Compute Euclidean distance transform with indices
    _, indices = distance_transform_edt(~drainage_mask, return_indices=True)

    nearest_drainage_elevation = dem_float[indices[0], indices[1]]

    # Step 3: HAND = pixel elevation - nearest drainage elevation
    hand = np.maximum(0.0, dem_float - nearest_drainage_elevation)
    return hand.astype(np.float32)
