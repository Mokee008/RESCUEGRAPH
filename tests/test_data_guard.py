"""
Unit tests for data_guard.py enforcing Rules R1 and R2.
"""

from datetime import datetime, timezone
import pytest
from pathlib import Path

from floodsat.data_guard import (
    verify_osm_timestamp,
    guard_evaluation_access,
    get_evaluation_data_path,
    DataGuardViolation,
    MAX_OSM_PERMITTED_SNAPSHOT,
)


def test_osm_timestamp_valid_preevent():
    """Verify pre-event OSM timestamp strictly before event date passes."""
    req_date = "2026-07-20T00:00:00Z"
    event_date = "2026-08-01T00:00:00Z"
    verified = verify_osm_timestamp(req_date, event_date)
    assert verified == datetime(2026, 7, 20, 0, 0, 0, tzinfo=timezone.utc)


def test_osm_timestamp_rejects_post_event():
    """Verify requesting OSM on or after event date raises DataGuardViolation (Rule R2)."""
    # Equal to event date
    with pytest.raises(DataGuardViolation, match="Rule R2"):
        verify_osm_timestamp("2026-08-01T12:00:00Z", "2026-08-01T12:00:00Z")

    # Strictly after event date
    with pytest.raises(DataGuardViolation, match="Rule R2"):
        verify_osm_timestamp("2026-08-05T00:00:00Z", "2026-08-01T00:00:00Z")


def test_osm_timestamp_rejects_exceeding_global_limit():
    """Verify requesting OSM after 2026-07-27 raises DataGuardViolation (Rule R1)."""
    # Even if event is in September, OSM cannot exceed 2026-07-27
    with pytest.raises(DataGuardViolation, match="Rule R1"):
        verify_osm_timestamp("2026-07-28T00:00:00Z", "2026-09-01T00:00:00Z")


def test_authorized_evaluation_access():
    """Verify that test_data_guard.py is authorized to access evaluation path."""
    eval_file = Path("evaluation/EMSR927_AOI01_test.shp")
    resolved = guard_evaluation_access(eval_file)
    assert "evaluation" in resolved.parts


def test_unauthorized_evaluation_access_rejected(tmp_path, monkeypatch):
    """
    Simulate an unauthorized operational module attempting to read evaluation data.
    """
    dummy_eval = tmp_path / "evaluation" / "EMSR927_damage.tif"
    dummy_eval.parent.mkdir(parents=True, exist_ok=True)
    dummy_eval.write_text("dummy")

    # In a simulated pipeline module named 'predict.py'
    import inspect
    real_stack = inspect.stack

    class FakeFrame:
        def __init__(self, filename):
            self.filename = filename

    # Mock inspect.stack to simulate being called from src/floodsat/infer/predict.py
    monkeypatch.setattr(inspect, "stack", lambda: [FakeFrame("data_guard.py"), FakeFrame("predict.py")])

    with pytest.raises(DataGuardViolation, match="Unauthorized access to evaluation data"):
        guard_evaluation_access(dummy_eval)
