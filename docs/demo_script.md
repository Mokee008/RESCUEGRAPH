# FloodSat: 3-Minute Video Demo Script (Track B Hackathon Judging)

**Total Duration: 180 Seconds (3 Minutes)**  
**Speaker: Geospatial ML Engineer / Project Lead**

---

### [0:00 – 0:30] Introduction & The Challenge
- **Visual**: Screen shows the rugged Trishuli / Bhote Koshi canyon in Nepal on 3D satellite view, followed by headline: "August 2026 Trishuli Flood Event".
- **Audio (Presenter)**:
  > *"When extreme flooding strikes the Central Himalayas, steep canyons channel torrential debris flows that destroy bridges and sever access to isolated communities.
  > Today, we present **FloodSat**, an end-to-end disaster intelligence platform for Track B.
  > FloodSat takes ANY bounding box and flood event date live, and from raw Sentinel satellite data, answers three non-negotiable questions: Where did the flood hit? What was damaged? And who is cut off?"*

---

### [0:30 – 1:05] Live Pipeline Execution & Strict Data Governance
- **Visual**: Switch to VS Code terminal or CLI. Presenter executes `python -m floodsat.run --bbox 85.15 27.95 85.35 28.15 --date 2026-08-02`. Terminal prints each stage: CDSE satellite query, ohsome pre-event OSM query, same-orbit pairing, calibration, terrain cleaning, and graph analysis.
- **Audio (Presenter)**:
  > *"We follow strict challenge compliance: we ingest ONLY Sentinel-1 SAR, Sentinel-2 optical, Copernicus GLO-30 DEM, and pre-event OpenStreetMap snapshots dated before the event.
  > Notice the automated guardrails: our pairing engine matches only the same relative orbit to prevent mountain distortions, and our data guard blocks any post-event OSM edits.
  > In high-relief terrain, dark radar shadows mimic water. FloodSat's physics-based terrain engine computes topographic slope and Height Above Nearest Drainage (HAND), purging over 2,000 mountain radar shadow false alarms in seconds."*

---

### [1:05 – 1:50] The Streamlit Geospatial Dashboard
- **Visual**: Browser opens `http://localhost:8501`. Presenter shows the clean KPI metrics bar (Flood Extent: 18.45 km², Affected Buildings: 22, Damaged Roads: 8.3 km, Cut-Off Settlements: 1).
- **Visual**: Toggle between Esri World Imagery (high-resolution satellite) and CartoDB (clean map). Zoom into the valley to show the semi-transparent flood polygon and red warning markers on cut-off villages. Click on "Syabrubesi" marker showing pop-up: *Breaking point: Trishuli Canyon Bridge, Detour: 24.5 km to Bidur Hospital*.
- **Audio (Presenter)**:
  > *"Here is the interactive Streamlit dashboard. Responders can toggle between true satellite imagery and a clean geographic basemap.
  > Rather than just outputting a binary water mask, FloodSat converts predictions into operational network intelligence.
  > Our road graph algorithm identifies that Syabrubesi has lost road connectivity because the Trishuli Canyon Bridge was severed. It reports 72 isolated buildings, 360 trapped residents, and automatically routes an alternative 24.5 km emergency detour to Bidur District Hospital."*

---

### [1:50 – 2:25] Zero-Hallucination Bilingual SITREP (English & Nepali)
- **Visual**: Presenter clicks on the "Situation Report" tab in the dashboard. Highlights the English SITREP, switches to the Nepali SITREP (showing Devanagari numerals), and runs `report/number_checker.py`.
- **Audio (Presenter)**:
  > *"For local incident commanders, FloodSat generates an instant one-page Situation Report in both English and Nepali.
  > In disaster response, hallucinated numbers cost lives. Every single number in both reports—down to the Devanagari digits—is parsed and validated against results.json using our deterministic number checker. If even a single digit is ungrounded, the build halts immediately."*

---

### [2:25 – 3:00] Air-Gapped Benchmarking & Conclusion
- **Visual**: Shows `scripts/compare_emsr927.py` output comparing against Copernicus EMSR927, followed by the failure gallery documenting physical limitations in steep terrain. Closes with mandatory Copernicus, DLR, and OpenStreetMap attributions.
- **Audio (Presenter)**:
  > *"We validate our predictions against Copernicus EMS activation EMSR927, which remains strictly air-gapped in an isolated evaluation folder. We also benchmark honest generalization across historical events like Chamoli and South Lhonak GLOF.
  > While FloodSat is an educational prototype, it demonstrates how multi-sensor satellite AI and graph intelligence can rapidly illuminate cut-off communities from space.
  > Thank you!"*
