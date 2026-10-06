import React, { useState } from 'react';
import {
  LocationState,
  NDVIResponse,
  NDBIResponse,
  LSTResponse,
  LULCResponse,
  ChangeDetectionResponse,
  ImpactAssessmentResponse,
  TOPSISResponse,
  ActiveLayer
} from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
  Sun,
  TreePine,
  Building2,
  GitCompare,
  Sliders,
  FileCheck,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ChangeDetectionSlider } from './ChangeDetectionSlider';
import { TOPSISRanking } from './TOPSISRanking';

interface AnalystSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedLocation: LocationState | null;
  ndviData: NDVIResponse | null;
  ndbiData: NDBIResponse | null;
  lstData: LSTResponse | null;
  lulcData: LULCResponse | null;
  changeData: ChangeDetectionResponse | null;
  impactData: ImpactAssessmentResponse | null;
  topsisData: TOPSISResponse | null;
  activeLayer: ActiveLayer;
  onSelectLayer: (layer: ActiveLayer) => void;
  isLoading: boolean;
  onOpenReport: () => void;
}

type AnalystTab = 'overview' | 'lulc' | 'ndvi' | 'uhi' | 'change' | 'mcda' | 'impact';

export const AnalystSidebar: React.FC<AnalystSidebarProps> = ({
  isOpen,
  onToggle,
  selectedLocation,
  ndviData,
  ndbiData,
  lstData,
  lulcData,
  changeData,
  impactData,
  topsisData,
  activeLayer,
  onSelectLayer,
  isLoading,
  onOpenReport
}) => {
  const [activeTab, setActiveTab] = useState<AnalystTab>('overview');

  const locationTitle = selectedLocation
    ? selectedLocation.city || selectedLocation.district || selectedLocation.address.split(',')[0]
    : 'No study area selected';

  const handleTabChange = (tab: AnalystTab) => {
    setActiveTab(tab);
    // Automatically bind the corresponding map layer
    if (tab === 'lulc') onSelectLayer('lulc');
    else if (tab === 'ndvi') onSelectLayer('ndvi');
    else if (tab === 'uhi') onSelectLayer('lst');
    else if (tab === 'change') onSelectLayer('change');
    else if (tab === 'overview') onSelectLayer('none');
  };

  return (
    <>
      {/* Sidebar Collapse Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-20 z-20 bg-white border border-[#E5E5E2] p-2 shadow-md hover:bg-[#F7F7F5] transition-all ${
          isOpen ? 'right-[420px]' : 'right-4'
        }`}
        title={isOpen ? 'Collapse sidebar' : 'Open analyst workspace'}
      >
        {isOpen ? <ChevronRight className="w-4 h-4 text-[#111111]" /> : <ChevronLeft className="w-4 h-4 text-[#111111]" />}
      </button>

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed top-16 right-0 bottom-0 w-[420px] bg-white border-l border-[#E5E5E2] z-20 shadow-xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Workspace Header */}
        <div className="p-4 border-b border-[#E5E5E2] bg-[#FAF9F7]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F]">
              ANALYST WORKSPACE
            </span>
            <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 border border-[#E5E5E2] text-[#111111]">
              Sentinel-2 / PostGIS
            </span>
          </div>
          <h2 className="text-[16px] font-bold text-[#111111] mt-1 truncate">
            {locationTitle}
          </h2>
          <p className="text-[11px] text-[#6F6F6F] truncate mt-0.5">
            {selectedLocation?.address || 'Search an address to initiate spatial intelligence.'}
          </p>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-[#E5E5E2] bg-[#F7F7F5] overflow-x-auto text-[11px] font-medium divide-x divide-[#E5E5E2]">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'lulc', label: 'LULC' },
            { id: 'ndvi', label: 'NDVI' },
            { id: 'uhi', label: 'UHI / LST' },
            { id: 'change', label: 'Change' },
            { id: 'mcda', label: 'AHP/TOPSIS' },
            { id: 'impact', label: 'Impact' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id as AnalystTab)}
              className={`px-3 py-2 shrink-0 transition-colors uppercase tracking-tight ${
                activeTab === t.id
                  ? 'bg-white text-[#111111] font-bold border-b-2 border-[#8B0000]'
                  : 'text-[#6F6F6F] hover:text-[#111111]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-[12px] text-[#6F6F6F] animate-pulse">
              Processing remote sensing rasters & decision matrices...
            </div>
          ) : !selectedLocation ? (
            <div className="py-12 text-center text-[12px] text-[#6F6F6F]">
              Please search or click any location on the map to run spatial analysis.
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Key Indicators Grid */}
                  <div className="border border-[#E5E5E2] p-4 bg-[#FAF9F7]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6F6F]">
                      STUDY AREA METRICS · 78.5 km²
                    </span>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-white border border-[#E5E5E2]">
                        <span className="text-[10px] text-[#6F6F6F] uppercase">Mean NDVI</span>
                        <div className="text-[20px] font-bold text-[#111111] font-mono mt-0.5">
                          {ndviData?.mean_ndvi ?? '--'}
                        </div>
                        <span className="text-[10px] text-[#315C45] font-medium">Vegetation Canopy</span>
                      </div>

                      <div className="p-3 bg-white border border-[#E5E5E2]">
                        <span className="text-[10px] text-[#6F6F6F] uppercase">Surface Temp</span>
                        <div className="text-[20px] font-bold text-[#8B0000] font-mono mt-0.5">
                          {lstData?.mean_temp_celsius ?? '--'}°C
                        </div>
                        <span className="text-[10px] text-[#8B0000] font-medium">UHI +{lstData?.uhi_intensity_celsius}°C</span>
                      </div>

                      <div className="p-3 bg-white border border-[#E5E5E2]">
                        <span className="text-[10px] text-[#6F6F6F] uppercase">Built Expansion</span>
                        <div className="text-[20px] font-bold text-[#111111] font-mono mt-0.5">
                          +{changeData?.builtup_expansion_percent ?? '--'}%
                        </div>
                        <span className="text-[10px] text-[#6F6F6F]">Since 2019</span>
                      </div>

                      <div className="p-3 bg-white border border-[#E5E5E2]">
                        <span className="text-[10px] text-[#6F6F6F] uppercase">Impact Index</span>
                        <div className="text-[20px] font-bold text-[#8B0000] font-mono mt-0.5">
                          {impactData?.overall_ecological_score ?? '--'}/100
                        </div>
                        <span className="text-[10px] text-[#8B0000] font-bold">{impactData?.impact_level}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Assessment */}
                  <div className="p-4 bg-white border border-[#E5E5E2]">
                    <h4 className="text-[12px] font-bold uppercase tracking-tight text-[#111111] mb-2">
                      Ecological Status Summary
                    </h4>
                    <p className="text-[12px] text-[#6F6F6F] leading-relaxed">
                      {impactData?.key_vulnerabilities[0] || 'Rapid urban infill has increased localized surface temperature and decreased canopy continuity.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: LULC */}
              {activeTab === 'lulc' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold uppercase text-[#111111]">Land Use / Land Cover 2026</span>
                    <span className="font-mono text-[#6F6F6F]">Kappa: 0.89</span>
                  </div>

                  <div className="space-y-2">
                    {lulcData?.classes.map((cls, idx) => (
                      <div key={idx} className="p-3 bg-[#FAF9F7] border border-[#E5E5E2]">
                        <div className="flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 border border-black/20" style={{ backgroundColor: cls.color_hex }}></span>
                            <span className="font-semibold text-[#111111]">{cls.class_name}</span>
                          </div>
                          <span className="font-mono font-bold text-[#111111]">{cls.area_percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E5E5E2] mt-2">
                          <div className="h-full" style={{ width: `${cls.area_percent}%`, backgroundColor: cls.color_hex }}></div>
                        </div>
                        <div className="text-[10px] text-[#6F6F6F] font-mono mt-1">
                          {cls.area_sqkm} km² coverage
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: NDVI */}
              {activeTab === 'ndvi' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#FAF9F7] border border-[#E5E5E2]">
                    <div className="text-[10px] uppercase font-bold text-[#315C45]">Mean Vegetation Index</div>
                    <div className="text-[28px] font-bold text-[#111111] font-mono mt-1">
                      {ndviData?.mean_ndvi}
                    </div>
                    <p className="text-[12px] text-[#6F6F6F] mt-2 leading-relaxed">
                      {ndviData?.summary.interpretation}
                    </p>
                  </div>

                  <div className="space-y-2 text-[12px]">
                    <div className="p-2.5 bg-white border border-[#E5E5E2] flex justify-between">
                      <span className="text-[#315C45] font-semibold">Dense Canopy (&gt;0.45)</span>
                      <span className="font-mono">{ndviData?.high_veg_percent}%</span>
                    </div>
                    <div className="p-2.5 bg-white border border-[#E5E5E2] flex justify-between">
                      <span className="text-[#111111] font-semibold">Moderate Green (0.25–0.45)</span>
                      <span className="font-mono">{ndviData?.moderate_veg_percent}%</span>
                    </div>
                    <div className="p-2.5 bg-white border border-[#E5E5E2] flex justify-between">
                      <span className="text-[#8B0000] font-semibold">Sparse / Built (&lt;0.25)</span>
                      <span className="font-mono">{ndviData?.low_veg_percent}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: UHI / LST */}
              {activeTab === 'uhi' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#FAF9F7] border border-[#E5E5E2]">
                    <div className="text-[10px] uppercase font-bold text-[#8B0000]">Surface Thermal Anomaly</div>
                    <div className="text-[28px] font-bold text-[#8B0000] font-mono mt-1">
                      {lstData?.mean_temp_celsius}°C
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#8B0000] text-white font-bold">
                        UHI Severity: {lstData?.uhi_severity}
                      </span>
                      <span className="text-[11px] text-[#6F6F6F]">+{lstData?.uhi_intensity_celsius}°C Peak</span>
                    </div>
                  </div>

                  <p className="text-[12px] text-[#6F6F6F] leading-relaxed">
                    {lstData?.summary.interpretation}
                  </p>
                </div>
              )}

              {/* TAB 5: CHANGE DETECTION */}
              {activeTab === 'change' && (
                <ChangeDetectionSlider changeData={changeData} isLoading={isLoading} />
              )}

              {/* TAB 6: AHP / TOPSIS */}
              {activeTab === 'mcda' && (
                <TOPSISRanking topsisData={topsisData} isLoading={isLoading} />
              )}

              {/* TAB 7: IMPACT ASSESSMENT */}
              {activeTab === 'impact' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#FAF9F7] border border-[#E5E5E2]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-[#8B0000]">ECOLOGICAL IMPACT SCORE</span>
                      <span className="text-[10px] font-mono bg-[#8B0000] text-white px-2 py-0.5 font-bold">
                        {impactData?.impact_level}
                      </span>
                    </div>
                    <div className="text-[32px] font-bold text-[#111111] font-mono mt-1">
                      {impactData?.overall_ecological_score}<span className="text-[16px] text-[#6F6F6F]">/100</span>
                    </div>
                  </div>

                  {/* Vulnerabilities */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                      Identified Vulnerabilities
                    </h4>
                    {impactData?.key_vulnerabilities.map((v, i) => (
                      <div key={i} className="p-2.5 bg-white border border-[#E5E5E2] text-[11px] text-[#6F6F6F] flex items-start gap-2">
                        <span className="text-[#8B0000] font-bold">!</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                      Strategic Interventions
                    </h4>
                    {impactData?.strategic_recommendations.map((r, i) => (
                      <div key={i} className="p-2.5 bg-white border border-[#E5E5E2] text-[11px] text-[#111111] flex items-start gap-2">
                        <span className="text-[#315C45] font-bold">✓</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E5E5E2] bg-white">
          <button
            onClick={onOpenReport}
            className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-[12px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#8B0000]" />
            Generate Full Assessment Dossier
          </button>
        </div>
      </aside>
    </>
  );
};
