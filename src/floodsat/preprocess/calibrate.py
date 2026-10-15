"""
Radiometric Calibration & SAR Speckle Filtering for Sentinel-1 GRD.

Includes:
- Radiometric calibration from digital numbers to sigma0 linear and decibels (dB).
- Spatial speckle reduction via Enhanced Lee Filter.
- Pre/Post SAR log-ratio difference calculation.
"""

import numpy as np
from scipy.ndimage import uniform_filter


def calibrate_to_sigma0_db(
    raw_intensity: np.ndarray,
    clip_min_db: float = -35.0,
    clip_max_db: float = 0.0,
    calibration_factor: float = 1.0,
) -> np.ndarray:
    """
    Calibrates raw GRD intensity to sigma0 (backscattering coefficient in decibels).
    sigma0_linear = (DN^2) / calibration_factor
    sigma0_db = 10 * log10(sigma0_linear + 1e-7)
    """
    intensity = np.maximum(raw_intensity.astype(np.float32), 1e-6)
    sigma0_linear = intensity / calibration_factor
    sigma0_db = 10.0 * np.log10(sigma0_linear + 1e-7)
    return np.clip(sigma0_db, clip_min_db, clip_max_db)


def lee_filter(img: np.ndarray, window_size: int = 5, num_looks: int = 4) -> np.ndarray:
    """
    Applies the adaptive Lee filter to reduce multiplicative speckle noise
    while preserving sharp edge boundaries along water bodies and roads.
    """
    if window_size < 3:
        return img

    mean = uniform_filter(img, size=window_size)
    mean_sq = uniform_filter(img ** 2, size=window_size)
    variance = np.maximum(mean_sq - mean ** 2, 0)

    # Theoretical noise variance for multi-look intensity SAR
    noise_var = (mean ** 2) / num_looks

    # Weight factor k
    weights = variance / (variance + noise_var + 1e-7)
    weights = np.clip(weights, 0.0, 1.0)

    filtered = mean + weights * (img - mean)
    return filtered.astype(np.float32)


def compute_sar_log_ratio(
    post_sigma0_db: np.ndarray,
    pre_sigma0_db: np.ndarray,
) -> np.ndarray:
    """
    Computes change in backscatter: Delta_dB = Post_dB - Pre_dB.
    For water inundation, specular reflection causes backscatter drop (negative Delta_dB).
    """
    return (post_sigma0_db - pre_sigma0_db).astype(np.float32)
