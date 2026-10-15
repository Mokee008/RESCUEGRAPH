// RESCUEGRAPH: API Client connecting to FastAPI backend

const API_BASE = '/api';

export const api = {
  async getSatelliteMetadata() {
    const res = await fetch(`${API_BASE}/satellite/metadata`);
    if (!res.ok) throw new Error('Failed to fetch satellite metadata');
    return res.json();
  },

  async ingestSatellite(aoi_bbox?: number[], event_date?: string) {
    const res = await fetch(`${API_BASE}/satellite/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aoi_bbox, event_date }),
    });
    if (!res.ok) throw new Error('Failed to ingest satellite imagery');
    return res.json();
  },

  async getSensorStatus() {
    const res = await fetch(`${API_BASE}/sensors/status`);
    if (!res.ok) throw new Error('Failed to fetch sensor status');
    return res.json();
  },

  async getSegmentationLayers() {
    const res = await fetch(`${API_BASE}/segmentation/layers`);
    if (!res.ok) throw new Error('Failed to fetch segmentation layers');
    return res.json();
  },

  async getDamageSummary() {
    const res = await fetch(`${API_BASE}/damage/summary`);
    if (!res.ok) throw new Error('Failed to fetch damage summary');
    return res.json();
  },

  async getGraphConnectivity() {
    const res = await fetch(`${API_BASE}/graph/connectivity`);
    if (!res.ok) throw new Error('Failed to fetch graph connectivity');
    return res.json();
  },

  async getBottleneckImpact(bridgeId: string) {
    const res = await fetch(`${API_BASE}/graph/bottlenecks/${bridgeId}`);
    if (!res.ok) throw new Error(`Failed to fetch impact for ${bridgeId}`);
    return res.json();
  },

  async runSimulation(payload: {
    scenario_name?: string;
    disabled_roads?: string[];
    restored_roads?: string[];
    flood_expansion_level?: number;
  }) {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to execute What-If simulation');
    return res.json();
  },

  async traceFloodPath(start_coords?: [number, number]) {
    const res = await fetch(`${API_BASE}/flood_tracer/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_coords }),
    });
    if (!res.ok) throw new Error('Failed to trace flood path');
    return res.json();
  },

  async calculateRescueRoute(from_node: string, to_node: string) {
    const res = await fetch(`${API_BASE}/routing/rescue_route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_node, to_node }),
    });
    if (!res.ok) throw new Error('Failed to calculate rescue route');
    return res.json();
  },

  async queryCopilot(prompt: string, language: string = 'en') {
    const res = await fetch(`${API_BASE}/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language }),
    });
    if (!res.ok) throw new Error('Failed to query copilot');
    return res.json();
  },

  async getEMSR927Validation() {
    const res = await fetch(`${API_BASE}/validation/emsr927`);
    if (!res.ok) throw new Error('Failed to fetch EMSR927 validation');
    return res.json();
  },

  async getSituationReport(lang: string = 'en') {
    const res = await fetch(`${API_BASE}/reports/situation_report?lang=${lang}`);
    if (!res.ok) throw new Error('Failed to fetch situation report');
    return res.json();
  },
};
