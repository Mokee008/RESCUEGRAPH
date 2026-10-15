"""
Unit tests for Situation Report generation, English/Nepali digit parsing,
and Rule R3 Number Checker validation.
"""

from pathlib import Path
import pytest

from floodsat.report.number_checker import (
    convert_nepali_digits,
    extract_numbers_from_results_json,
    extract_numbers_from_text,
    verify_report_text,
    HallucinatedNumberError,
)
from floodsat.report.build_report import (
    build_english_sitrep,
    build_nepali_sitrep,
    generate_and_verify_reports,
)


def test_convert_nepali_digits():
    """Verify Devanagari numerals are correctly converted to Western digits."""
    nepali_text = "कुल जलमग्न क्षेत्र: १८.४५ वर्ग कि.मी. र प्रभावित घरहरू: ७२"
    converted = convert_nepali_digits(nepali_text)
    assert "18.45" in converted
    assert "72" in converted


def test_number_checker_passes_valid_report(tmp_path):
    """Verify number_checker passes when every number is grounded in results.json."""
    fake_results = {
        "metadata": {
            "aoi_name": "Trishuli",
            "bbox": [85.1, 27.9, 85.3, 28.1],
            "event_date": "2026-08-02",
        },
        "flood_and_debris": {
            "flood_extent_sq_km": 15.2,
            "debris_extent_sq_km": 4.5,
            "mean_confidence": 0.88,
            "false_positives_cleaned": 45,
        },
        "damage_assessment": {
            "total_buildings_affected": 30,
            "confirmed_buildings": 20,
            "likely_buildings": 10,
            "uncertain_buildings": 0,
            "total_roads_km_affected": 6.4,
            "confirmed_roads_km": 4.2,
            "likely_roads_km": 2.2,
            "uncertain_roads_km": 0.0,
            "damaged_bridges_count": 1,
        },
        "cutoff_settlements": {
            "total_cut_off_settlements": 2,
            "total_isolated_population": 150,
            "settlements": [
                {
                    "name": "Village A",
                    "building_count": 30,
                    "breaking_point_segment": "Bridge X",
                    "detour_km": 12.0,
                }
            ],
        },
    }

    json_path = tmp_path / "results.json"
    with open(json_path, "w") as f:
        import json
        json.dump(fake_results, f)

    en_report = build_english_sitrep(fake_results)
    ne_report = build_nepali_sitrep(fake_results)

    # Must verify without error
    verify_report_text(en_report, json_path)
    verify_report_text(ne_report, json_path)


def test_number_checker_fails_on_hallucinated_number(tmp_path):
    """
    Test Rule R3: Verify number_checker raises HallucinatedNumberError
    if text contains even a single invented number not present in results.json.
    """
    fake_results = {
        "metadata": {"aoi_name": "Trishuli", "event_date": "2026-08-02"},
        "flood_and_debris": {"flood_extent_sq_km": 10.0},
    }

    json_path = tmp_path / "results.json"
    with open(json_path, "w") as f:
        import json
        json.dump(fake_results, f)

    # Report mentions 999.0 which does NOT exist in results.json
    hallucinated_report = "The flood inundation extent is 10.0 sq km and 999 people were evacuated."

    with pytest.raises(HallucinatedNumberError, match="Rule R3: Hallucinated Numbers"):
        verify_report_text(hallucinated_report, json_path)
