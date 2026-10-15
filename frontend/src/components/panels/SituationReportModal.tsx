import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { SituationReport } from '../../types';
import { X, Printer, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SituationReportModalProps {
  onClose: () => void;
  language: 'en' | 'ne';
}

export const SituationReportModal: React.FC<SituationReportModalProps> = ({
  onClose,
  language: defaultLang,
}) => {
  const [reportLang, setReportLang] = useState<'en' | 'ne'>(defaultLang);
  const [report, setReport] = useState<SituationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getSituationReport(reportLang)
      .then((res) => setReport(res))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [reportLang]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-700 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold text-white tracking-wider">
              RESCUEGRAPH SITUATION REPORT (SITREP)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language switch */}
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setReportLang('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  reportLang === 'en' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setReportLang('ne')}
                className={`px-2 py-1 rounded transition-colors ${
                  reportLang === 'ne' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                नेपाली
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable One-Page Briefing Document */}
        <div className="p-8 overflow-y-auto space-y-6 bg-white text-slate-900 print:p-0 print:m-0 font-sans">
          {loading ? (
            <div className="text-center py-20 text-slate-500">Compiling analytical situation report...</div>
          ) : report ? (
            <>
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-800 font-mono">
                    DISASTER DECISION INTELLIGENCE BRIEFING
                  </div>
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                    {report.title}
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{report.subtitle}</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-600">
                  <div>Classification: <strong>UNCLASSIFIED / PUBLIC RELIEF</strong></div>
                  <div>Issued: {report.generated_at}</div>
                </div>
              </div>

              {/* Event Metadata Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-3.5 rounded-xl border border-slate-300 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Event</span>
                  <div className="font-bold text-slate-900 mt-0.5">{report.event_overview.event_name}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Location</span>
                  <div className="font-bold text-slate-900 mt-0.5">{report.event_overview.location}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Event Date</span>
                  <div className="font-bold text-slate-900 mt-0.5">{report.event_overview.event_date}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Sensor Inputs</span>
                  <div className="font-bold text-slate-900 mt-0.5 text-[11px]">{report.event_overview.sensor_inputs}</div>
                </div>
              </div>

              {/* Analytical Figures Grid */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  1. Analytical Impact Metrics (Verified Backend Derived)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-500">TOTAL FLOOD AREA</span>
                    <div className="text-xl font-black text-cyan-800 mt-0.5 font-mono">
                      {report.key_metrics.total_flood_area_sq_km} km²
                    </div>
                    <span className="text-[10px] text-slate-600">Water: {report.key_metrics.water_extent_sq_km} | Debris: {report.key_metrics.debris_silt_sq_km}</span>
                  </div>

                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-500">DAMAGED ROADS</span>
                    <div className="text-xl font-black text-amber-800 mt-0.5 font-mono">
                      {report.key_metrics.damaged_roads_count} segments
                    </div>
                    <span className="text-[10px] text-slate-600">Pre-event OSM overlay</span>
                  </div>

                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-500">DAMAGED BRIDGES</span>
                    <div className="text-xl font-black text-rose-800 mt-0.5 font-mono">
                      {report.key_metrics.damaged_bridges_count} bridges
                    </div>
                    <span className="text-[10px] text-slate-600">B2, B4, B5 gorge spans</span>
                  </div>

                  <div className="border border-slate-300 rounded-lg p-3 bg-rose-50 border-rose-300">
                    <span className="text-[10px] font-bold text-rose-700">CUT-OFF SETTLEMENTS</span>
                    <div className="text-xl font-black text-rose-900 mt-0.5 font-mono">
                      {report.key_metrics.cut_off_settlements_count} communities
                    </div>
                    <span className="text-[10px] font-bold text-rose-800">{report.key_metrics.isolated_population_est.toLocaleString()} residents cut off</span>
                  </div>
                </div>
              </div>

              {/* Cut-Off Communities Detail */}
              <div className="border border-rose-200 bg-rose-50/60 rounded-xl p-4 text-xs space-y-2">
                <h3 className="font-bold text-rose-900 text-sm">
                  {report.cut_off_communities.status_headline}
                </h3>
                <div className="text-slate-800 font-semibold">
                  <strong>Isolated Settlements: </strong>
                  {report.cut_off_communities.settlements.join(', ')}
                </div>
                <div className="text-slate-700 text-[11px] pt-1 border-t border-rose-200">
                  <strong>Critical Severed Chokepoints: </strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {report.cut_off_communities.critical_severed_chokepoints.map((cp, idx) => (
                      <li key={idx}>{cp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  2. Operational Rescue Recommendations
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {report.rescue_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-cyan-800 shrink-0">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  3. Scientific Limitations & Data Caveats
                </h3>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                  {report.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>

              {/* MANDATORY CHALLENGE ATTRIBUTIONS */}
              <div className="border-t-2 border-slate-300 pt-3 text-[10px] text-slate-500 space-y-1 font-mono">
                <div className="font-bold text-slate-700 uppercase">Mandatory Attributions & Copyright:</div>
                {report.attributions.map((att, idx) => (
                  <div key={idx}>{att}</div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
