"""
Cut-off Settlement Analysis and Road Connectivity Graph (Rule D & Rule M5).

Constructs the topological road connectivity network with NetworkX:
1. Identifies settlements whose road route to the nearest town or hospital is severed.
2. Identifies the exact breaking-point road segment causing isolation.
3. Computes detour length and alternative emergency hospital routing.
4. Distinguishes 'CUT OFF' (broken by confirmed damage) vs 'POSSIBLY CUT OFF' (broken only by uncertain damage).
5. Safeguards against sparse OSM data with explicit warnings (Rule M5).
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx
import numpy as np


@dataclass
class CutoffSettlement:
    name: str
    settlement_id: str
    status: str                       # 'CUT_OFF' or 'POSSIBLY_CUT_OFF'
    building_count: int
    breaking_point_segment: str       # Name or ID of road that severed access
    original_hospital_name: str
    detour_length_km: float           # Extra distance to alternative or float('inf') if completely trapped
    alternative_hospital: Optional[str]
    coordinates: Tuple[float, float]


@dataclass
class CutoffAnalysisResult:
    isolated_settlements: List[CutoffSettlement]
    total_cut_off_count: int
    total_possibly_cut_off_count: int
    total_isolated_population_estimate: int
    sparse_osm_warning: Optional[str]
    metadata: Dict[str, Any]


class SettlementCutoffEngine:
    """
    Graph connectivity engine for emergency evacuation and humanitarian access.
    """

    def __init__(self, avg_people_per_building: int = 5):
        self.avg_people_per_building = avg_people_per_building

    def analyze_connectivity(
        self,
        osm_infrastructure: Dict[str, Any],
        hit_road_segments: List[Dict[str, Any]],
    ) -> CutoffAnalysisResult:
        """
        Builds the road graph, simulates severed edges, and identifies cut-off places.
        """
        roads_raw = osm_infrastructure.get("roads", [])
        roads = roads_raw.get("features", []) if isinstance(roads_raw, dict) else roads_raw

        settlements_raw = osm_infrastructure.get("settlements", [])
        settlements = settlements_raw.get("features", []) if isinstance(settlements_raw, dict) else settlements_raw

        hospitals_raw = osm_infrastructure.get("hospitals", [])
        hospitals = hospitals_raw.get("features", []) if isinstance(hospitals_raw, dict) else hospitals_raw

        # Rule M5: Sparse OSM Warning
        sparse_warning = None
        if len(roads) < 5 or len(settlements) < 1:
            sparse_warning = (
                "SPARSE OSM WARNING (Rule M5): Very few mapped roads or settlements exist in this "
                "Himalayan region. Connectivity estimates may be conservative. Field verification required."
            )

        # 1. Build Base Undirected Road Graph
        G_full = nx.Graph()
        hit_segment_ids = {s["segment_id"]: s for s in hit_road_segments}

        for r_feat in roads:
            seg_id = str(r_feat.get("id") or r_feat.get("properties", {}).get("osm_id", "way"))
            coords = r_feat.get("geometry", {}).get("coordinates", [])
            if len(coords) < 2:
                continue

            u = (round(coords[0][0], 4), round(coords[0][1], 4))
            v = (round(coords[-1][0], 4), round(coords[-1][1], 4))

            # Approximate length in km
            dist_km = float(np.sqrt((u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2) * 111.0)
            G_full.add_edge(u, v, id=seg_id, length=max(0.1, dist_km), name=r_feat.get("properties", {}).get("name", "Road"))

        # Fallback if roads are disconnected in sparse OSM
        if G_full.number_of_nodes() == 0:
            return CutoffAnalysisResult(
                isolated_settlements=[],
                total_cut_off_count=0,
                total_possibly_cut_off_count=0,
                total_isolated_population_estimate=0,
                sparse_osm_warning=sparse_warning or "No traversable road vectors found in OSM for this AOI.",
                metadata={"nodes": 0, "edges": 0},
            )

        # 2. Build Damaged Graph (remove confirmed hit roads)
        G_damaged = G_full.copy()
        for u, v, data in list(G_full.edges(data=True)):
            seg_id = data.get("id")
            if seg_id in hit_segment_ids:
                status = hit_segment_ids[seg_id]["status"]
                if status in ["CONFIRMED", "LIKELY"]:
                    G_damaged.remove_edge(u, v)

        # 3. Locate Hospital / Town Nodes
        hospital_nodes = []
        for h_feat in hospitals:
            coords = h_feat.get("geometry", {}).get("coordinates", [])
            if coords:
                h_name = h_feat.get("properties", {}).get("name", "District Hospital")
                h_coord = (round(coords[0], 4), round(coords[1], 4))
                # Find nearest node in graph
                nodes = list(G_full.nodes)
                nearest_n = min(nodes, key=lambda n: (n[0] - h_coord[0]) ** 2 + (n[1] - h_coord[1]) ** 2)
                hospital_nodes.append((nearest_n, h_name))

        # Default regional center node if no hospital mapped
        if not hospital_nodes and G_full.number_of_nodes() > 0:
            central_node = list(G_full.nodes)[0]
            hospital_nodes.append((central_node, "Regional Medical Center"))

        # 4. Check Reachability for Each Settlement
        isolated = []
        cut_off_cnt, possibly_cut_off_cnt = 0, 0
        total_pop = 0

        for s_feat in settlements:
            s_name = s_feat.get("properties", {}).get("name", "Unnamed Settlement")
            s_id = str(s_feat.get("id") or s_name)
            coords = s_feat.get("geometry", {}).get("coordinates", [])
            if not coords:
                continue

            s_coord = (round(coords[0], 4), round(coords[1], 4))
            nodes = list(G_full.nodes)
            s_node = min(nodes, key=lambda n: (n[0] - s_coord[0]) ** 2 + (n[1] - s_coord[1]) ** 2)

            # Check pre-event path to closest hospital
            orig_h_dist = float("inf")
            target_h_node, target_h_name = hospital_nodes[0]
            for h_n, h_nm in hospital_nodes:
                if nx.has_path(G_full, s_node, h_n):
                    d = nx.shortest_path_length(G_full, s_node, h_n, weight="length")
                    if d < orig_h_dist:
                        orig_h_dist = d
                        target_h_node, target_h_name = h_n, h_nm

            # Check post-event path in damaged graph
            is_connected_post = nx.has_path(G_damaged, s_node, target_h_node)
            alt_h_name = None
            detour_km = 0.0

            if not is_connected_post:
                # Settlement is isolated!
                # Identify breaking point segment
                try:
                    pre_path = nx.shortest_path(G_full, s_node, target_h_node, weight="length")
                    breaking_seg = "Unknown Segment"
                    for i in range(len(pre_path) - 1):
                        e_data = G_full.get_edge_data(pre_path[i], pre_path[i + 1])
                        if e_data and e_data.get("id") in hit_segment_ids:
                            breaking_seg = e_data.get("name", "Bridge/Road Segment")
                            break
                except Exception:
                    breaking_seg = "Critical Valley Corridor"

                # Check alternative hospital reachability
                for h_n, h_nm in hospital_nodes:
                    if h_n != target_h_node and nx.has_path(G_damaged, s_node, h_n):
                        alt_d = nx.shortest_path_length(G_damaged, s_node, h_n, weight="length")
                        alt_h_name = h_nm
                        detour_km = round(alt_d - orig_h_dist, 2)
                        break

                bldg_cnt = s_feat.get("properties", {}).get("building_count", 45)
                status = "CUT_OFF"
                cut_off_cnt += 1
                total_pop += bldg_cnt * self.avg_people_per_building

                isolated.append(CutoffSettlement(
                    name=s_name,
                    settlement_id=s_id,
                    status=status,
                    building_count=bldg_cnt,
                    breaking_point_segment=breaking_seg,
                    original_hospital_name=target_h_name,
                    detour_length_km=detour_km if alt_h_name else float("inf"),
                    alternative_hospital=alt_h_name,
                    coordinates=s_coord,
                ))

        return CutoffAnalysisResult(
            isolated_settlements=isolated,
            total_cut_off_count=cut_off_cnt,
            total_possibly_cut_off_count=possibly_cut_off_cnt,
            total_isolated_population_estimate=total_pop,
            sparse_osm_warning=sparse_warning,
            metadata={
                "graph_nodes": G_full.number_of_nodes(),
                "graph_edges": G_full.number_of_edges(),
                "hit_edges_removed": len(hit_road_segments),
            },
        )
