"""
Sliding-Window Tiled Inference with Gaussian Window Blending.

Allows inference over arbitrarily large judge-selected bounding boxes
without exceeding GPU/RAM memory limits, eliminating seam boundary artifacts.
"""

from typing import Callable, Optional, Tuple
import numpy as np
import torch


def create_2d_gaussian_window(patch_size: int, sigma: float = 0.25) -> np.ndarray:
    """Creates a 2D Gaussian weight window to smoothly blend overlapping tile borders."""
    x = np.linspace(-1, 1, patch_size)
    y = np.linspace(-1, 1, patch_size)
    xx, yy = np.meshgrid(x, y)
    d = np.sqrt(xx ** 2 + yy ** 2)
    window = np.exp(-(d ** 2) / (2.0 * sigma ** 2))
    return np.maximum(window, 1e-4).astype(np.float32)


def predict_sliding_window(
    model_fn: Callable[[torch.Tensor], torch.Tensor],
    input_tensor: np.ndarray,
    patch_size: int = 256,
    stride: int = 192,
    num_classes: int = 3,
    device: Optional[torch.device] = None,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Executes sliding window inference over a large raster tensor (C, H, W).

    Returns:
        prob_map: (num_classes, H, W) normalized class probabilities.
        uncertainty_map: (H, W) predictive entropy / uncertainty [0, 1].
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    c, h, w = input_tensor.shape
    accum_probs = np.zeros((num_classes, h, w), dtype=np.float32)
    accum_weights = np.zeros((h, w), dtype=np.float32)
    window = create_2d_gaussian_window(patch_size)

    y_steps = list(range(0, max(1, h - patch_size + 1), stride))
    if y_steps[-1] + patch_size < h:
        y_steps.append(h - patch_size)

    x_steps = list(range(0, max(1, w - patch_size + 1), stride))
    if x_steps[-1] + patch_size < w:
        x_steps.append(w - patch_size)

    # Pad if raster is smaller than patch_size
    pad_h = max(0, patch_size - h)
    pad_w = max(0, patch_size - w)
    if pad_h > 0 or pad_w > 0:
        padded_input = np.pad(input_tensor, ((0, 0), (0, pad_h), (0, pad_w)), mode="reflect")
        patch_t = torch.from_numpy(padded_input[:, :patch_size, :patch_size]).unsqueeze(0).to(device)
        with torch.no_grad():
            logits = model_fn(patch_t)
            probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
        crop_probs = probs[:, :h, :w]
        uncertainty = -np.sum(crop_probs * np.log(crop_probs + 1e-7), axis=0) / np.log(num_classes)
        return crop_probs, np.clip(uncertainty, 0.0, 1.0)

    for y in y_steps:
        for x in x_steps:
            patch = input_tensor[:, y : y + patch_size, x : x + patch_size]
            patch_t = torch.from_numpy(patch).unsqueeze(0).to(device)

            with torch.no_grad():
                logits = model_fn(patch_t)
                probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

            for clz in range(num_classes):
                accum_probs[clz, y : y + patch_size, x : x + patch_size] += probs[clz] * window
            accum_weights[y : y + patch_size, x : x + patch_size] += window

    # Normalize by accumulated overlap weights
    prob_map = accum_probs / np.maximum(accum_weights, 1e-6)

    # Compute predictive entropy as uncertainty measure
    # Entropy = - sum(p * log(p)) / log(K)
    uncertainty_map = -np.sum(prob_map * np.log(prob_map + 1e-7), axis=0) / np.log(num_classes)

    return prob_map, np.clip(uncertainty_map, 0.0, 1.0)
