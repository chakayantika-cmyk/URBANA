import React from 'react';
import {
  LocationState,
  FacilityConnectivityResult,
  NDVIResponse,
  NDBIResponse,
  LSTResponse,
  LULCResponse,
  ChangeDetectionResponse,
  ImpactAssessmentResponse,
  TOPSISResponse
} from '../../types';
import { X, Printer, Download, Share2, Shield, Compass } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationState | null;
  connectivity: FacilityConnectivityResult | null;
  ndvi: NDVIResponse | null;
  ndbi: NDBIResponse | null;
  lst: LSTResponse | null;
  lulc: LULCResponse | null;
  change: ChangeDetectionResponse | null;
  impact: ImpactAssessmentResponse | null;
  topsis: TOPSISResponse | null;
  onOpenShare: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  location,
  connectivity,
  ndvi,
  ndbi,
  lst,
  lulc,
  change,
  impact,
  topsis,
  onOpenShare
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const areaName = location
    ? location.city || location.district || location.address.split(',')[0]
    : 'Study Area';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="bg-white border border-[#E5E5E2] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col font-sans">
        {/* Modal Toolbar */}
        <div className="p-4 border-b border-[#E5E5E2] bg-[#FAF9F7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#8B0000]"></span>
            <span className="text-[12px] font-bold uppercase tracking-widest text-[#111111]">
              URBAN ECOLOGICAL DOSSIER
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-[#E5E5E2] hover:border-[#111111] bg-white text-[#111111] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onOpenShare}
              className="px-3 py-1.5 border border-[#E5E5E2] hover:border-[#111111] bg-white text-[#111111] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Link
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#6F6F6F] hover:text-[#111111] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body (Printable Zara Editorial Layout) */}
        <div className="p-6 md:p-10 overflow-y-auto space-y-8 bg-white print:p-0">
          {/* Header */}
          <div className="border-b border-[#111111] pb-6">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F]">
              URBANA / DECISION SUPPORT SYSTEM / OFFICIAL ASSESSMENT
            </div>
            <h1 className="text-[32px] md:text-[38px] font-bold text-[#111111] tracking-tight mt-2 leading-none uppercase">
              {areaName}
            </h1>
            <p className="text-[14px] text-[#6F6F6F] mt-2 max-w-2xl leading-relaxed">
              {location?.address}
            </p>
            <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-[#111111]">
              <span>LAT/LON: {location?.latitude.toFixed(4)}°, {location?.longitude.toFixed(4)}°</span>
              <span>·</span>
              <span>ACQUISITION: 2026</span>
              <span>·</span>
              <span>ENGINE: Sentinel-2 & pgRouting</span>
            </div>
          </div>

          {/* Section 01: Ecological Indicators */}
          <div className="space-y-3">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#8B0000]">
              01 — EXISTING ENVIRONMENTAL CONDITIONS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 bg-[#FAF9F7] border border-[#E5E5E2]">
                <span className="text-[10px] uppercase text-[#6F6F6F]">Vegetation Index</span>
                <div className="text-[24px] font-bold font-mono text-[#111111] mt-1">{ndvi?.mean_ndvi ?? '--'}</div>
                <span className="text-[10px] text-[#315C45] font-medium">NDVI Mean</span>
              </div>
              <div className="p-4 bg-[#FAF9F7] border border-[#E5E5E2]">
                <span className="text-[10px] uppercase text-[#6F6F6F]">Surface Temp</span>
                <div className="text-[24px] font-bold font-mono text-[#8B0000] mt-1">{lst?.mean_temp_celsius ?? '--'}°C</div>
                <span className="text-[10px] text-[#8B0000] font-medium">UHI Anomaly</span>
              </div>
              <div className="p-4 bg-[#FAF9F7] border border-[#E5E5E2]">
                <span className="text-[10px] uppercase text-[#6F6F6F]">Built Expansion</span>
                <div className="text-[24px] font-bold font-mono text-[#111111] mt-1">+{change?.builtup_expansion_percent ?? '--'}%</div>
                <span className="text-[10px] text-[#6F6F6F]">2019–2026 Flux</span>
              </div>
              <div className="p-4 bg-[#FAF9F7] border border-[#E5E5E2]">
                <span className="text-[10px] uppercase text-[#6F6F6F]">Ecological Score</span>
                <div className="text-[24px] font-bold font-mono text-[#8B0000] mt-1">{impact?.overall_ecological_score ?? '--'}/100</div>
                <span className="text-[10px] font-bold text-[#8B0000]">{impact?.impact_level}</span>
              </div>
            </div>
          </div>

          {/* Section 02: Connectivity Summary */}
          <div className="space-y-3">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#111111]">
              02 — NETWORK ACCESSIBILITY & CONNECTIVITY (MODULE G)
            </h2>
            <div className="border border-[#E5E5E2] divide-y divide-[#E5E5E2]">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8B0000]">+ NEAREST HOSPITAL</span>
                  <div className="text-[14px] font-semibold text-[#111111] mt-0.5">
                    {connectivity?.nearest_hospital?.name || 'No facility recorded'}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[14px] font-bold text-[#111111]">{connectivity?.nearest_hospital?.distance_km} km</div>
                  <div className="text-[11px] text-[#8B0000] font-semibold">{connectivity?.nearest_hospital?.travel_time_min} min ({connectivity?.travel_mode})</div>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#111111]">■ NEAREST SCHOOL</span>
                  <div className="text-[14px] font-semibold text-[#111111] mt-0.5">
                    {connectivity?.nearest_school?.name || 'No institution recorded'}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[14px] font-bold text-[#111111]">{connectivity?.nearest_school?.distance_km} km</div>
                  <div className="text-[11px] text-[#111111] font-semibold">{connectivity?.nearest_school?.travel_time_min} min ({connectivity?.travel_mode})</div>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#6F6F6F]">━ HIGHWAY ACCESS</span>
                  <div className="text-[14px] font-semibold text-[#111111] mt-0.5">
                    {connectivity?.nearest_highway?.name || 'Major Arterial Road'}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[14px] font-bold text-[#111111]">{connectivity?.nearest_highway?.distance_km} km</div>
                  <div className="text-[11px] text-[#6F6F6F] font-semibold">{connectivity?.nearest_highway?.travel_time_min} min ({connectivity?.travel_mode})</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 03: TOPSIS Decision Matrix */}
          <div className="space-y-3">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#111111]">
              03 — MULTI-CRITERIA DECISION ANALYSIS (AHP / TOPSIS)
            </h2>
            <div className="border border-[#E5E5E2] overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#FAF9F7] border-b border-[#E5E5E2] font-mono text-[10px] uppercase text-[#6F6F6F]">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Zone Alternative</th>
                    <th className="p-3">Priority Level</th>
                    <th className="p-3">Closeness Score</th>
                    <th className="p-3">Primary Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E2]">
                  {topsis?.zones.map((z) => (
                    <tr key={z.zone_id} className="hover:bg-[#F7F7F5]">
                      <td className="p-3 font-mono font-bold">0{z.rank}</td>
                      <td className="p-3 font-semibold text-[#111111]">{z.zone_name}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#111111] text-white">
                          {z.priority_level}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#8B0000]">{z.score}</td>
                      <td className="p-3 text-[#6F6F6F] text-[11px]">{z.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 04: Strategic Recommendations */}
          <div className="space-y-3 pt-2">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#315C45]">
              04 — STRATEGIC PLANNING RECOMMENDATIONS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {impact?.strategic_recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-[#FAF9F7] border border-[#E5E5E2] text-[12px] text-[#111111] flex items-start gap-2">
                  <span className="text-[#315C45] font-bold">0{i + 1}</span>
                  <p className="leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-[#E5E5E2] text-center text-[11px] text-[#8E8E88] font-mono">
            Generated autonomously by URBANA Web-GIS DSS · Zero-Cost Free-Tier Deployment Edition
          </div>
        </div>
      </div>
    </div>
  );
};
