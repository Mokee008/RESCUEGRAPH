"""
Situation Report Builder (English + Nepali) conforming strictly to Rule R3 & R5.
"""

import json
from pathlib import Path
from typing import Dict, Union

from floodsat.report.number_checker import verify_report_text


# Devanagari digit converter
ARABIC_TO_NEPALI = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
}

def to_nepali_digits(num: Union[int, float, str]) -> str:
    return "".join(ARABIC_TO_NEPALI.get(c, c) for c in str(num))


def build_english_sitrep(data: Dict) -> str:
    meta = data["metadata"]
    fd = data["flood_and_debris"]
    dmg = data["damage_assessment"]
    cutoff = data["cutoff_settlements"]

    report = f"""================================================================================
FLOODSAT SITUATION REPORT (SITREP) — DISASTER INTELLIGENCE
Event: {meta['aoi_name']}
Flood Date: {meta['event_date']}
================================================================================

1. SATELLITE FLOOD & DEBRIS EXTENT
- Total Inundation Extent: {fd['flood_extent_sq_km']} sq km
- Debris / Riverbed Change Corridor: {fd['debris_extent_sq_km']} sq km
- Mean Inundation Model Confidence: {fd['mean_confidence']}
- Mountain Radar Shadow False Positives Cleaned: {fd['false_positives_cleaned']}

2. INFRASTRUCTURE DAMAGE SUMMARY
- Total Buildings Affected: {dmg['total_buildings_affected']}
  * Confirmed Flooded Buildings: {dmg['confirmed_buildings']}
  * Likely Affected Buildings: {dmg['likely_buildings']}
  * Uncertain Potential Impacts: {dmg['uncertain_buildings']}
- Total Road Corridors Damaged: {dmg['total_roads_km_affected']} km
  * Confirmed Blocked Roads: {dmg['confirmed_roads_km']} km
  * Likely Affected Road Segments: {dmg['likely_roads_km']} km
- Severed / Damaged Bridges: {dmg['damaged_bridges_count']}

3. ISOLATED SETTLEMENTS & ACCESS
- Total Cut-off Settlements: {cutoff['total_cut_off_settlements']}
- Estimated Trapped Population: {cutoff['total_isolated_population']}
"""
    if cutoff["settlements"]:
        report += "\nCritical Isolated Locations:\n"
        for s in cutoff["settlements"][:3]:
            report += f" - {s['name']}: {s['building_count']} buildings isolated. Severed by: {s['breaking_point_segment']}. Detour: {s['detour_km']} km.\n"

    report += f"""
================================================================================
MANDATORY ATTRIBUTIONS (Rule R5):
"Contains modified Copernicus Sentinel data 2026."
"Produced using Copernicus WorldDEM-30 (c) DLR e.V. 2010-2014 and (c) Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved."
"(c) OpenStreetMap contributors."
================================================================================
"""
    return report


def build_nepali_sitrep(data: Dict) -> str:
    meta = data["metadata"]
    fd = data["flood_and_debris"]
    dmg = data["damage_assessment"]
    cutoff = data["cutoff_settlements"]

    # Convert figures to Devanagari numerals
    fl_km = to_nepali_digits(fd['flood_extent_sq_km'])
    deb_km = to_nepali_digits(fd['debris_extent_sq_km'])
    fp_cl = to_nepali_digits(fd['false_positives_cleaned'])
    bldg_tot = to_nepali_digits(dmg['total_buildings_affected'])
    bldg_conf = to_nepali_digits(dmg['confirmed_buildings'])
    bldg_lik = to_nepali_digits(dmg['likely_buildings'])
    road_tot = to_nepali_digits(dmg['total_roads_km_affected'])
    br_cnt = to_nepali_digits(dmg['damaged_bridges_count'])
    cut_cnt = to_nepali_digits(cutoff['total_cut_off_settlements'])
    pop_tot = to_nepali_digits(cutoff['total_isolated_population'])

    report = f"""================================================================================
बाढी विपद् वस्तुस्थिति प्रतिवेदन (SITREP) — फ्लडस्याट
स्थान: {meta['aoi_name']}
घटना मिति: {meta['event_date']}
================================================================================

१. भू-उपग्रह बाढी तथा गेग्रान फैलावट
- कुल जलमग्न क्षेत्र: {fl_km} वर्ग कि.मी.
- गेग्रान / नदी बहाव परिवर्तन क्षेत्र: {deb_km} वर्ग कि.मी.
- पहाडी राडार छायाँबाट हटाइएका गलत संकेत: {fp_cl}

२. भौतिक पूर्वाधार क्षति विवरण
- प्रभावित कुल भवनहरू: {bldg_tot}
  * पूर्ण जलमग्न पुष्टि भएका भवनहरू: {bldg_conf}
  * सम्भावित प्रभावित भवनहरू: {bldg_lik}
- क्षतिग्रस्त सडक खण्ड: {road_tot} कि.मी.
- क्षतिग्रस्त पुलहरू: {br_cnt}

३. सम्पर्कविहीन बस्ती तथा पहुँच विश्लेषण
- यातायात सम्पर्क टुटेका कुल बस्तीहरू: {cut_cnt}
- प्रत्यक्ष प्रभावित तथा उद्धार पर्खिरहेको जनसंख्या अनुमान: {pop_tot}
"""
    if cutoff["settlements"]:
        report += "\nप्रमुख सम्पर्कविहीन बस्तीहरू:\n"
        for s in cutoff["settlements"][:3]:
            s_bldg = to_nepali_digits(s['building_count'])
            s_det = to_nepali_digits(s['detour_km'])
            report += f" - {s['name']}: {s_bldg} घरधुरी अलग। अवरोध: {s['breaking_point_segment']}। वैकल्पिक दूरी: {s_det} कि.मी.।\n"

    report += f"""
================================================================================
वैधानिक स्रोत तथा प्रतिलिपि अधिकार (Rule R5):
"Contains modified Copernicus Sentinel data 2026."
"Produced using Copernicus WorldDEM-30 (c) DLR e.V. 2010-2014 and (c) Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved."
"(c) OpenStreetMap contributors."
================================================================================
"""
    return report


def generate_and_verify_reports(results_json_path: Union[str, Path], output_dir: str = "results") -> Dict[str, str]:
    """
    Builds both English and Nepali reports and runs number_checker.py on each.
    Fails build immediately if any hallucinated figure is detected.
    """
    path = Path(results_json_path).resolve()
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    en_text = build_english_sitrep(data)
    ne_text = build_nepali_sitrep(data)

    # Strictly verify zero hallucinated numbers
    verify_report_text(en_text, path)
    verify_report_text(ne_text, path)

    out_p = Path(output_dir).resolve()
    out_p.mkdir(parents=True, exist_ok=True)

    en_file = out_p / "sitrep_en.txt"
    ne_file = out_p / "sitrep_ne.txt"

    with open(en_file, "w", encoding="utf-8") as f:
        f.write(en_text)

    with open(ne_file, "w", encoding="utf-8") as f:
        f.write(ne_text)

    return {"en": str(en_file), "ne": str(ne_file)}
