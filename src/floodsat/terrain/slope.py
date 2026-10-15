"""
Topographic Slope Calculation from Copernicus GLO-30 DEM.

Calculates slope in degrees using Horn's algorithm with proper pixel resolution scaling.
Water cannot stand on steep mountain slopes; steep dark radar patches are radar shadows.
"""

import numpy as np
from scipy.ndimage import convolve


def compute_slope_degrees(
    dem: np.ndarray,
    pixel_size_meters: float = 30.0,
) -> np.ndarray:
    """
    Computes topographic surface slope in degrees from a DEM raster.

    Args:
        dem: 2D array of elevation values in meters.
        pixel_size_meters: DEM ground sampling distance (30m for GLO-30).

    Returns:
        2D array of slopes in degrees [0, 90].
    """
    dem_float = dem.astype(np.float32)

    # Horn's kernels for dz/dx and dz/dy
    kernel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32) / (8.0 * pixel_size_meters)
    kernel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32) / (8.0 * pixel_size_meters)

    dz_dx = convolve(dem_float, kernel_x, mode="nearest")
    dz_dy = convolve(dem_float, kernel_y, mode="nearest")

    # Slope in radians: atan(sqrt((dz/dx)^2 + (dz/dy)^2))
    slope_rad = np.arctan(np.sqrt(dz_dx ** 2 + dz_dy ** 2))
    slope_deg = np.degrees(slope_rad)

    return np.clip(slope_deg, 0.0, 90.0).astype(np.float32)
