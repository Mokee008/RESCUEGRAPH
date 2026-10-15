"""
Uncertainty Quantification, Test-Time Augmentation (TTA), and Ensemble Engine.
"""

from typing import List, Tuple
import numpy as np
import torch


def apply_test_time_augmentation(
    model: torch.nn.Module,
    patch: torch.Tensor,
) -> torch.Tensor:
    """
    Applies 4-fold dihedral TTA (original, horizontal flip, vertical flip, transpose)
    and averages output probability distributions to reduce variance.
    """
    # 1. Original
    p1 = torch.softmax(model(patch), dim=1)

    # 2. Horizontal flip
    p2 = torch.softmax(model(torch.flip(patch, dims=[3])), dim=1)
    p2 = torch.flip(p2, dims=[3])

    # 3. Vertical flip
    p3 = torch.softmax(model(torch.flip(patch, dims=[2])), dim=1)
    p3 = torch.flip(p3, dims=[2])

    # 4. 180-degree rotation
    p4 = torch.softmax(model(torch.rot90(patch, k=2, dims=[2, 3])), dim=1)
    p4 = torch.rot90(p4, k=-2, dims=[2, 3])

    return (p1 + p2 + p3 + p4) / 4.0


class DeepEnsemblePredictor:
    """
    Ensemble of diverse models with temperature scaling for well-calibrated confidence.
    """

    def __init__(self, models: List[torch.nn.Module], temperature: float = 1.15):
        self.models = models
        self.temperature = temperature

    def __call__(self, x: torch.Tensor) -> torch.Tensor:
        scaled_logits = []
        for m in self.models:
            m.eval()
            with torch.no_grad():
                logits = m(x) / self.temperature
                scaled_logits.append(logits)

        # Average logits across ensemble
        avg_logits = torch.stack(scaled_logits, dim=0).mean(dim=0)
        return avg_logits
