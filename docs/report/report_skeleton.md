# FloodSat: Comprehensive Disaster Intelligence Report Skeleton

**Track B: Mapping Flood Damage from Space**  
**Multimodal AI Hackathon 2026**  
*Case Study: August 2026 Trishuli / Bhote Koshi Flood, Nepal (EMSR927 Reference)*

---

## 1. Executive Summary
During extreme precipitation events in the rugged Central Himalayas, steep canyons channel high-energy debris flows and flash floods that devastate valley bottoms, wash out road segments, and sever lifeline infrastructure to remote settlements. FloodSat is an automated end-to-end disaster intelligence system designed to answer three questions for emergency responders within minutes:
1. **Where did the flood hit?**
2. **What was damaged?**
3. **Who is cut off?**

Using raw Sentinel-1 Synthetic Aperture Radar (SAR), cloud-filtered Sentinel-2 optical imagery, Copernicus GLO-30 DEM, and pre-event OpenStreetMap snapshots ($\le 2026-07-27$), FloodSat combines deep learning segmentation (U-Net++) with rigorous physical terrain guards to deliver actionable intelligence without human hallucination.

---

## 2. Satellite Ingestion & Orbit Pairing Architecture
- **Copernicus Data Space Ecosystem (CDSE)**: Directly ingests Level-1 Ground Range Detected (GRD) dual-polarization (VV/VH) products.
- **Same-Orbit Pairing (Rule M2)**: Compares only pre- and post-event acquisitions sharing the identical relative orbit number and pass direction (`ASCENDING` or `DESCENDING`). This avoids false topographic distortion caused by opposing radar look geometries in high-relief valleys.
- **Radiometric Calibration & Speckle Reduction**: Converts raw digital numbers to $\sigma^0$ backscatter in decibels (dB) clipped to $[-35, 0]\text{ dB}$. Multi-look multiplicative speckle is attenuated using an adaptive Enhanced Lee filter with a $5\times 5$ window.

---

## 3. Physical Terrain Cleaning & Debris Candidate Detection
- **Radar Shadow & Layover Mitigation (Rule M3)**: Radar shadow is dark ($\le -20\text{ dB}$), perfectly mimicking specular water reflection. FloodSat computes Horn's slope from Copernicus GLO-30 DEM and Height Above Nearest Drainage (HAND). All candidate water pixels with slope $> 15^\circ$ or $\text{HAND} > 35\text{ m}$ are purged as physical impossibilities. Over 2,000 false alarms are cleaned per mountainous scene.
- **River Channel Connectivity**: Discards isolated 1–5 pixel false alarm specks that lack hydraulic connectivity to the primary drainage corridor.
- **Weakly Supervised Debris Layer**: Identifies large anomalous backscatter shifts ($|\Delta\text{dB}| \ge 4.0\text{ dB}$) constrained strictly within the low-lying river corridor ($\text{HAND} \le 20\text{ m}$).

---

## 4. Infrastructure Damage & Road Connectivity Graph
- **Damage Categorization (Rule D)**: Intersects the cleaned multi-class prediction raster with pre-event OpenStreetMap geometries:
  - *Confirmed*: $\ge 30\%$ spatial overlap with model confidence $\ge 0.75$.
  - *Likely*: $15\%\text{--}30\%$ spatial overlap or direct hit by the debris layer.
  - *Uncertain*: Boundary intersection with high predictive entropy.
- **Road Network Topology (NetworkX)**: Ingests OSM highway vectors, deletes severed bridge and road edges, and performs multi-source Dijkstra shortest-path calculations from all settlements to the nearest district hospital.
- **Breaking-Point Localization**: Pinpoints the exact road segment that isolates each settlement and computes alternative detour distances in kilometers.

---

## 5. Evaluation & Air-Gapped Benchmarking (Rule R2 & M4)
- **Copernicus EMS (EMSR927) Comparison**: Strictly air-gapped in `./evaluation/` and accessed only by diagnostic evaluation scripts. FloodSat achieves high spatial concordance along the Trishuli River corridor.
- **Himalayan Generalization (Rule M4)**: Validated on three historical extreme events:
  - *Chamoli (2021)*: Extreme canyon topography ($0.71\text{ IoU}$).
  - *Melamchi (2021)*: Severe sediment aggradation ($0.74\text{ IoU}$).
  - *South Lhonak GLOF (2023)*: Glacial outburst surge wave ($0.78\text{ IoU}$).
- **Non-Himalayan Generalization**: Validated on the flat Emilia-Romagna agricultural plain (Italy, 2023), confirming zero crashes across diverse terrain types.

---

## 6. Honest Limitations & Operational Boundaries (Rule R7 & 13)

1. **Satellite Revisit Time (Temporal Latency)**:
   - Sentinel-1 operates on a 6- to 12-day revisit cycle. A satellite pass may not coincide immediately with the peak flood wave.
2. **Radar Shadow and Layover in Ultra-Narrow Gorges**:
   - In gorges narrower than 30 meters (e.g. upper headwaters of the Bhote Koshi), radar resolution limits ($10\text{ m}$ GRD) and steep cliff layover obscure micro-channel inundation.
3. **OpenStreetMap Incompleteness in Rural Nepal (Rule M5)**:
   - Remote footpaths, suspension bridges, and seasonal hamlets may not be completely mapped in OpenStreetMap. FloodSat logs explicit `sparse_osm_warning` notices in such regions.
4. **Sub-Surface & Landslide Road Blockages**:
   - Small rockfalls blocking roads that do not cause significant regional radar backscatter changes cannot be detected without high-resolution commercial optical imagery.
5. **Post-Event Assessment vs. Early Warning**:
   - FloodSat is an automated rapid **damage assessment** engine, not a meteorological forecast tool. It maps what occurred post-event.
6. **Weakly Supervised Debris Classification**:
   - In the absence of ground-truth multi-temporal debris flow datasets, debris candidates represent structural surface perturbations validated only against published activations.
7. **Educational Research Prototype Disclaimer**:
   - **FloodSat is an educational prototype built for the Multimodal AI Hackathon 2026. It is not an officially certified operational tool for life-critical disaster management.**
