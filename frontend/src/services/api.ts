import {
  GeocodeResult,
  FacilityConnectivityResult,
  NDVIResponse,
  NDBIResponse,
  LSTResponse,
  LULCResponse,
  ChangeDetectionResponse,
  ImpactAssessmentResponse,
  TOPSISResponse,
  ReportSummary,
  TravelMode
} from '../types';

const API_BASE = '/api';

export const api = {
  // Geocoding
  async searchAddress(query: string, limit = 5): Promise<GeocodeResult[]> {
    if (!query.trim()) return [];
    const res = await fetch(`${API_BASE}/geocode/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) throw new Error('Geocoding request failed');
    return res.json();
  },

  async reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
    const res = await fetch(`${API_BASE}/geocode/reverse?lat=${lat}&lon=${lon}`);
    if (!res.ok) return null;
    return res.json();
  },

  // Module G Connectivity
  async getConnectivity(
    lat: number,
    lon: number,
    address = '',
    travelMode: TravelMode = 'driving',
    forceRefresh = false
  ): Promise<FacilityConnectivityResult> {
    const res = await fetch(`${API_BASE}/connectivity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: lat,
        longitude: lon,
        address,
        travel_mode: travelMode,
        force_refresh: forceRefresh
      })
    });
    if (!res.ok) throw new Error('Failed to compute connectivity');
    return res.json();
  },

  async getConnectivityByToken(token: string): Promise<FacilityConnectivityResult> {
    const res = await fetch(`${API_BASE}/connectivity/${token}`);
    if (!res.ok) throw new Error('Shared connectivity not found');
    return res.json();
  },

  // Ecological Analysis
  async getNDVI(lat: number, lon: number, radiusKm = 5.0, name = 'Study Area'): Promise<NDVIResponse> {
    const res = await fetch(`${API_BASE}/analysis/ndvi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        center: { latitude: lat, longitude: lon },
        radius_km: radiusKm,
        location_name: name
      })
    });
    return res.json();
  },

  async getNDBI(lat: number, lon: number, radiusKm = 5.0, name = 'Study Area'): Promise<NDBIResponse> {
    const res = await fetch(`${API_BASE}/analysis/ndbi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        center: { latitude: lat, longitude: lon },
        radius_km: radiusKm,
        location_name: name
      })
    });
    return res.json();
  },

  async getLST(lat: number, lon: number, radiusKm = 5.0, name = 'Study Area'): Promise<LSTResponse> {
    const res = await fetch(`${API_BASE}/analysis/lst`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        center: { latitude: lat, longitude: lon },
        radius_km: radiusKm,
        location_name: name
      })
    });
    return res.json();
  },

  async getLULC(lat: number, lon: number, radiusKm = 5.0, name = 'Study Area'): Promise<LULCResponse> {
    const res = await fetch(`${API_BASE}/analysis/lulc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        center: { latitude: lat, longitude: lon },
        radius_km: radiusKm,
        location_name: name
      })
    });
    return res.json();
  },

  async getChangeDetection(lat: number, lon: number, radiusKm = 5.0, name = 'Study Area'): Promise<ChangeDetectionResponse> {
    const res = await fetch(`${API_BASE}/analysis/change-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        center: { latitude: lat, longitude: lon },
        radius_km: radiusKm,
        location_name: name
      })
    });
    return res.json();
  },

  async getImpactAssessment(lat: number, lon: number, radiusKm = 5.0, name = 'Study Area'): Promise<ImpactAssessmentResponse> {
    const res = await fetch(`${API_BASE}/analysis/impact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        center: { latitude: lat, longitude: lon },
        radius_km: radiusKm,
        location_name: name
      })
    });
    return res.json();
  },

  async getTOPSIS(lat: number, lon: number, name = 'Study Area'): Promise<TOPSISResponse> {
    const res = await fetch(`${API_BASE}/analysis/topsis?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(name)}`, {
      method: 'POST'
    });
    return res.json();
  },

  async generateReport(lat: number, lon: number, address = '', name = 'Study Area'): Promise<ReportSummary> {
    const res = await fetch(
      `${API_BASE}/reports?lat=${lat}&lon=${lon}&address=${encodeURIComponent(address)}&location_name=${encodeURIComponent(name)}`,
      { method: 'POST' }
    );
    return res.json();
  },

  async getReportByToken(token: string): Promise<ReportSummary> {
    const res = await fetch(`${API_BASE}/share/${token}`);
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  }
};
