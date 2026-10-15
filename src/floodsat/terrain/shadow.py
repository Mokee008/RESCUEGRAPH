"""
Radar Shadow, Layover, and Topographic False-Positive Masking (Rule M3 Compliance).

MISTAKE AVOIDANCE (Rule M3):
"Radar shadow flagged as flood: terrain cleaning is mandatory in inference;
report false positives removed."
"""

from typing import Tuple
import numpy as np


def detect_radar_shadow_layover(
    dem: np.ndarray,
    slope_deg: np.ndarray,
    orbit_direction: str = "DESCENDING",
    look_angle_deg: float = 35.0,
    slope_cutoff_deg: float = 20.0,
) -> np.ndarray:
    """
    Simulates geometric radar shadow and layover zones.
    Areas facing directly away from the radar with slope exceeding the incidence angle
    are physically obscured in radar shadow (producing dark false water signals).
    """
    # High steep slopes facing away or exceeding radar incidence angle
    is_steep = slope_deg >= slope_cutoff_deg

    # Directional gradient (approximates back-slope in range direction)
    if orbit_direction.upper() == "DESCENDING":
        # Satellite looks westward (right-looking descending track looks ~280 deg)
        grad_x = np.gradient(dem, axis=1)
        shadow_candidate = (grad_x > 0.3) & is_steep
    else:
        # Ascending track looks eastward
        grad_x = np.gradient(dem, axis=1)
        shadow_candidate = (grad_x < -0.3) & is_steep

    return (is_steep | shadow_candidate).astype(bool)


def clean_water_mask_with_terrain(
    raw_water_mask: np.ndarray,
    slope_deg: np.ndarray,
    hand: np.ndarray,
    max_slope_deg: float = 15.0,
    max_hand_meters: float = 35.0,
) -> Tuple[np.ndarray, int]:
    """
    Removes physically impossible water detections on mountain slopes and high ground.

    Returns:
        (cleaned_mask, num_false_positives_removed)
    """
    is_invalid_slope = slope_deg > max_slope_deg
    is_invalid_hand = hand > max_hand_meters
    invalid_terrain = is_invalid_slope | is_invalid_hand

    initial_positives = int(np.sum(raw_water_mask > 0))
    cleaned_mask = np.where(invalid_terrain, 0, raw_water_mask)
    final_positives = int(np.sum(cleaned_mask > 0))

    false_positives_removed = max(0, initial_positives - final_positives)
    return cleaned_mask, false_positives_removed
