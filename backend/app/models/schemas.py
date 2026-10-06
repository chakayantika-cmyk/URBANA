from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

# ==========================================
# GEOCODING & LOCATION SCHEMAS
# ==========================================

class GeocodeResult(BaseModel):
    place_id: Optional[str] = None
    address: str
    display_name: str
    latitude: float
    longitude: float
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    bounding_box: Optional[List[float]] = None  # [min_lat, max_lat, min_lon, max_lon]
    importance: Optional[float] = None
    osm_type: Optional[str] = None
    raw: Optional[Dict[str, Any]] = None

class GeocodeSearchResponse(BaseModel):
    query: str
    results: List[GeocodeResult]
    count: int

class LocationState(BaseModel):
    address: str
    latitude: float
    longitude: float
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    bounding_box: Optional[List[float]] = None

# ==========================================
# ROAD NETWORK & ROUTING SCHEMAS
# ==========================================

TravelMode = Literal["driving", "walking"]

class RoadNetworkCoverage(BaseModel):
    coverage_id: str
    country: Optional[str] = None
    region: Optional[str] = None
    bbox: List[float]  # [min_lat, min_lon, max_lat, max_lon]
    min_lat: float
    min_lon: float
    max_lat: float
    max_lon: float
    network_status: str = "active"  # "active", "downloading", "cached"
    nodes_count: int = 0
    edges_count: int = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class RoutePoint(BaseModel):
    latitude: float
    longitude: float

class RouteRequest(BaseModel):
    origin: RoutePoint
    destination: RoutePoint
    travel_mode: TravelMode = "driving"
    preference: Literal["fastest", "shortest"] = "fastest"

class RouteResponse(BaseModel):
    route_id: Optional[str] = None
    travel_mode: TravelMode
    distance_km: float
    duration_min: float
    origin: RoutePoint
    destination: RoutePoint
    route_geojson: Dict[str, Any]  # GeoJSON LineString
    instructions: Optional[List[str]] = None
    is_live_network: bool = True
    speed_kmh_avg: float

# ==========================================
# FACILITY & CONNECTIVITY SCHEMAS (Module G)
# ==========================================

FacilityCategory = Literal["hospital", "school", "highway"]

class Facility(BaseModel):
    facility_id: str
    name: str
    facility_type: FacilityCategory
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    osm_id: Optional[int] = None
    highway_ref: Optional[str] = None
    distance_km: Optional[float] = None
    travel_time_min: Optional[float] = None
    route_geom: Optional[Dict[str, Any]] = None  # GeoJSON LineString

class NearbyFacilitiesResponse(BaseModel):
    center: RoutePoint
    radius_km: float
    hospitals: List[Facility]
    schools: List[Facility]
    highways: List[Facility]
    source: str = "OpenStreetMap / Dynamic Overpass"

class ConnectivityQueryRequest(BaseModel):
    address: Optional[str] = None
    latitude: float
    longitude: float
    travel_mode: TravelMode = "driving"
    force_refresh: bool = False

class FacilityRouteSummary(BaseModel):
    facility_id: str
    name: str
    facility_type: FacilityCategory
    distance_km: float
    travel_time_min: float
    route_geom: Dict[str, Any]  # GeoJSON LineString
    destination_point: RoutePoint

class FacilityConnectivityResult(BaseModel):
    connectivity_id: str
    address_text: str
    geocoded_point: RoutePoint
    travel_mode: TravelMode
    nearest_hospital: Optional[FacilityRouteSummary] = None
    nearest_school: Optional[FacilityRouteSummary] = None
    nearest_highway: Optional[FacilityRouteSummary] = None
    query_timestamp: datetime = Field(default_factory=datetime.utcnow)
    shareable_link_token: str
    is_live_network: bool = True
    is_demo_mode: bool = False
    message: Optional[str] = None

# ==========================================
# ECOLOGICAL & REMOTE SENSING SCHEMAS
# ==========================================

class StudyAreaRequest(BaseModel):
    center: RoutePoint
    radius_km: float = 5.0
    polygon_geojson: Optional[Dict[str, Any]] = None
    location_name: Optional[str] = None

class MetricSummary(BaseModel):
    name: str
    mean_value: float
    min_value: float
    max_value: float
    unit: str
    interpretation: str
    status: Literal["healthy", "moderate", "degraded", "critical", "neutral"]

class NDVIResponse(BaseModel):
    study_area: str
    mean_ndvi: float
    high_veg_percent: float
    moderate_veg_percent: float
    low_veg_percent: float
    grid_geojson: Optional[Dict[str, Any]] = None
    summary: MetricSummary
    date_acquired: str = "2026-09-15"
    sensor: str = "Copernicus Sentinel-2 L2A"
    is_demo: bool = False
    is_data_available: bool = True

class NDBIResponse(BaseModel):
    study_area: str
    mean_ndbi: float
    high_builtup_percent: float
    moderate_builtup_percent: float
    low_builtup_percent: float
    grid_geojson: Optional[Dict[str, Any]] = None
    summary: MetricSummary
    date_acquired: str = "2026-09-15"
    sensor: str = "Copernicus Sentinel-2 L2A"
    is_demo: bool = False
    is_data_available: bool = True

class LSTResponse(BaseModel):
    study_area: str
    mean_temp_celsius: float
    max_temp_celsius: float
    min_temp_celsius: float
    uhi_intensity_celsius: float
    uhi_severity: Literal["low", "moderate", "severe", "critical"]
    grid_geojson: Optional[Dict[str, Any]] = None
    summary: MetricSummary
    sensor: str = "USGS Landsat 8/9 Collection 2 L2 TIRS & Thermal Satellite Radiometry"
    is_demo: bool = False
    is_data_available: bool = True

class LULCClass(BaseModel):
    class_name: str
    area_sqkm: float
    area_percent: float
    color_hex: str

class LULCResponse(BaseModel):
    study_area: str
    total_area_sqkm: float
    classes: List[LULCClass]
    grid_geojson: Optional[Dict[str, Any]] = None
    accuracy_kappa: float = 0.89
    year: int = 2026
    sensor: str = "ESA WorldCover & Sentinel-2 Classification"
    is_demo: bool = False
    is_data_available: bool = True

class ChangeDetectionResponse(BaseModel):
    study_area: str
    period_start_year: int = 2019
    period_end_year: int = 2026
    builtup_expansion_percent: float
    vegetation_loss_percent: float
    waterbody_change_percent: float
    total_converted_sqkm: float
    change_matrix: Dict[str, float]
    change_geojson: Optional[Dict[str, Any]] = None
    sensor: str = "Multitemporal Sentinel-2 & GHSL Built-up Comparison"
    is_demo: bool = False
    is_data_available: bool = True

# ==========================================
# WOMEN SAFETY SCHEMAS
# ==========================================

class CrimeYearStat(BaseModel):
    year: int
    rape_cases: int
    assault_modesty_cases: int
    cruelty_husband_relatives: int
    kidnapping_abduction: int
    total_crimes_against_women: int
    crime_rate_per_lakh: Optional[float] = None

class LocalSpatialSafetyFactors(BaseModel):
    police_stations_nearby: int
    nearest_police_km: Optional[float] = None
    lit_streets_percent: float
    transit_hubs_nearby: int
    infrastructure_safety_score: float

class WomenSafetyResponse(BaseModel):
    study_area: str
    state_or_region: str
    district_or_city: str
    granularity: str
    data_source: str
    time_series_years: List[CrimeYearStat]
    latest_year_total: int
    historical_10yr_trend: Literal["Increasing", "Decreasing", "Stable", "Fluctuating"]
    ten_year_change_percent: float
    crime_rate_per_lakh_population: float
    risk_score: float
    risk_level: Literal["Low Risk", "Moderate Risk", "Elevated Risk", "High Risk"]
    score_breakdown: Dict[str, Any]
    key_insights: List[str]
    disclaimer: str
    is_data_available: bool = True

# ==========================================
# MCDA (AHP & TOPSIS) & IMPACT SCHEMAS
# ==========================================

class AHPWeightRequest(BaseModel):
    vegetation_weight: float = 0.30
    accessibility_weight: float = 0.25
    temperature_weight: float = 0.20
    builtup_density_weight: float = 0.15
    landuse_change_weight: float = 0.10

class AHPWeightResponse(BaseModel):
    weights: Dict[str, float]
    consistency_ratio: float
    is_consistent: bool
    interpretation: str

class ZoneAssessment(BaseModel):
    zone_id: str
    zone_name: str
    score: float
    rank: int
    ndvi: float
    ndbi: float
    lst_c: float
    accessibility_score: float
    lulc_change_pct: float
    recommendation: str
    priority_level: Literal["High Priority", "Medium Priority", "Low Priority", "Conservation Zone"]
    geometry: Optional[Dict[str, Any]] = None

class TOPSISResponse(BaseModel):
    study_area: str
    zones: List[ZoneAssessment]
    ideal_solution: Dict[str, float]
    negative_ideal_solution: Dict[str, float]
    calculated_at: datetime = Field(default_factory=datetime.utcnow)

class ImpactAssessmentResponse(BaseModel):
    study_area: str
    overall_ecological_score: float  # 0 to 100
    impact_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    vegetation_index: float
    builtup_density_index: float
    surface_temperature_c: float
    landuse_change_percent: float
    accessibility_rating: str
    key_vulnerabilities: List[str]
    strategic_recommendations: List[str]
    is_demo_mode: bool = False

# ==========================================
# REPORTS & SHARING SCHEMAS
# ==========================================

class ReportSummary(BaseModel):
    report_id: str
    title: str
    study_area: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    location_address: str
    connectivity: Optional[FacilityConnectivityResult] = None
    ecological_impact: Optional[ImpactAssessmentResponse] = None
    mcda_ranking: Optional[TOPSISResponse] = None
    women_safety: Optional[WomenSafetyResponse] = None
    share_token: str
