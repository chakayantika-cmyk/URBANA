import React from 'react';
import { UniversalSearch } from './UniversalSearch';
import { LocationState } from '../../types';
import { Share2, Layers, Compass, BarChart3, FileText, CheckCircle2 } from 'lucide-react';

interface TopNavigationProps {
  onSelectLocation: (loc: LocationState) => void;
  selectedLocation: LocationState | null;
  activeMode: 'citizen' | 'analyst';
  setActiveMode: (mode: 'citizen' | 'analyst') => void;
  onOpenReport: () => void;
  onOpenShare: () => void;
  onToggleLayerPanel: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  onSelectLocation,
  selectedLocation,
  activeMode,
  setActiveMode,
  onOpenReport,
  onOpenShare,
  onToggleLayerPanel
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#E5E5E2] z-30 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-[#111111] flex items-center justify-center text-white font-bold text-sm tracking-widest">
          U
        </div>
        <div>
          <h1 className="text-[15px] font-bold tracking-tight text-[#111111] leading-none uppercase">
            URBANA
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-[#6F6F6F] mt-0.5">
            Ecological GIS DSS
          </p>
        </div>
      </div>

      {/* Central Universal Search Bar */}
      <div className="flex-1 max-w-xl mx-2">
        <UniversalSearch
          onSelectLocation={onSelectLocation}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Right Actions & Mode Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mode Switcher */}
        <div className="flex bg-[#F7F7F5] border border-[#E5E5E2] p-0.5">
          <button
            onClick={() => setActiveMode('citizen')}
            className={`px-3 py-1.5 text-[12px] font-semibold tracking-tight transition-all ${
              activeMode === 'citizen'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#6F6F6F] hover:text-[#111111]'
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => setActiveMode('analyst')}
            className={`px-3 py-1.5 text-[12px] font-semibold tracking-tight transition-all ${
              activeMode === 'analyst'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#6F6F6F] hover:text-[#111111]'
            }`}
          >
            Analyst
          </button>
        </div>

        {/* Layer Panel Button */}
        <button
          onClick={onToggleLayerPanel}
          title="Map Layers"
          className="p-2 border border-[#E5E5E2] bg-white hover:bg-[#F7F7F5] text-[#111111] transition-colors"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Report Preview Button */}
        <button
          onClick={onOpenReport}
          title="Generate Dossier Report"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E2] bg-white hover:bg-[#F7F7F5] text-[#111111] text-[12px] font-medium transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-[#8B0000]" />
          <span>Report</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          title="Share Analysis"
          className="p-2 border border-[#E5E5E2] bg-white hover:bg-[#F7F7F5] text-[#111111] transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Live Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-[#E5E5E2] text-[11px] text-[#315C45] font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-[#315C45] animate-pulse"></span>
          <span>LIVE OSM</span>
        </div>
      </div>
    </header>
  );
};
