import React, { useState } from 'react';
import { TOPSISResponse, ZoneAssessment } from '../../types';
import { Sliders, Award, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

interface TOPSISRankingProps {
  topsisData: TOPSISResponse | null;
  isLoading: boolean;
  onRecalculate?: (weights: any) => void;
}

export const TOPSISRanking: React.FC<TOPSISRankingProps> = ({
  topsisData,
  isLoading
}) => {
  const [weights, setWeights] = useState({
    vegetation: 30,
    accessibility: 25,
    temperature: 20,
    builtup: 15,
    change: 10
  });

  const handleWeightChange = (key: keyof typeof weights, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  if (isLoading || !topsisData) {
    return <div className="p-4 text-xs text-[#6F6F6F] animate-pulse">Running MCDA (AHP-TOPSIS) ranking matrix...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Criteria Weighting Sliders */}
      <div className="p-3 bg-[#FAF9F7] border border-[#E5E5E2] space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#111111]">
          <span className="flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-[#8B0000]" /> AHP Criteria Weights
          </span>
          <span className="font-mono text-[#6F6F6F]">
            CR: &lt; 0.05 (Consistent)
          </span>
        </div>

        <div className="space-y-2 text-[11px]">
          <div>
            <div className="flex justify-between text-[#6F6F6F]">
              <span>Vegetation Canopy</span>
              <span className="font-mono text-[#111111] font-semibold">{weights.vegetation}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.vegetation}
              onChange={(e) => handleWeightChange('vegetation', Number(e.target.value))}
              className="w-full h-1 bg-[#E5E5E2] accent-[#111111] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[#6F6F6F]">
              <span>Arterial Accessibility</span>
              <span className="font-mono text-[#111111] font-semibold">{weights.accessibility}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.accessibility}
              onChange={(e) => handleWeightChange('accessibility', Number(e.target.value))}
              className="w-full h-1 bg-[#E5E5E2] accent-[#111111] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[#6F6F6F]">
              <span>Thermal Mitigation (LST)</span>
              <span className="font-mono text-[#111111] font-semibold">{weights.temperature}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.temperature}
              onChange={(e) => handleWeightChange('temperature', Number(e.target.value))}
              className="w-full h-1 bg-[#E5E5E2] accent-[#111111] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* TOPSIS Priority Zones Ranking */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
          TOPSIS Relative Closeness Ranking
        </h4>

        <div className="space-y-2">
          {topsisData.zones.map((zone) => {
            const badgeColor =
              zone.priority_level === 'High Priority'
                ? 'bg-[#8B0000] text-white'
                : zone.priority_level === 'Medium Priority'
                ? 'bg-[#111111] text-white'
                : 'bg-[#F7F7F5] border border-[#E5E5E2] text-[#111111]';

            return (
              <div
                key={zone.zone_id}
                className="p-3 bg-white border border-[#E5E5E2] hover:border-[#111111] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#111111] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                      0{zone.rank}
                    </span>
                    <h5 className="text-[13px] font-bold text-[#111111] tracking-tight">
                      {zone.zone_name.split(' - ')[1] || zone.zone_name}
                    </h5>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 ${badgeColor}`}>
                    {zone.priority_level}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono mt-2 pt-2 border-t border-[#F0F0EE] text-[#6F6F6F]">
                  <div>NDVI: <span className="text-[#111111] font-semibold">{zone.ndvi}</span></div>
                  <div>Access: <span className="text-[#111111] font-semibold">{zone.accessibility_score}</span></div>
                  <div>LST: <span className="text-[#111111] font-semibold">{zone.lst_c}°C</span></div>
                  <div>Score: <span className="text-[#8B0000] font-bold">{zone.score}</span></div>
                </div>

                <p className="text-[11px] text-[#6F6F6F] mt-2 leading-relaxed">
                  {zone.recommendation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
