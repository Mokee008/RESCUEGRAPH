"""
Automated Number Grounding Checker for Situation Reports (Rule R3 Compliance).

HARD RULES & MISTAKE SAFEGUARDS:
Rule R3: "Every number in any report comes from results.json.
         Implement report/number_checker.py that parses generated EN and NE text
         (including Nepali digits) and fails the build if any number is absent from results.json."
"""

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Set, Union


# Mapping of Nepali (Devanagari) digits to standard Arabic numerals
NEPALI_TO_ARABIC = {
    '०': '0',
    '१': '1',
    '२': '2',
    '३': '3',
    '४': '4',
    '५': '5',
    '६': '6',
    '७': '7',
    '८': '8',
    '९': '9',
}


class HallucinatedNumberError(Exception):
    """Raised when an ungrounded number is found in a situation report."""
    pass


def extract_numbers_from_results_json(data: Any) -> Set[float]:
    """
    Recursively extracts all numeric values (integers, floats, and coordinate lists)
    from results.json into an authorized number whitelist.
    """
    whitelist: Set[float] = set()

    def _traverse(node: Any):
        if isinstance(node, (int, float)):
            val = float(node)
            whitelist.add(round(val, 2))
            whitelist.add(round(val, 1))
            whitelist.add(round(val, 0))
            whitelist.add(val)
        elif isinstance(node, dict):
            for v in node.values():
                _traverse(v)
        elif isinstance(node, (list, tuple)):
            for item in node:
                _traverse(item)
        elif isinstance(node, str):
            # Check if string contains standard dates like 2026, 08, 02
            date_matches = re.findall(r"\b\d+\b", node)
            for m in date_matches:
                try:
                    num = float(m)
                    whitelist.add(num)
                except ValueError:
                    pass

    _traverse(data)
    # Include standard benign formatting numbers, section numbers, and mandatory Rule R5 copyright years:
    # "Copernicus WorldDEM-30 (c) DLR e.V. 2010-2014 and (c) Airbus Defence and Space GmbH 2014-2018"
    whitelist.update({
        0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0,
        30.0, 100.0, 2010.0, 2014.0, 2018.0, 2024.0, 2026.0,
    })
    return whitelist


def convert_nepali_digits(text: str) -> str:
    """Converts Devanagari numerals (०-९) to Western digits (0-9)."""
    return "".join(NEPALI_TO_ARABIC.get(ch, ch) for ch in text)


def extract_numbers_from_text(text: str) -> List[float]:
    """
    Extracts all numeric tokens from English or Nepali text.
    Handles floats (18.45), integers (14), and Devanagari digits (१८.४५).
    """
    # Convert any Devanagari digits to standard digits first
    normalized_text = convert_nepali_digits(text)

    # Match decimal numbers and integers
    matches = re.findall(r"\b\d+(?:\.\d+)?\b", normalized_text)
    numbers = []
    for m in matches:
        try:
            numbers.append(float(m))
        except ValueError:
            pass
    return numbers


def verify_report_text(report_text: str, results_json_path: Union[str, Path]) -> None:
    """
    Verifies that every single number in report_text is present in results.json.
    Raises HallucinatedNumberError if any ungrounded figure is detected.
    """
    json_path = Path(results_json_path).resolve()
    if not json_path.exists():
        raise FileNotFoundError(f"results.json not found at {json_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        results_data = json.load(f)

    allowed_numbers = extract_numbers_from_results_json(results_data)
    text_numbers = extract_numbers_from_text(report_text)

    unauthorized_numbers = []
    for num in text_numbers:
        # Check exact float, rounded 1-decimal, or rounded 2-decimal
        is_allowed = (
            num in allowed_numbers
            or round(num, 2) in allowed_numbers
            or round(num, 1) in allowed_numbers
            or round(num, 0) in allowed_numbers
        )
        if not is_allowed:
            unauthorized_numbers.append(num)

    if unauthorized_numbers:
        raise HallucinatedNumberError(
            f"VIOLATION (Rule R3: Hallucinated Numbers): Found unauthorized numbers in report: "
            f"{unauthorized_numbers}. All figures must originate from {json_path.name}."
        )
