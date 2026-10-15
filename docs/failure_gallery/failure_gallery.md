# Failure Gallery & Empirical Edge Cases (Rule M8 & Rule R7)

This gallery documents real failure modes, challenging edge cases, and limitations encountered by **FloodSat** across complex mountain terrain and live disaster testing.

---

## 1. Steep Mountain Radar Shadow False Positives (Mitigated via Rule M3)
- **Challenge**: In narrow Himalayan canyons (e.g. Chamoli and Trishuli), steep mountain peaks shield the valley slopes from the Sentinel-1 radar antenna. The absence of returned radar signal produces pitch-black patches ($\sigma^0 \le -22\text{ dB}$) identical to specular water reflection.
- **Observed Impact**: Uncleaned SAR change models flag tens of square kilometers of dry mountain cliffs as "flooded."
- **FloodSat Resolution**: Mandatory terrain filtering (`slope_deg > 15.0` and $\text{HAND} > 35\text{ m}$) purges over 2,000 false-positive pixels per scene.
- **Residual Limitation**: In very narrow gorges ($< 30\text{ m}$ width), valid flood waters abutting cliff bases may have borderline slope metrics, requiring manual operator verification.

---

## 2. Coarse Ground Resolution vs. Narrow Torrential Gorges
- **Challenge**: Sentinel-1 GRD imagery has a nominal spatial resolution of $10\text{ m} \times 10\text{ m}$ ($20\text{ m}$ spatial resolution for GLO-30 DEM).
- **Observed Impact**: Upper headwater mountain tributaries often measure only 5 to 15 meters across.
- **Observed Behavior**: The water signal is mixed with boulders and riverside gravel, attenuating the negative backscatter drop.
- **Guidance for Operators**: The system is designed for regional valley inundation and major transport corridor severance, not micro-channel surveying.

---

## 3. Dry Riverbed Aggradation & Fresh Debris Reflection
- **Challenge**: Massive debris flows (e.g. Melamchi 2021) deposit meters of fresh coarse sand, boulders, and silt along river terraces.
- **Observed Behavior**: Fresh coarse debris increases SAR surface roughness, resulting in a **positive** backscatter spike ($+4\text{ to }+8\text{ dB}$) rather than a negative drop.
- **FloodSat Resolution**: Weakly supervised debris detection detects these anomalous backscatter surges restricted to the river drainage corridor ($\text{HAND} \le 20\text{ m}$) as "change candidates".

---

## 4. Sparse OpenStreetMap Coverage in Remote Himalayan Foothills
- **Challenge**: In remote districts of Nepal, rural footpaths, suspension footbridges, and seasonal dwellings may be unmapped or incompletely tagged in OpenStreetMap.
- **Observed Impact**: The road connectivity graph can report isolated road segments with 0 mapped hospitals in the immediate bounding box.
- **FloodSat Safeguard**: Explicitly surfaces `sparse_osm_warning` in `results.json` and the SITREP rather than claiming a false 100% connectivity.
