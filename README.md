# FloodSat: Multimodal Satellite Disaster Intelligence Platform

[![CI](https://github.com/organization/floodsat/actions/workflows/ci.yml/badge.svg)](https://github.com/organization/floodsat)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-green.svg)](pyproject.toml)
[![Tests](https://img.shields.io/badge/Tests-36%20Passed-brightgreen.svg)](tests/)

> **Educational prototype built for Multimodal AI Hackathon 2026 — Track B: Mapping Flood Damage from Space.**  
> *Primary case study: August 2026 Trishuli / Bhote Koshi flood, Nepal (Reference activation: EMSR927).*  
> **Disclaimer: This is an educational research prototype, not an operational civilian protection tool.**

---

## 🌟 The Three Core Mission Answers

Given **ANY** arbitrary bounding box and flood event date chosen live by judges, FloodSat answers:

1. **WHERE DID THE FLOOD HIT?**
   - High-confidence pixel-level flood water and riverbed debris change maps derived from Sentinel-1 SAR ($\sigma^0$ dB) and Sentinel-2 optical imagery.
   - Rigorous terrain cleaning over Copernicus GLO-30 DEM (purging $> 2,000$ mountain radar shadow false alarms per scene).
   - Predictive uncertainty quantification via deep ensembles and temperature scaling.
2. **WHAT WAS DAMAGED?**
   - Categorized impact on pre-event OpenStreetMap infrastructure (confirmed, likely, and uncertain classifications for buildings, highways, and bridges).
3. **WHO IS CUT OFF?**
   - Road graph connectivity intelligence: pinpoints severed road segments, identifies cut-off settlements, reports trapped building and population counts, and computes detour distances to alternative emergency hospitals.

---

## 🚀 Quickstart & Installation

```bash
# 1. Clone repository and navigate
git clone https://github.com/organization/floodsat.git
cd floodsat

# 2. Install FloodSat package in editable mode
pip install -e ".[dev,ui]"

# 3. Run full automated test suite (36 unit tests enforcing all data guardrails)
PYTHONPATH=src:. pytest tests/ -v
```

---

## ⚡ Execution Modes

### 1. End-to-End Python Execution (`run(bbox, flood_date)`)

```python
from floodsat.run import run

# Run on the Trishuli Basin, Nepal case study
results = run(
    bbox=(85.15, 27.95, 85.35, 28.15),
    flood_date="2026-08-02",
    aoi_name="Trishuli / Bhote Koshi, Nepal",
    use_ml_model=True,
    output_dir="results",
)

print("Flood Inundation Extent:", results["flood_and_debris"]["flood_extent_sq_km"], "km²")
print("Cut-Off Settlements:", results["cutoff_settlements"]["total_cut_off_settlements"])
```

### 2. Command Line Interface (CLI)

```bash
# Live run on Trishuli case study
python -m floodsat.run --bbox 85.15 27.95 85.35 28.15 --date 2026-08-02 --aoi "Trishuli, Nepal"

# Live run on an arbitrary judge-selected non-Himalayan area (Emilia-Romagna, Italy)
python -m floodsat.run --bbox 11.80 44.30 12.10 44.50 --date 2023-05-18 --aoi "Emilia-Romagna, Italy" --baseline
```

### 3. Interactive Streamlit Dashboard

```bash
streamlit run src/floodsat/app/streamlit_app.py
```
*Access the interactive interface at `http://localhost:8501`: toggle satellite/clean basemaps, inspect cut-off village markers, and view verified bilingual SITREPs.*

---

## 🛡️ Strict Data Governance & Non-Negotiable Rules

- **Permitted Inputs ONLY (Rule R1)**: Sentinel-1 GRD, Sentinel-2 L2A, Copernicus GLO-30 DEM, pre-event OSM ($\le 2026-07-27$ via ohsome API), Kuro Siwo, Sen1Floods11, ImageNet encoders.
- **Air-Gapped Validation (Rule R2)**: EMSR927 damage maps and post-event OSM edits reside strictly in `./evaluation/` and cannot be read by operational code. Enforced by `src/floodsat/data_guard.py`.
- **Zero Hallucinated Numbers (Rule R3)**: Every number in English and Nepali situation reports is verified against `results.json` by `report/number_checker.py`.
- **Ethical Safeguards (Rule R4)**: Zero victim imagery anywhere across the repository, dashboard, or documentation.
- **Whole-Event Splitting (Rule M1)**: Zero spatial tile leakage; splits strictly partitioned by event ID.
- **Same-Orbit Pairing (Rule M2)**: Compares only matching relative orbits and pass directions to prevent mountain look-angle distortions.
- **Terrain Shadow Cleaning (Rule M3)**: Mandatory slope ($> 15^\circ$) and HAND ($> 35\text{ m}$) cleaning to eliminate radar shadows.

---

## 📜 Mandatory Attributions & Citations (Rule R5)

- *"Contains modified Copernicus Sentinel data 2026."*
- *"Produced using Copernicus WorldDEM-30 (c) DLR e.V. 2010-2014 and (c) Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved."*
- *"(c) OpenStreetMap contributors."*
- When validating against EMS: *"European Union, Copernicus Emergency Management Service data."*
- **Kuro Siwo**: Bountos, N. I., et al. (2024). *Kuro Siwo: 33 billion m² under the water*. NeurIPS 2024.
- **Sen1Floods11**: Bonafilia, D., et al. (2020). *Sen1Floods11*. CVPRW 2020.
