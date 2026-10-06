import React from 'react';
import {
  LocationState,
  FacilityConnectivityResult,
  FacilityRouteSummary,
  TravelMode
} from '../../types';
import {
  Navigation,
  Share2,
  FileText,
  Clock,
  Compass,
  ArrowRight,
  Footprints,
  Car,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ConnectivityPanelProps {
  selectedLocation: LocationState | null;
  connectivityResult: FacilityConnectivityResult | null;
  isLoading: boolean;
  activeRoute: FacilityRouteSummary | null;
  onSelectRoute: (summary: FacilityRouteSummary | null) => void;
  travelMode: TravelMode;
  onChangeTravelMode: (mode: TravelMode) => void;
  onRefresh: () => void;
  onOpenReport: () => void;
  onOpenShare: () => void;
}

export const ConnectivityPanel: React.FC<ConnectivityPanelProps> = ({
  selectedLocation,
  connectivityResult,
  isLoading,
  activeRoute,
  onSelectRoute,
  travelMode,
  onChangeTravelMode,
  onRefresh,
  onOpenReport,
  onOpenShare
}) => {
  if (!selectedLocation) {
    return (
      <div className="bg-white border border-[#E5E5E2] shadow-sm p-6 w-full max-w-md">
        <h2 className="text-[20px] font-bold tracking-tight text-[#111111]">
          HOW CONNECTED IS YOUR LOCATION?
        </h2>
        <p className="text-[13px] text-[#6F6F6F] mt-2 leading-relaxed">
          Search any address or place in the search bar above to calculate real road-network distances, travel times, and reachable hospitals, schools, and highway access points.
        </p>
      </div>
    );
  }

  const hosp = connectivityResult?.nearest_hospital;
  const school = connectivityResult?.nearest_school;
  const hw = connectivityResult?.nearest_highway;

  return (
    <div className="bg-white border border-[#E5E5E2] shadow-lg p-5 w-full max-w-md max-h-[85vh] overflow-y-auto font-sans">
      {/* Location Header */}
      <div className="border-b border-[#E5E5E2] pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B0000]">
            YOUR LOCATION
          </span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh network calculation"
            className="text-[#6F6F6F] hover:text-[#111111] p-1 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#8B0000]' : ''}`} />
          </button>
        </div>

        <h3 className="text-[16px] font-bold text-[#111111] mt-1 tracking-tight leading-snug">
          {selectedLocation.city || selectedLocation.district || selectedLocation.address.split(',')[0]}
        </h3>
        <p className="text-[12px] text-[#6F6F6F] mt-1 leading-relaxed truncate">
          {selectedLocation.address}
        </p>

        <div className="flex items-center gap-2 mt-2">
          {selectedLocation.country && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#F7F7F5] border border-[#E5E5E2] text-[#111111]">
              {selectedLocation.country}
            </span>
          )}
          <span className="text-[10px] font-mono text-[#8E8E88]">
            {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
          </span>
        </div>
      </div>

      {/* Travel Mode Selector */}
      <div className="py-3 border-b border-[#E5E5E2] flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
          TRAVEL MODE
        </span>
        <div className="flex bg-[#F7F7F5] border border-[#E5E5E2] p-0.5">
          <button
            onClick={() => onChangeTravelMode('walking')}
            className={`flex items-center gap-1 px-3 py-1 text-[11px] font-medium transition-all ${
              travelMode === 'walking'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#6F6F6F] hover:text-[#111111]'
            }`}
          >
            <Footprints className="w-3 h-3" />
            Walking
          </button>
          <button
            onClick={() => onChangeTravelMode('driving')}
            className={`flex items-center gap-1 px-3 py-1 text-[11px] font-medium transition-all ${
              travelMode === 'driving'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#6F6F6F] hover:text-[#111111]'
            }`}
          >
            <Car className="w-3 h-3" />
            Driving
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="py-8 space-y-4">
          <div className="h-16 bg-[#F7F7F5] animate-pulse"></div>
          <div className="h-16 bg-[#F7F7F5] animate-pulse"></div>
          <div className="h-16 bg-[#F7F7F5] animate-pulse"></div>
        </div>
      ) : (
        <div className="divide-y divide-[#E5E5E2]">
          {/* Nearest Hospital Card */}
          <div className="py-3.5 group">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold uppercase tracking-wider text-[#8B0000] flex items-center gap-1">
                <span>+</span> NEAREST HOSPITAL
              </span>
              {hosp && (
                <div className="flex items-center gap-2 font-mono font-medium text-[#111111]">
                  <span>{hosp.distance_km} km</span>
                  <span className="text-[#8E8E88]">·</span>
                  <span className="text-[#8B0000] font-bold">{hosp.travel_time_min} min</span>
                </div>
              )}
            </div>

            <p className="text-[14px] font-semibold text-[#111111] mt-1 tracking-tight">
              {hosp ? hosp.name : 'No hospital found in immediate radius'}
            </p>

            {hosp && (
              <button
                onClick={() => onSelectRoute(activeRoute?.facility_id === hosp.facility_id ? null : hosp)}
                className={`mt-2 text-[12px] font-medium px-3 py-1 border transition-all flex items-center gap-1.5 ${
                  activeRoute?.facility_id === hosp.facility_id
                    ? 'bg-[#8B0000] text-white border-[#8B0000]'
                    : 'bg-white border-[#E5E5E2] text-[#111111] hover:border-[#111111]'
                }`}
              >
                <Navigation className="w-3 h-3" />
                {activeRoute?.facility_id === hosp.facility_id ? 'Hide route' : 'Show route'}
              </button>
            )}
          </div>

          {/* Nearest School Card */}
          <div className="py-3.5 group">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1">
                <span>■</span> NEAREST SCHOOL
              </span>
              {school && (
                <div className="flex items-center gap-2 font-mono font-medium text-[#111111]">
                  <span>{school.distance_km} km</span>
                  <span className="text-[#8E8E88]">·</span>
                  <span className="text-[#111111] font-bold">{school.travel_time_min} min</span>
                </div>
              )}
            </div>

            <p className="text-[14px] font-semibold text-[#111111] mt-1 tracking-tight">
              {school ? school.name : 'No school found in immediate radius'}
            </p>

            {school && (
              <button
                onClick={() => onSelectRoute(activeRoute?.facility_id === school.facility_id ? null : school)}
                className={`mt-2 text-[12px] font-medium px-3 py-1 border transition-all flex items-center gap-1.5 ${
                  activeRoute?.facility_id === school.facility_id
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white border-[#E5E5E2] text-[#111111] hover:border-[#111111]'
                }`}
              >
                <Navigation className="w-3 h-3" />
                {activeRoute?.facility_id === school.facility_id ? 'Hide route' : 'Show route'}
              </button>
            )}
          </div>

          {/* Highway Access Card */}
          <div className="py-3.5 group">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold uppercase tracking-wider text-[#6F6F6F] flex items-center gap-1">
                <span>━</span> HIGHWAY ACCESS
              </span>
              {hw && (
                <div className="flex items-center gap-2 font-mono font-medium text-[#111111]">
                  <span>{hw.distance_km} km</span>
                  <span className="text-[#8E8E88]">·</span>
                  <span className="text-[#6F6F6F] font-bold">{hw.travel_time_min} min</span>
                </div>
              )}
            </div>

            <p className="text-[14px] font-semibold text-[#111111] mt-1 tracking-tight">
              {hw ? hw.name : 'No major arterial highway found nearby'}
            </p>

            {hw && (
              <button
                onClick={() => onSelectRoute(activeRoute?.facility_id === hw.facility_id ? null : hw)}
                className={`mt-2 text-[12px] font-medium px-3 py-1 border transition-all flex items-center gap-1.5 ${
                  activeRoute?.facility_id === hw.facility_id
                    ? 'bg-[#6F6F6F] text-white border-[#6F6F6F]'
                    : 'bg-white border-[#E5E5E2] text-[#111111] hover:border-[#111111]'
                }`}
              >
                <Navigation className="w-3 h-3" />
                {activeRoute?.facility_id === hw.facility_id ? 'Hide route' : 'Show route'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 mt-2 border-t border-[#E5E5E2] flex items-center gap-2">
        <button
          onClick={onOpenShare}
          className="flex-1 py-2 px-3 border border-[#E5E5E2] hover:border-[#111111] text-[#111111] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share result
        </button>
        <button
          onClick={onOpenReport}
          className="flex-1 py-2 px-3 bg-[#111111] hover:bg-black text-white text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Full report
        </button>
      </div>
    </div>
  );
};
