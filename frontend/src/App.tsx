import React, { useState, useEffect, useCallback } from 'react';
import {
  LocationState,
  FacilityConnectivityResult,
  FacilityRouteSummary,
  NDVIResponse,
  NDBIResponse,
  LSTResponse,
  LULCResponse,
  ChangeDetectionResponse,
  ImpactAssessmentResponse,
  TOPSISResponse,
  TravelMode,
  ActiveLayer,
  BaseMapStyle
} from './types';
import { api } from './services/api';
import { TopNavigation } from './components/navigation/TopNavigation';
import { MapCanvas } from './components/map/MapCanvas';
import { MapControls } from './components/map/MapControls';
import { ConnectivityPanel } from './components/connectivity/ConnectivityPanel';
import { LocationCard } from './components/connectivity/LocationCard';
import { AnalystSidebar } from './components/analytics/AnalystSidebar';
import { ReportModal } from './components/reports/ReportModal';
import { ShareModal } from './components/reports/ShareModal';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function App() {
  // 1. Global Location & View State
  const [selectedLocation, setSelectedLocation] = useState<LocationState | null>(null);
  const [activeMode, setActiveMode] = useState<'citizen' | 'analyst'>('citizen');
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  
  // 2. Map & Layer State
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>('light');
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('none');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isAnalystSidebarOpen, setIsAnalystSidebarOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [activeRoute, setActiveRoute] = useState<FacilityRouteSummary | null>(null);

  // 3. Analytical Data State
  const [connectivityResult, setConnectivityResult] = useState<FacilityConnectivityResult | null>(null);
  const [ndviData, setNdviData] = useState<NDVIResponse | null>(null);
  const [ndbiData, setNdbiData] = useState<NDBIResponse | null>(null);
  const [lstData, setLstData] = useState<LSTResponse | null>(null);
  const [lulcData, setLulcData] = useState<LULCResponse | null>(null);
  const [changeData, setChangeData] = useState<ChangeDetectionResponse | null>(null);
  const [impactData, setImpactData] = useState<ImpactAssessmentResponse | null>(null);
  const [topsisData, setTopsisData] = useState<TOPSISResponse | null>(null);
  const [womenSafetyData, setWomenSafetyData] = useState<any | null>(null);

  // 4. UI & Modal State
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Initialize with a default global location if URL has no token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Load shared connectivity
      setIsLoading(true);
      api.getConnectivityByToken(token)
        .then((res) => {
          setConnectivityResult(res);
          const loc: LocationState = {
            address: res.address_text,
            display_name: res.address_text,
            latitude: res.geocoded_point.latitude,
            longitude: res.geocoded_point.longitude
          };
          setSelectedLocation(loc);
          runAnalystPipeline(loc.latitude, loc.longitude, loc.address);
        })
        .catch(() => {
          setErrorMessage('Shared report token not found.');
        })
        .finally(() => setIsLoading(false));
    } else {
      // Set initial sample location (MG Road, Bengaluru)
      const initial: LocationState = {
        address: 'Mahatma Gandhi Road, Bengaluru, Karnataka, India',
        display_name: 'Mahatma Gandhi Road, Bengaluru, Karnataka, India',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        country: 'India',
        latitude: 12.9755,
        longitude: 77.6068
      };
      setSelectedLocation(initial);
      executeAnalysis(initial, travelMode);
    }
  }, []);

  // Run full multi-modular geospatial pipeline
  const executeAnalysis = useCallback(async (loc: LocationState, mode: TravelMode) => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveRoute(null);

    try {
      // Run Connectivity (Module G)
      const conn = await api.getConnectivity(loc.latitude, loc.longitude, loc.address, mode);
      setConnectivityResult(conn);
      
      // Default to hospital route for immediate visual clarity
      if (conn.nearest_hospital) {
        setActiveRoute(conn.nearest_hospital);
      } else if (conn.nearest_school) {
        setActiveRoute(conn.nearest_school);
      } else if (conn.nearest_highway) {
        setActiveRoute(conn.nearest_highway);
      }

      // Run Ecological & MCDA analytical services
      await runAnalystPipeline(loc.latitude, loc.longitude, loc.city || loc.address);
      setIsAnalyzed(true);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage('Unable to retrieve live road network or facility data for this location.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runAnalystPipeline = async (lat: number, lon: number, name: string) => {
    try {
      const [ndvi, ndbi, lst, lulc, change, impact, topsis, womenSafety] = await Promise.all([
        api.getNDVI(lat, lon, 5.0, name),
        api.getNDBI(lat, lon, 5.0, name),
        api.getLST(lat, lon, 5.0, name),
        api.getLULC(lat, lon, 5.0, name),
        api.getChangeDetection(lat, lon, 5.0, name),
        api.getImpactAssessment(lat, lon, 5.0, name),
        api.getTOPSIS(lat, lon, name),
        api.getWomenSafety(lat, lon, name)
      ]);

      setNdviData(ndvi);
      setNdbiData(ndbi);
      setLstData(lst);
      setLulcData(lulc);
      setChangeData(change);
      setImpactData(impact);
      setTopsisData(topsis);
      setWomenSafetyData(womenSafety);
    } catch (e) {
      console.warn('Analyst sub-pipeline warning:', e);
    }
  };

  // Handle location selection from search
  const handleSelectLocation = (loc: LocationState) => {
    setSelectedLocation(loc);
    setIsAnalyzed(false);
    executeAnalysis(loc, travelMode);
  };

  // Handle map click
  const handleMapClick = async (lat: number, lon: number) => {
    setIsLoading(true);
    try {
      const rev = await api.reverseGeocode(lat, lon);
      const loc: LocationState = {
        address: rev?.display_name || `Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        display_name: rev?.display_name || `Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        latitude: lat,
        longitude: lon,
        city: rev?.city,
        country: rev?.country
      };
      setSelectedLocation(loc);
      executeAnalysis(loc, travelMode);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle travel mode change
  const handleChangeTravelMode = (mode: TravelMode) => {
    setTravelMode(mode);
    if (selectedLocation) {
      executeAnalysis(selectedLocation, mode);
    }
  };

  // Compute active layer data for MapCanvas
  const getActiveLayerData = () => {
    if (activeLayer === 'ndvi') return ndviData;
    if (activeLayer === 'ndbi') return ndbiData;
    if (activeLayer === 'lst') return lstData;
    if (activeLayer === 'lulc') return lulcData;
    if (activeLayer === 'change') return changeData;
    return null;
  };

  const hasLeftPanelContent = activeMode === 'citizen' || (activeMode === 'analyst' && selectedLocation && !isAnalyzed);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F7F7F5] font-sans select-none">
      {/* 1. Top Navigation Bar */}
      <TopNavigation
        onSelectLocation={handleSelectLocation}
        selectedLocation={selectedLocation}
        activeMode={activeMode}
        setActiveMode={(mode) => {
          setActiveMode(mode);
          if (mode === 'analyst') setIsAnalystSidebarOpen(true);
        }}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onToggleLayerPanel={() => setIsLayerMenuOpen((prev) => !prev)}
      />

      {/* 2. Full-Screen MapCanvas (The dominant visual product) */}
      <main className="absolute inset-0 top-16 z-0">
        <MapCanvas
          selectedLocation={selectedLocation}
          activeRoute={activeRoute}
          activeLayer={activeLayer}
          layerData={getActiveLayerData()}
          baseMapStyle={baseMapStyle}
          onMapClick={handleMapClick}
          hospitalFacility={connectivityResult?.nearest_hospital}
          schoolFacility={connectivityResult?.nearest_school}
          highwayFacility={connectivityResult?.nearest_highway}
          isLeftPanelOpen={Boolean(isLeftPanelOpen && hasLeftPanelContent)}
        />
      </main>

      {/* 3. Collapsible Left Panel with Small Edge Toggle Button */}
      {hasLeftPanelContent && (
        <div className="fixed top-20 left-4 md:left-8 z-10 pointer-events-none flex items-start transition-all duration-300">
          {/* Main Panel Box */}
          <div
            className={`transition-all duration-300 origin-left ease-in-out ${
              isLeftPanelOpen
                ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto max-w-md w-full'
                : 'opacity-0 scale-95 -translate-x-full pointer-events-none max-w-0 overflow-hidden'
            }`}
          >
            {activeMode === 'citizen' && (
              <ConnectivityPanel
                selectedLocation={selectedLocation}
                connectivityResult={connectivityResult}
                isLoading={isLoading}
                activeRoute={activeRoute}
                onSelectRoute={(summary) => setActiveRoute(summary)}
                travelMode={travelMode}
                onChangeTravelMode={handleChangeTravelMode}
                onRefresh={() => selectedLocation && executeAnalysis(selectedLocation, travelMode)}
                onOpenReport={() => setIsReportOpen(true)}
                onOpenShare={() => setIsShareOpen(true)}
              />
            )}

            {activeMode === 'analyst' && selectedLocation && !isAnalyzed && (
              <LocationCard
                location={selectedLocation}
                onAnalyze={() => executeAnalysis(selectedLocation, travelMode)}
                isLoading={isLoading}
                isAnalyzed={isAnalyzed}
              />
            )}
          </div>

          {/* Small Toggle Button on Panel Edge */}
          <button
            onClick={() => setIsLeftPanelOpen((prev) => !prev)}
            title={isLeftPanelOpen ? 'Collapse panel' : 'Restore panel'}
            aria-label={isLeftPanelOpen ? 'Collapse panel' : 'Restore panel'}
            className={`pointer-events-auto flex items-center justify-center bg-white border border-[#E5E5E2] hover:border-[#111111] hover:bg-[#F7F7F5] shadow-md transition-all duration-200 text-[#111111] ${
              isLeftPanelOpen
                ? 'ml-2 p-1.5 self-start mt-2'
                : 'fixed top-20 left-4 p-2'
            }`}
          >
            {isLeftPanelOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-1.5 px-1 py-0.5">
                <ChevronRight className="w-4 h-4 text-[#8B0000]" />
                <span className="text-[11px] font-bold uppercase tracking-wider pr-1">Panel</span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* 4. Floating Map Controls (Layers & Basemap Switcher) */}
      <MapControls
        activeLayer={activeLayer}
        onSelectLayer={(l) => {
          setActiveLayer(l);
          setIsLayerMenuOpen(false);
        }}
        baseMapStyle={baseMapStyle}
        onToggleBaseMap={() => setBaseMapStyle((prev) => (prev === 'light' ? 'satellite' : 'light'))}
        isLayerMenuOpen={isLayerMenuOpen}
        onToggleLayerMenu={() => setIsLayerMenuOpen((prev) => !prev)}
      />

      {/* 5. Analyst Mode Collapsible Workspace Sidebar */}
      <AnalystSidebar
        isOpen={isAnalystSidebarOpen && activeMode === 'analyst'}
        onToggle={() => setIsAnalystSidebarOpen((prev) => !prev)}
        selectedLocation={selectedLocation}
        ndviData={ndviData}
        ndbiData={ndbiData}
        lstData={lstData}
        lulcData={lulcData}
        changeData={changeData}
        impactData={impactData}
        topsisData={topsisData}
        womenSafetyData={womenSafetyData}
        activeLayer={activeLayer}
        onSelectLayer={(lyr) => setActiveLayer(lyr)}
        isLoading={isLoading}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* 6. Comprehensive Assessment Dossier Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        location={selectedLocation}
        connectivity={connectivityResult}
        ndvi={ndviData}
        ndbi={ndbiData}
        lst={lstData}
        lulc={lulcData}
        change={changeData}
        impact={impactData}
        topsis={topsisData}
        onOpenShare={() => {
          setIsReportOpen(false);
          setIsShareOpen(true);
        }}
      />

      {/* 7. Public Share Link Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        location={selectedLocation}
        connectivity={connectivityResult}
      />

      {/* 8. Notification / Error Banner */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#7A2424] text-white px-4 py-2.5 shadow-lg flex items-center gap-2 text-[12px] font-medium animate-bounce">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 font-bold underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
