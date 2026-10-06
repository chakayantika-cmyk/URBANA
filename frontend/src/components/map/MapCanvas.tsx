import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { LocationState, FacilityRouteSummary, ActiveLayer, BaseMapStyle } from '../../types';

interface MapCanvasProps {
  selectedLocation: LocationState | null;
  activeRoute: FacilityRouteSummary | null;
  activeLayer: ActiveLayer;
  layerData: any | null;
  baseMapStyle: BaseMapStyle;
  onMapClick?: (lat: number, lon: number) => void;
  hospitalFacility?: FacilityRouteSummary | null;
  schoolFacility?: FacilityRouteSummary | null;
  highwayFacility?: FacilityRouteSummary | null;
}

const BASE_STYLES = {
  light: {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    },
    layers: [
      {
        id: 'osm-tiles-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  satellite: {
    version: 8,
    sources: {
      'satellite-tiles': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: '&copy; USGS, Esri, DigitalGlobe, GeoEye, Earthstar Geographics'
      }
    },
    layers: [
      {
        id: 'satellite-tiles-layer',
        type: 'raster',
        source: 'satellite-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  }
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  selectedLocation,
  activeRoute,
  activeLayer,
  layerData,
  baseMapStyle,
  onMapClick,
  hospitalFacility,
  schoolFacility,
  highwayFacility
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hospitalMarkerRef = useRef<maplibregl.Marker | null>(null);
  const schoolMarkerRef = useRef<maplibregl.Marker | null>(null);
  const highwayMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current) return;

    const initialLat = selectedLocation ? selectedLocation.latitude : 12.9716;
    const initialLon = selectedLocation ? selectedLocation.longitude : 77.5946;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASE_STYLES[baseMapStyle] as any,
      center: [initialLon, initialLat],
      zoom: selectedLocation ? 14 : 12,
      attributionControl: false
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('click', (e: any) => {
      if (onMapClick) {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update Base Map Style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(BASE_STYLES[baseMapStyle] as any);
  }, [baseMapStyle]);

  // Handle Location Change & Camera Fly-To
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;

    map.flyTo({
      center: [selectedLocation.longitude, selectedLocation.latitude],
      zoom: 14.5,
      essential: true,
      speed: 1.2,
      curve: 1.1
    });

    // Create / Update User Location Marker (Minimal black circle with pulse)
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center';
    el.innerHTML = `
      <div class="absolute w-8 h-8 rounded-full bg-[#111111]/20 animate-ping"></div>
      <div class="w-5 h-5 rounded-full bg-[#111111] border-2 border-white shadow-md flex items-center justify-center text-[9px] font-bold text-white">
        ●
      </div>
    `;

    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([selectedLocation.longitude, selectedLocation.latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 15 }).setHTML(
          `<div class="text-[12px] font-bold">Selected Location</div><div class="text-[11px] text-[#6F6F6F]">${selectedLocation.address}</div>`
        )
      )
      .addTo(map);

  }, [selectedLocation]);

  // Update Facility Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Hospital Marker
    if (hospitalMarkerRef.current) hospitalMarkerRef.current.remove();
    if (hospitalFacility && hospitalFacility.destination_point) {
      const hEl = document.createElement('div');
      hEl.className = 'w-6 h-6 bg-white border border-[#E5E5E2] shadow-sm flex items-center justify-center font-bold text-[11px] text-[#8B0000] hover:scale-110 transition-transform cursor-pointer';
      hEl.innerHTML = '+';
      hospitalMarkerRef.current = new maplibregl.Marker({ element: hEl })
        .setLngLat([hospitalFacility.destination_point.longitude, hospitalFacility.destination_point.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setHTML(
            `<div class="text-[11px] font-bold text-[#8B0000]">HOSPITAL</div><div class="text-[12px] font-medium">${hospitalFacility.name}</div><div class="text-[10px] text-[#6F6F6F] mt-1">${hospitalFacility.distance_km} km · ${hospitalFacility.travel_time_min} min</div>`
          )
        )
        .addTo(map);
    }

    // School Marker
    if (schoolMarkerRef.current) schoolMarkerRef.current.remove();
    if (schoolFacility && schoolFacility.destination_point) {
      const sEl = document.createElement('div');
      sEl.className = 'w-6 h-6 bg-white border border-[#E5E5E2] shadow-sm flex items-center justify-center font-bold text-[10px] text-[#111111] hover:scale-110 transition-transform cursor-pointer';
      sEl.innerHTML = '■';
      schoolMarkerRef.current = new maplibregl.Marker({ element: sEl })
        .setLngLat([schoolFacility.destination_point.longitude, schoolFacility.destination_point.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setHTML(
            `<div class="text-[11px] font-bold text-[#111111]">SCHOOL</div><div class="text-[12px] font-medium">${schoolFacility.name}</div><div class="text-[10px] text-[#6F6F6F] mt-1">${schoolFacility.distance_km} km · ${schoolFacility.travel_time_min} min</div>`
          )
        )
        .addTo(map);
    }

    // Highway Marker
    if (highwayMarkerRef.current) highwayMarkerRef.current.remove();
    if (highwayFacility && highwayFacility.destination_point) {
      const hwEl = document.createElement('div');
      hwEl.className = 'w-6 h-6 bg-white border border-[#E5E5E2] shadow-sm flex items-center justify-center font-bold text-[9px] text-[#6F6F6F] hover:scale-110 transition-transform cursor-pointer';
      hwEl.innerHTML = '━';
      highwayMarkerRef.current = new maplibregl.Marker({ element: hwEl })
        .setLngLat([highwayFacility.destination_point.longitude, highwayFacility.destination_point.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setHTML(
            `<div class="text-[11px] font-bold text-[#6F6F6F]">HIGHWAY ACCESS</div><div class="text-[12px] font-medium">${highwayFacility.name}</div><div class="text-[10px] text-[#6F6F6F] mt-1">${highwayFacility.distance_km} km · ${highwayFacility.travel_time_min} min</div>`
          )
        )
        .addTo(map);
    }
  }, [hospitalFacility, schoolFacility, highwayFacility]);

  // Update Route Polyline Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = 'active-route-source';
    const layerId = 'active-route-layer';
    const casingId = 'active-route-casing';

    const cleanRouteLayers = () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getLayer(casingId)) map.removeLayer(casingId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };

    if (!activeRoute || !activeRoute.route_geom || !activeRoute.route_geom.coordinates || activeRoute.route_geom.coordinates.length === 0) {
      cleanRouteLayers();
      return;
    }

    cleanRouteLayers();

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: activeRoute.route_geom
      }
    });

    // Dark casing line
    map.addLayer({
      id: casingId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#111111',
        'line-width': 6,
        'line-opacity': 0.8
      }
    });

    // Accent line
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#8B0000',
        'line-width': 4,
        'line-opacity': 1.0
      }
    });

    // Fit map bounds to encompass the entire route
    const coords = activeRoute.route_geom.coordinates;
    const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
    for (const c of coords) {
      bounds.extend(c);
    }
    map.fitBounds(bounds, { padding: 90, maxZoom: 16 });

  }, [activeRoute]);

  // Update Ecological GeoJSON Vector Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = 'eco-grid-source';
    const fillLayerId = 'eco-grid-fill';
    const lineLayerId = 'eco-grid-line';

    const cleanEcoLayers = () => {
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };

    if (activeLayer === 'none' || activeLayer === 'connectivity' || !layerData || !layerData.grid_geojson) {
      cleanEcoLayers();
      return;
    }

    cleanEcoLayers();

    map.addSource(sourceId, {
      type: 'geojson',
      data: layerData.grid_geojson
    });

    map.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.45
      }
    });

    map.addLayer({
      id: lineLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 0.5,
        'line-opacity': 0.4
      }
    });

    // Hover tooltip for grid cells
    map.on('click', fillLayerId, (e: any) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      const props = feat.properties;
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
          `<div class="text-[11px] uppercase tracking-wider font-bold text-[#8B0000]">${props.metric || activeLayer}</div><div class="text-[13px] font-bold text-[#111111] mt-0.5">${props.category || ''}</div><div class="text-[11px] text-[#6F6F6F] font-mono mt-1">Value: ${props.value}</div>`
        )
        .addTo(map);
    });

  }, [activeLayer, layerData]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
