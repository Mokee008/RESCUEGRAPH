// RESCUEGRAPH: TypeScript Domain Types

export interface Settlement {
  id: string;
  name: string;
  name_ne?: string;
  type: string;
  coordinates: [number, number];
  elevation_m: number;
  population_est: number;
  is_destination: boolean;
  is_hospital: boolean;
  is_rescue_hub: boolean;
  mapped_buildings: number;
  connectivity_status?: 'CONNECTED' | 'AT_RISK' | 'CUT_OFF' | 'HUB';
  status_label?: string;
  connected_to_town?: boolean;
  connected_to_hospital?: boolean;
  viable_routes_count?: number;
  nearest_reachable_hub?: string;
  disconnect_cause?: string | null;
  alternate_route_available?: boolean;
  critical_edges?: Array<{
    road_id: string;
    name: string;
    is_bridge?: boolean;
    bridge_id?: string;
    impact: string;
  }>;
  physical_flood_status?: 'GREEN' | 'ORANGE' | 'RED';
  physical_status_label?: string;
  flood_distance_m?: number;
}

export interface InfrastructureEvidence {
  feature_type: string;
  id: string;
  name: string;
  coordinates: [number, number];
  flood_proximity_m: number;
  satellite_evidence: string;
  model_confidence: number;
  current_connectivity_effect: string;
  reason_for_classification: string;
  data_source: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  highway: string;
  bridge?: string;
  bridge_id?: string;
  u: string;
  v: string;
  length_km: number;
  surface: string;
  coordinates: [number, number][];
  status: 'GREEN' | 'ORANGE' | 'RED';
  classification_label: string;
  passable: boolean;
  evidence: InfrastructureEvidence;
}

export interface BridgeFeature {
  id: string;
  name: string;
  road_id: string;
  coordinates: [number, number];
  structure: string;
  length_m: number;
  criticality: string;
  status: 'GREEN' | 'ORANGE' | 'RED';
  classification_label: string;
  evidence: InfrastructureEvidence;
}

export interface DamageSummary {
  summary: {
    total_roads_analyzed: number;
    damaged_roads_count: number;
    at_risk_roads_count: number;
    intact_roads_count: number;
    total_bridges_analyzed: number;
    damaged_bridges_count: number;
    at_risk_bridges_count: number;
    intact_bridges_count: number;
    total_mapped_buildings: number;
    affected_buildings_est: number;
    uncertain_buildings_est: number;
  };
  roads: RoadSegment[];
  bridges: BridgeFeature[];
  settlements: Settlement[];
}

export interface ConnectivityResult {
  summary: {
    total_settlements: number;
    cut_off_settlements_count: number;
    at_risk_settlements_count: number;
    connected_settlements_count: number;
    isolated_population_est: number;
  };
  settlements: Settlement[];
  network_edges: any[];
}

export interface SatelliteMetadata {
  mode: string;
  provenance_tag: string;
  case_study: string;
  aoi_name: string;
  aoi_bbox: number[];
  event_date: string;
  sentinel_1: any;
  sentinel_2: any;
  copernicus_dem: any;
  pre_event_osm: any;
  pipeline_stages: Array<{
    id: string;
    label: string;
    status: string;
    details: string;
  }>;
}

export interface SensorStatus {
  radar_available: boolean;
  radar_sensor: string;
  optical_available: boolean;
  optical_sensor: string;
  optical_cloud_quality: string;
  optical_cloud_percent: number;
  terrain_available: boolean;
  terrain_sensor: string;
  fusion_mode: string;
  fallback_note: string;
}

export interface SegmentationLayers {
  timeline_stages: string[];
  current_stage: string;
  metrics: {
    total_affected_area_sq_km: number;
    flood_water_area_sq_km: number;
    debris_silt_area_sq_km: number;
    mean_water_confidence: number;
    mean_debris_confidence: number;
    mean_uncertainty_index: number;
  };
  layers: {
    before: any;
    after: any;
    difference: any;
    ai_mask: any;
    final_map: {
      geojson: any;
    };
  };
  uncertainty: {
    high_confidence_area_pct: number;
    medium_confidence_area_pct: number;
    low_confidence_uncertain_pct: number;
    reasons_for_uncertainty: string[];
  };
}

export interface FloodPathResult {
  title: string;
  start_coordinates: [number, number];
  total_flow_length_km: number;
  elevation_drop_m: number;
  downstream_direction: string;
  elevation_profile: Array<{
    checkpoint: string;
    distance_km: number;
    elevation_m: number;
    gradient_pct: number;
  }>;
  impacted_settlements_along_path: Array<{
    id: string;
    name: string;
    elevation_m: number;
    distance_to_flow_axis_m: number;
    warning_level: string;
  }>;
  path_geojson: any;
}

export interface SituationReport {
  title: string;
  subtitle: string;
  language: string;
  generated_at: string;
  event_overview: {
    event_name: string;
    location: string;
    event_date: string;
    sensor_inputs: string;
  };
  key_metrics: {
    total_flood_area_sq_km: number;
    water_extent_sq_km: number;
    debris_silt_sq_km: number;
    damaged_roads_count: number;
    damaged_bridges_count: number;
    affected_buildings_est: number;
    cut_off_settlements_count: number;
    isolated_population_est: number;
  };
  cut_off_communities: {
    status_headline: string;
    settlements: string[];
    critical_severed_chokepoints: string[];
  };
  rescue_recommendations: string[];
  confidence_score: string;
  limitations: string[];
  attributions: string[];
}
