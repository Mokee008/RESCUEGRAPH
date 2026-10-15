"""
Resumable Training Loop for Kuro Siwo & Sen1Floods11.

Includes:
- Automatic Mixed Precision (AMP)
- Cosine Annealing learning rate schedule
- Resumable checkpointing every epoch
- Evaluation metrics (IoU, F1/Dice, Precision, Recall per class and macro)
- Config and random seed logging
"""

import json
import os
from pathlib import Path
from typing import Dict, Optional, Tuple
import numpy as np
import torch
from torch.cuda.amp import GradScaler, autocast
from torch.utils.data import DataLoader

from floodsat.models.losses import CombinedLoss
from floodsat.models.unet import FloodUNetPlusPlus


def compute_multiclass_metrics(preds: np.ndarray, targets: np.ndarray, num_classes: int = 3) -> Dict[str, float]:
    """
    Computes per-class and macro-averaged IoU, Dice/F1, Precision, and Recall.
    """
    ious = []
    dices = []
    precisions = []
    recalls = []

    for c in range(num_classes):
        p_c = (preds == c)
        t_c = (targets == c)

        tp = np.sum(p_c & t_c)
        fp = np.sum(p_c & ~t_c)
        fn = np.sum(~p_c & t_c)

        denom_iou = tp + fp + fn
        iou = float(tp / denom_iou) if denom_iou > 0 else 1.0
        ious.append(iou)

        denom_dice = 2 * tp + fp + fn
        dice = float((2 * tp) / denom_dice) if denom_dice > 0 else 1.0
        dices.append(dice)

        denom_prec = tp + fp
        prec = float(tp / denom_prec) if denom_prec > 0 else 1.0
        precisions.append(prec)

        denom_rec = tp + fn
        rec = float(tp / denom_rec) if denom_rec > 0 else 1.0
        recalls.append(rec)

    return {
        "macro_iou": float(np.mean(ious)),
        "flood_iou": float(ious[2]) if num_classes > 2 else float(ious[1]),
        "macro_f1": float(np.mean(dices)),
        "flood_f1": float(dices[2]) if num_classes > 2 else float(dices[1]),
        "class_ious": ious,
        "class_dices": dices,
        "class_precisions": precisions,
        "class_recalls": recalls,
    }


def train_epoch(
    model: torch.nn.Module,
    loader: DataLoader,
    optimizer: torch.optim.Optimizer,
    criterion: torch.nn.Module,
    device: torch.device,
    scaler: Optional[GradScaler] = None,
) -> float:
    model.train()
    total_loss = 0.0

    for inputs, targets in loader:
        inputs = inputs.to(device)
        targets = targets.to(device)
        optimizer.zero_grad()

        if scaler and device.type == "cuda":
            with autocast():
                logits = model(inputs)
                loss = criterion(logits, targets)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            logits = model(inputs)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()

        total_loss += float(loss.item())

    return total_loss / max(1, len(loader))


def evaluate_model(
    model: torch.nn.Module,
    loader: DataLoader,
    device: torch.device,
) -> Dict[str, float]:
    model.eval()
    all_preds = []
    all_targets = []

    with torch.no_grad():
        for inputs, targets in loader:
            inputs = inputs.to(device)
            logits = model(inputs)
            preds = torch.argmax(logits, dim=1).cpu().numpy()
            all_preds.append(preds)
            all_targets.append(targets.numpy())

    if not all_preds:
        return {"macro_iou": 0.0, "flood_iou": 0.0, "macro_f1": 0.0}

    flat_preds = np.concatenate(all_preds, axis=0)
    flat_targets = np.concatenate(all_targets, axis=0)
    return compute_multiclass_metrics(flat_preds, flat_targets)
