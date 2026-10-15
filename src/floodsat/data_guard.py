"""
Data Guardrail enforcement module for FloodSat (Rule R1 and Rule R2).

HARD RULES:
R1. Permitted inputs ONLY:
    - Sentinel-1 GRD
    - Sentinel-2 L2A
    - Copernicus GLO-30 DEM
    - OSM snapshot before the event (maximum permitted date: 2026-07-27)
    - Kuro Siwo dataset
    - Sen1Floods11 dataset
    - ImageNet-pretrained encoder weights

R2. Copernicus EMS (EMSR927), UNOSAT, and post-event OSM edits are strictly
    CHECKING-ONLY.
    They live in ./evaluation/ and may ONLY be accessed by:
    - src/floodsat/train/eval.py
    - scripts/compare_emsr927.py

Any attempt by operational pipeline code to load data from ./evaluation/
or to request an OSM snapshot with date >= flood event date (or > 2026-07-27)
MUST raise an immediate DataGuardViolation error.
"""

import inspect
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Union

# Maximum globally permitted snapshot date across any event (Rule R1)
MAX_OSM_PERMITTED_SNAPSHOT = datetime(2026, 7, 27, 23, 59, 59, tzinfo=timezone.utc)

# Authorized files allowed to access ./evaluation/ (Rule R2)
AUTHORIZED_EVAL_CALLERS = {
    "eval.py",
    "compare_emsr927.py",
    "test_data_guard.py",  # Permitted for verifying the guard mechanism
}


class DataGuardViolation(Exception):
    """Raised when a data access rule (R1, R2) is violated."""
    pass


def verify_osm_timestamp(requested_date: Union[str, datetime], event_date: Union[str, datetime]) -> datetime:
    """
    Ensures the requested OpenStreetMap snapshot timestamp is strictly BEFORE
    the flood event date and does not exceed the global allowed snapshot (2026-07-27).
    """
    if isinstance(requested_date, str):
        # Support ISO formats with or without timezone
        req_dt = datetime.fromisoformat(requested_date.replace("Z", "+00:00"))
    else:
        req_dt = requested_date

    if req_dt.tzinfo is None:
        req_dt = req_dt.replace(tzinfo=timezone.utc)

    if isinstance(event_date, str):
        ev_dt = datetime.fromisoformat(event_date.replace("Z", "+00:00"))
    else:
        ev_dt = event_date

    if ev_dt.tzinfo is None:
        ev_dt = ev_dt.replace(tzinfo=timezone.utc)

    # Check 1: Must be strictly before the event date
    if req_dt >= ev_dt:
        raise DataGuardViolation(
            f"VIOLATION (Rule R2): OSM snapshot timestamp ({req_dt.isoformat()}) "
            f"is greater than or equal to event date ({ev_dt.isoformat()}). "
            f"Post-event OSM data cannot be used in model predictions."
        )

    # Check 2: Must not exceed 2026-07-27 (Rule R1)
    if req_dt > MAX_OSM_PERMITTED_SNAPSHOT:
        raise DataGuardViolation(
            f"VIOLATION (Rule R1): OSM snapshot timestamp ({req_dt.isoformat()}) "
            f"exceeds the maximum permitted pre-event date ({MAX_OSM_PERMITTED_SNAPSHOT.isoformat()})."
        )

    return req_dt


def guard_evaluation_access(target_path: Union[str, Path], caller_depth: int = 1) -> Path:
    """
    Guards access to the ./evaluation/ directory.
    Only authorized callers (eval.py and compare_emsr927.py) are allowed to access it.
    """
    target = Path(target_path).resolve()
    target_str = str(target)

    # Check if target path falls within an evaluation folder
    if "evaluation" in target.parts:
        # Inspect the call stack to verify the caller
        stack = inspect.stack()
        is_authorized = False

        for frame_info in stack:
            caller_file = Path(frame_info.filename).name
            if caller_file in AUTHORIZED_EVAL_CALLERS:
                is_authorized = True
                break

        if not is_authorized:
            violating_file = Path(stack[caller_depth].filename).name if len(stack) > caller_depth else "unknown"
            raise DataGuardViolation(
                f"VIOLATION (Rule R2): Unauthorized access to evaluation data at '{target_str}' "
                f"from module '{violating_file}'. Evaluation data (e.g. EMSR927) is strictly checking-only "
                f"and can only be accessed by {AUTHORIZED_EVAL_CALLERS}."
            )

    return target


def get_evaluation_data_path(filename: str) -> Path:
    """
    Safely retrieves a path within ./evaluation/ with authorization checks.
    """
    project_root = Path(__file__).resolve().parent.parent.parent
    eval_path = project_root / "evaluation" / filename
    return guard_evaluation_access(eval_path, caller_depth=2)
