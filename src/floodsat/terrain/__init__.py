"""
Terrain analysis module exports.
"""

from floodsat.terrain.slope import compute_slope_degrees
from floodsat.terrain.hand import approximate_hand
from floodsat.terrain.shadow import detect_radar_shadow_layover, clean_water_mask_with_terrain
from floodsat.terrain.connectivity import filter_disconnected_water_patches
from floodsat.terrain.flowpath import FlowPathTracer, FlowPathTraceResult

__all__ = [
    "compute_slope_degrees",
    "approximate_hand",
    "detect_radar_shadow_layover",
    "clean_water_mask_with_terrain",
    "filter_disconnected_water_patches",
    "FlowPathTracer",
    "FlowPathTraceResult",
]
