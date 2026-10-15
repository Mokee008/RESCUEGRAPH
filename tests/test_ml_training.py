"""
Unit tests for ML training, event-level split leakage prevention (Rule M1),
U-Net++ model forward pass, and combined Dice+Focal loss.
"""

import numpy as np
import pytest
import torch

from floodsat.train.splits import split_by_event, verify_no_leakage, EventSplitLeakageError
from floodsat.train.datasets import KuroSiwoFloodDataset
from floodsat.models.losses import CombinedLoss
from floodsat.models.unet import FloodUNetPlusPlus
from floodsat.train.train import compute_multiclass_metrics


def test_event_split_leakage_prevention_rule_m1():
    """
    Test Rule M1: Event IDs must be strictly partitioned across train, val, and test.
    Verify that any intentional overlap raises EventSplitLeakageError.
    """
    events = [f"event_{i}" for i in range(20)]
    train_set, val_set, test_set = split_by_event(events, val_ratio=0.2, test_ratio=0.1, seed=42)

    # Disjointness check
    assert len(train_set.intersection(val_set)) == 0
    assert len(train_set.intersection(test_set)) == 0
    assert len(val_set.intersection(test_set)) == 0
    assert len(train_set) + len(val_set) + len(test_set) == 20

    # Test that verify_no_leakage catches simulated leakage
    leaked_val = val_set.copy()
    leaked_val.add(list(train_set)[0])

    with pytest.raises(EventSplitLeakageError, match="Rule M1: Tile Leakage"):
        verify_no_leakage(train_set, leaked_val, test_set)


def test_kuro_siwo_dataset_event_filtering():
    """Verify dataset only retains samples matching allowed events."""
    dummy_samples = [
        {"event_id": "nepal_2026", "tensor": np.zeros((6, 32, 32), dtype=np.float32), "mask": np.zeros((32, 32), dtype=np.int64)},
        {"event_id": "pakistan_2022", "tensor": np.zeros((6, 32, 32), dtype=np.float32), "mask": np.zeros((32, 32), dtype=np.int64)},
    ]

    ds = KuroSiwoFloodDataset(dummy_samples, allowed_events={"nepal_2026"})
    assert len(ds) == 1
    tensor, mask = ds[0]
    assert tensor.shape == (6, 32, 32)
    assert mask.shape == (32, 32)


def test_unet_plus_plus_forward_pass():
    """Verify U-Net++ forward pass produces expected 3-class logits tensor."""
    model = FloodUNetPlusPlus(in_channels=6, classes=3, encoder_name="resnet18", encoder_weights=None)
    dummy_input = torch.randn(2, 6, 64, 64)
    output = model(dummy_input)

    assert output.shape == (2, 3, 64, 64)


def test_combined_loss_and_metrics():
    """Verify CombinedLoss computation and IoU/F1 calculation."""
    loss_fn = CombinedLoss(dice_weight=0.5, focal_weight=0.5)

    logits = torch.randn(2, 3, 32, 32, requires_grad=True)
    targets = torch.randint(0, 3, (2, 32, 32))

    loss = loss_fn(logits, targets)
    assert loss.item() > 0.0

    # Test metrics calculation
    preds_np = torch.argmax(logits.detach(), dim=1).numpy()
    targets_np = targets.numpy()
    metrics = compute_multiclass_metrics(preds_np, targets_np, num_classes=3)

    assert "macro_iou" in metrics
    assert "flood_iou" in metrics
    assert 0.0 <= metrics["macro_iou"] <= 1.0
