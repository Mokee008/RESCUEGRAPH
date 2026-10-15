import React, { useState } from 'react';
import { api } from '../../services/api';
import { Settlement } from '../../types';
import { X, Compass, Navigation, AlertOctagon, CheckCircle2, Clock, Car } from 'lucide-react';

interface RescueRoutePlannerModalProps {
  settlements: Settlement[];
  onClose: () => void;
  onApplyRoute: (routeData: any) => void;
  language: 'en' | 'ne';
}

export const RescueRoutePlannerModal: React.FC<RescueRoutePlannerModalProps> = ({
  settlements,
  onClose,
  onApplyRoute,
  language,
}) => {
  const hubs = settlements.filter((s) => s.is_destination);
  const targets = settlements.filter((s) => !s.is_destination);

  const [fromNode, setFromNode] = useState<string>(hubs[0]?.id || 'node_bidur');
  const [toNode, setToNode] = useState<string>(targets[0]?.id || 'node_kalikasthan');
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<any | null>(null);

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const data = await api.calculateRescueRoute(fromNode, toNode);
      setRouteResult(data);
      if (data.route_accessible) {
        onApplyRoute(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#090e1a] border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h2 className="text-base font-bold text-white tracking-wide">
              {language === 'ne' ? 'सुरक्षित उद्धार मार्ग योजनाकार' : 'SAFE RESCUE ROUTE PLANNER'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Dispatch Hub (Origin):
              </label>
              <select
                value={fromNode}
                onChange={(e) => setFromNode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Settlement:
              </label>
              <select
                value={toNode}
                onChange={(e) => setToNode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.connectivity_status || 'STATUS'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={calculateRoute}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>{loading ? 'CALCULATING SAFE TOPOLOGY PATH...' : 'CALCULATE ACCESSIBLE ROUTE'}</span>
          </button>

          {/* Results */}
          {routeResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Routing Status:</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    routeResult.route_accessible
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {routeResult.route_accessible ? 'ACCESSIBLE ROUTE FOUND' : 'GROUND ROUTE BLOCKED (CUT OFF)'}
                </span>
              </div>

              {routeResult.route_accessible ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300 bg-slate-900/60 p-2.5 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-emerald-400" />
                      Total Road Distance:
                    </span>
                    <strong className="text-emerald-300 font-mono text-sm">
                      {routeResult.total_distance_km} km
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 bg-slate-900/60 p-2.5 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Est. Transit Time:
                    </span>
                    <strong className="text-emerald-300 font-mono text-sm">
                      ~{routeResult.estimated_drive_time_mins} mins
                    </strong>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong>Path: </strong>
                    {routeResult.waypoints.join(' → ')}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 text-rose-200">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                      Ground Vehicle Passage Impossible
                    </div>
                    <p className="text-[11px] mt-1 text-slate-300">
                      All mapped pre-event road corridors to this destination intersect flood inundation zones or severed bridges. Rotary wing (airlift) or foot traverse required.
                    </p>
                  </div>

                  {routeResult.blocked_segments_encountered?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">
                        Severed Chokepoints Blocking Route:
                      </div>
                      {routeResult.blocked_segments_encountered.map((seg: any) => (
                        <div key={seg.road_id} className="p-2 rounded bg-slate-900 text-[11px] text-slate-300 border border-slate-800">
                          <strong className="text-rose-400">{seg.name}: </strong>
                          {seg.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
