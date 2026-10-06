import React, { useState } from 'react';
import { ChangeDetectionResponse } from '../../types';
import { ArrowLeftRight, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface ChangeDetectionSliderProps {
  changeData: ChangeDetectionResponse | null;
  isLoading: boolean;
}

export const ChangeDetectionSlider: React.FC<ChangeDetectionSliderProps> = ({
  changeData,
  isLoading
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  if (isLoading || !changeData) {
    return <div className="p-4 text-xs text-[#6F6F6F] animate-pulse">Calculating temporal land cover shifts...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Before / After Slider Interaction */}
      <div className="relative bg-[#FAF9F7] border border-[#E5E5E2] p-4 text-center">
        <div className="flex justify-between text-[11px] font-mono uppercase text-[#6F6F6F] mb-1">
          <span className="font-bold text-[#111111]">2019 (Baseline)</span>
          <span className="font-bold text-[#8B0000]">2026 (Current)</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="w-full h-1.5 bg-[#E5E5E2] rounded-lg appearance-none cursor-pointer accent-[#111111]"
        />

        <p className="text-[10px] text-[#6F6F6F] mt-2 italic">
          Slider splits overlay view between historical satellite baseline and current urban footprint.
        </p>
      </div>

      {/* Metrics Breakdown */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E2]">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#8B0000]">
            <TrendingUp className="w-3 h-3" /> Built-up Growth
          </div>
          <div className="text-[18px] font-bold text-[#111111] mt-1 font-mono">
            +{changeData.builtup_expansion_percent}%
          </div>
          <div className="text-[10px] text-[#6F6F6F]">
            {changeData.total_converted_sqkm} km² expanded
          </div>
        </div>

        <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E2]">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#315C45]">
            <TrendingDown className="w-3 h-3" /> Canopy Reduction
          </div>
          <div className="text-[18px] font-bold text-[#111111] mt-1 font-mono">
            -{changeData.vegetation_loss_percent}%
          </div>
          <div className="text-[10px] text-[#6F6F6F]">
            Green buffer loss
          </div>
        </div>
      </div>

      {/* Transition Matrix */}
      <div className="border border-[#E5E5E2] p-3 bg-white">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-2">
          Land Transition Flux (km²)
        </h4>
        <div className="space-y-1.5 text-[11px]">
          {Object.entries(changeData.change_matrix).map(([flux, val], idx) => (
            <div key={idx} className="flex justify-between items-center text-[#111111]">
              <span className="text-[#6F6F6F] truncate max-w-[200px]">{flux}</span>
              <span className="font-mono font-semibold">{val} km²</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
