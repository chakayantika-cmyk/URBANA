import React from 'react';
import { LocationState } from '../../types';
import { MapPin, Navigation, ArrowRight, Loader2 } from 'lucide-react';

interface LocationCardProps {
  location: LocationState;
  onAnalyze: () => void;
  isLoading: boolean;
  isAnalyzed: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onAnalyze,
  isLoading,
  isAnalyzed
}) => {
  return (
    <div className="bg-white border border-[#E5E5E2] shadow-md p-4 w-full max-w-md font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#8B0000]" /> SELECTED LOCATION
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F7F7F5] border border-[#E5E5E2] text-[#111111]">
          {location.country || 'Global'}
        </span>
      </div>

      <h3 className="text-[15px] font-bold text-[#111111] mt-1 tracking-tight leading-snug">
        {location.city || location.district || location.address.split(',')[0]}
      </h3>

      <p className="text-[12px] text-[#6F6F6F] mt-1 leading-relaxed line-clamp-2">
        {location.address}
      </p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E5E2]">
        <div className="text-[10px] font-mono text-[#8E8E88]">
          {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
        </div>

        {!isAnalyzed ? (
          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className="px-4 py-1.5 bg-[#111111] hover:bg-black text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#8B0000]" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyse this location</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-[#315C45] flex items-center gap-1">
            ✓ Analysis Active
          </span>
        )}
      </div>
    </div>
  );
};
