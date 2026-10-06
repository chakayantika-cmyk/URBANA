export type TravelMode = 'driving' | 'walking';

export interface GeocodeResult {
  place_id?: string;
  address: string;
  display_name: string;
  latitude: number;
  longitude: number;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  bounding_box?: [number, number, number, number];
  importance?: number;
  osm_type?: string;
}

export interface LocationState {
  address: string;
  display_name: string;
  latitude: number;
  longitude: number;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  bounding_box?: [number, number, number, number];
}

export interface FacilityRouteSummary {
  facility_id: string;
  name: string;
  facility_type: 'hospital' | 'school' | 'highway';
  distance_km: number;
  travel_time_min: number;
  route_geom: any; // GeoJSON LineString
  destination_point: {
    latitude: number;
    longitude: number;
  };
}

export interface FacilityConnectivityResult {
  connectivity_id: string;
  address_text: string;
  geocoded_point: {
    latitude: number;
    longitude: number;
  };
  travel_mode: TravelMode;
  nearest_hospital?: FacilityRouteSummary | null;
  nearest_school?: FacilityRouteSummary | null;
  nearest_highway?: FacilityRouteSummary | null;
  query_timestamp: string;
  shareable_link_token: string;
  is_live_network: boolean;
  is_demo_mode: boolean;
  message?: string;
}

export interface MetricSummary {
  name: string;
  mean_value: number;
  min_value: number;
  max_value: number;
  unit: string;
  interpretation: string;
  status: 'healthy' | 'moderate' | 'degraded' | 'critical' | 'neutral';
}

export interface NDVIResponse {
  study_area: string;
  mean_ndvi: number;
  high_veg_percent: number;
  moderate_veg_percent: number;
  low_veg_percent: number;
  grid_geojson?: any;
  summary: MetricSummary;
  date_acquired?: string;
  sensor?: string;
  is_demo: boolean;
  is_data_available?: boolean;
}

export interface NDBIResponse {
  study_area: string;
  mean_ndbi: number;
  high_builtup_percent: number;
  moderate_builtup_percent: number;
  low_builtup_percent: number;
  grid_geojson?: any;
  summary: MetricSummary;
  date_acquired?: string;
  sensor?: string;
  is_demo: boolean;
  is_data_available?: boolean;
}

export interface LSTResponse {
  study_area: string;
  mean_temp_celsius: number;
  max_temp_celsius: number;
  min_temp_celsius: number;
  uhi_intensity_celsius: number;
  uhi_severity: 'low' | 'moderate' | 'severe' | 'critical';
  grid_geojson?: any;
  summary: MetricSummary;
  sensor?: string;
  is_demo: boolean;
  is_data_available?: boolean;
}

export interface LULCClass {
  class_name: string;
  area_sqkm: number;
  area_percent: number;
  color_hex: string;
}

export interface LULCResponse {
  study_area: string;
  total_area_sqkm: number;
  classes: LULCClass[];
  grid_geojson?: any;
  accuracy_kappa: number;
  year: number;
  is_demo: boolean;
  is_data_available?: boolean;
}

export interface ChangeDetectionResponse {
  study_area: string;
  period_start_year: number;
  period_end_year: number;
  builtup_expansion_percent: number;
  vegetation_loss_percent: number;
  waterbody_change_percent: number;
  total_converted_sqkm: number;
  change_matrix: Record<string, number>;
  change_geojson?: any;
  is_demo: boolean;
  is_data_available?: boolean;
}

export interface CrimeYearStat {
  year: number;
  total_crimes_against_women: number;
}

export interface WomenSafetyResponse {
  study_area: string;
  state_or_region: string;
  district_or_city: string;
  granularity: string;
  data_source: string;
  time_series_years: CrimeYearStat[];
  latest_year_total: number;
  historical_10yr_trend: string;
  ten_year_change_percent: number;
  crime_rate_per_lakh_population: number;
  risk_score: number;
  risk_level: string;
  score_breakdown: any;
  key_insights: string[];
  disclaimer: string;
  is_data_available: boolean;
}

export interface ZoneAssessment {
  zone_id: string;
  zone_name: string;
  score: number;
  rank: number;
  ndvi: number;
  accessibility_score: number;
  lst_c: number;
  ndbi: number;
  lulc_change_pct: number;
  recommendation: string;
  priority_level: 'High Priority' | 'Medium Priority' | 'Low Priority' | 'Conservation Zone';
}

export interface TOPSISResponse {
  study_area: string;
  zones: ZoneAssessment[];
  ideal_solution: Record<string, number>;
  negative_ideal_solution: Record<string, number>;
  calculated_at: string;
}

export interface ImpactAssessmentResponse {
  study_area: string;
  overall_ecological_score: number;
  impact_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  vegetation_index: number;
  builtup_density_index: number;
  surface_temperature_c: number;
  landuse_change_percent: number;
  accessibility_rating: string;
  key_vulnerabilities: string[];
  strategic_recommendations: string[];
  is_demo_mode: boolean;
}

export interface ReportSummary {
  report_id: string;
  title: string;
  study_area: string;
  generated_at: string;
  location_address: string;
  connectivity?: FacilityConnectivityResult;
  ecological_impact?: ImpactAssessmentResponse;
  mcda_ranking?: TOPSISResponse;
  women_safety?: WomenSafetyResponse;
  share_token: string;
}

export type ActiveLayer = 'none' | 'ndvi' | 'ndbi' | 'lst' | 'lulc' | 'change' | 'connectivity' | 'womenSafety';
export type BaseMapStyle = 'light' | 'satellite';
