"""
Event-Level Dataset Partitioning (Rule M1 Compliance).

HARD RULES & MISTAKE SAFEGUARDS:
Rule M1: Tile leakage: split by WHOLE EVENT, never random tiles.
         Add an automated test that fails if any event ID appears in more than one split.
"""

from typing import Dict, List, Set, Tuple
import numpy as np


class EventSplitLeakageError(Exception):
    """Raised when an event ID appears in multiple dataset splits."""
    pass


def split_by_event(
    event_ids: List[str],
    val_ratio: float = 0.2,
    test_ratio: float = 0.1,
    seed: int = 42,
) -> Tuple[Set[str], Set[str], Set[str]]:
    """
    Splits unique event identifiers into disjoint train, val, and test sets.
    Ensures zero tile or event overlap across splits.
    """
    unique_events = sorted(list(set(event_ids)))
    rng = np.random.RandomState(seed)
    shuffled = rng.permutation(unique_events)

    n_total = len(shuffled)
    n_test = int(round(n_total * test_ratio))
    n_val = int(round(n_total * val_ratio))

    test_events = set(shuffled[:n_test])
    val_events = set(shuffled[n_test : n_test + n_val])
    train_events = set(shuffled[n_test + n_val :])

    # If small event count, ensure at least 1 in val and train
    if len(val_events) == 0 and len(train_events) > 1:
        moved = train_events.pop()
        val_events.add(moved)

    # Verify Disjointness (Rule M1)
    verify_no_leakage(train_events, val_events, test_events)

    return train_events, val_events, test_events


def verify_no_leakage(
    train_events: Set[str],
    val_events: Set[str],
    test_events: Set[str],
) -> None:
    """
    Enforces Rule M1 by asserting zero intersection between event sets.
    """
    train_val_overlap = train_events.intersection(val_events)
    train_test_overlap = train_events.intersection(test_events)
    val_test_overlap = val_events.intersection(test_events)

    if train_val_overlap or train_test_overlap or val_test_overlap:
        raise EventSplitLeakageError(
            f"VIOLATION (Rule M1: Tile Leakage): Event overlap detected across splits! "
            f"Train/Val overlap: {train_val_overlap}, "
            f"Train/Test overlap: {train_test_overlap}, "
            f"Val/Test overlap: {val_test_overlap}"
        )
