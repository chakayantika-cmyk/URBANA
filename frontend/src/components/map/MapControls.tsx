import React from 'react';
import { ActiveLayer, BaseMapStyle } from '../../types';
import { Layers, Map as MapIcon, Globe, Locate, Plus, Minus } from 'lucide-react';

interface MapControlsProps {
  activeLayer: ActiveLayer;
  onSelectLayer: (layer: ActiveLayer) => void;
  baseMapStyle: BaseMapStyle;
  onToggleBaseMap: () => void;
  isLayerMenuOpen: boolean;
  onToggleLayerMenu: () => void;
  onLocateMe?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  activeLayer,
  onSelectLayer,
  baseMapStyle,
  onToggleBaseMap,
  isLayerMenuOpen,
  onToggleLayerMenu,
  onLocateMe
}) => {
  return (
    <div className="fixed bottom-6 left-6 z-20 flex flex-col items-start gap-2">
      {/* Floating Layer Menu */}
      {isLayerMenuOpen && (
        <div className="bg-white border border-[#E5E5E2] shadow-lg p-3 w-56 space-y-2 mb-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6F6F6F] border-b border-[#E5E5E2] pb-1.5 flex items-center justify-between">
            <span>Map Layers</span>
            <span className="font-mono text-[#8B0000]">Active</span>
          </div>

          <div className="space-y-1 text-[12px]">
            {[
              { id: 'none', label: 'Default Roads & Map' },
              { id: 'ndvi', label: 'NDVI (Vegetation)' },
              { id: 'ndbi', label: 'NDBI (Built-up)' },
              { id: 'lst', label: 'Land Surface Temp (UHI)' },
              { id: 'lulc', label: 'Land Use / Land Cover' },
              { id: 'change', label: 'Change Detection (2019-2026)' },
            ].map((lyr) => (
              <button
                key={lyr.id}
                onClick={() => onSelectLayer(lyr.id as ActiveLayer)}
                className={`w-full text-left px-2 py-1.5 transition-colors flex items-center justify-between ${
                  activeLayer === lyr.id
                    ? 'bg-[#111111] text-white font-medium'
                    : 'text-[#111111] hover:bg-[#F7F7F5]'
                }`}
              >
                <span>{lyr.label}</span>
                {activeLayer === lyr.id && <span className="w-1.5 h-1.5 bg-[#8B0000] rounded-full"></span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Tool Buttons */}
      <div className="flex bg-white border border-[#E5E5E2] shadow-md divide-x divide-[#E5E5E2]">
        <button
          onClick={onToggleLayerMenu}
          title="Toggle Environmental & Urban Layers"
          className={`px-3 py-2 text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
            isLayerMenuOpen ? 'bg-[#111111] text-white' : 'hover:bg-[#F7F7F5] text-[#111111]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Layers</span>
        </button>

        <button
          onClick={onToggleBaseMap}
          title="Switch Basemap Style"
          className="px-3 py-2 text-[12px] font-medium flex items-center gap-1.5 hover:bg-[#F7F7F5] text-[#111111] transition-colors"
        >
          {baseMapStyle === 'light' ? (
            <>
              <Globe className="w-4 h-4 text-[#8B0000]" />
              <span>Satellite</span>
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4 text-[#111111]" />
              <span>Light Map</span>
            </>
          )}
        </button>

        {onLocateMe && (
          <button
            onClick={onLocateMe}
            title="Locate Current Position"
            className="p-2 hover:bg-[#F7F7F5] text-[#111111] transition-colors"
          >
            <Locate className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
