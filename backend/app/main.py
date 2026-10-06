import logging
from fastapi import FastAPI, Query, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

from .config import settings
from .models.schemas import (
    GeocodeSearchResponse, GeocodeResult, LocationState,
    RouteRequest, RouteResponse,
    NearbyFacilitiesResponse,
    ConnectivityQueryRequest, FacilityConnectivityResult,
    StudyAreaRequest, NDVIResponse, NDBIResponse, LSTResponse,
    LULCResponse, ChangeDetectionResponse, ImpactAssessmentResponse,
    AHPWeightRequest, AHPWeightResponse, TOPSISResponse,
    ReportSummary, WomenSafetyResponse
)
from .services.geocoding import geocode_address, reverse_geocode
from .services.facility_service import fetch_osm_facilities_overpass
from .services.routing_engine import calculate_route
from .services.connectivity import analyze_facility_connectivity, get_connectivity_by_token
from .services.ecological import (
    analyze_ndvi, analyze_ndbi, analyze_lst, analyze_lulc,
    analyze_change_detection, evaluate_impact_assessment
)
from .services.mcda import compute_ahp_weights, compute_topsis_ranking
from .services.reports import generate_comprehensive_report, get_report_by_token

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("urbana")

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Web-GIS Urban Planning & Ecological Impact Assessment Decision Support System (URBANA)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# SYSTEM & HEALTH
# ==========================================

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "system": "URBANA Web-GIS DSS",
        "version": settings.version,
        "environment": settings.environment,
        "geocoding_service": "Nominatim Live / OSM",
        "routing_service": "OSM / pgRouting Directed Graph",
        "spatial_database": "PostGIS / SQLite-Spatial ready"
    }

# ==========================================
# GEOCODING ENDPOINTS
# ==========================================

@app.get("/api/geocode", response_model=List[GeocodeResult])
@app.get("/api/geocode/search", response_model=List[GeocodeResult])
async def search_address(q: str = Query(..., description="Address, city, or landmark string"), limit: int = 5):
    results = await geocode_address(q, limit=limit)
    return results

@app.get("/api/geocode/reverse", response_model=Optional[GeocodeResult])
async def reverse_lookup(lat: float = Query(...), lon: float = Query(...)):
    result = await reverse_geocode(lat, lon)
    return result

# ==========================================
# LOCATION ANALYSIS ENDPOINT
# ==========================================

@app.post("/api/location/analyze")
async def analyze_location(req: StudyAreaRequest):
    lat = req.center.latitude
    lon = req.center.longitude
    name = req.location_name or "Selected Location"
    
    # Run full multi-modular intelligence pipeline
    conn = await analyze_facility_connectivity(lat, lon, address_text=name, travel_mode="driving")
    ndvi = analyze_ndvi(lat, lon, req.radius_km, name)
    ndbi = analyze_ndbi(lat, lon, req.radius_km, name)
    lst = analyze_lst(lat, lon, req.radius_km, name)
    lulc = analyze_lulc(lat, lon, req.radius_km, name)
    change = analyze_change_detection(lat, lon, req.radius_km, name)
    impact = evaluate_impact_assessment(lat, lon, req.radius_km, name)
    topsis = compute_topsis_ranking(lat, lon, location_name=name)
    
    return {
        "location": {"latitude": lat, "longitude": lon, "name": name},
        "connectivity": conn,
        "ndvi": ndvi,
        "ndbi": ndbi,
        "lst": lst,
        "lulc": lulc,
        "change_detection": change,
        "ecological_impact": impact,
        "topsis_ranking": topsis
    }

# ==========================================
# ROAD NETWORK & ROUTING ENDPOINTS
# ==========================================

@app.get("/api/network/coverage")
async def get_network_coverage(lat: float = Query(...), lon: float = Query(...)):
    return {
        "coverage_id": f"cov_{round(lat, 2)}_{round(lon, 2)}",
        "latitude": lat,
        "longitude": lon,
        "network_status": "active",
        "engine": "OSM Topology / pgRouting",
        "routing_radius_km": settings.default_routing_radius_km
    }

@app.post("/api/routes", response_model=RouteResponse)
async def get_route(req: RouteRequest):
    route = await calculate_route(
        req.origin.latitude, req.origin.longitude,
        req.destination.latitude, req.destination.longitude,
        mode=req.travel_mode
    )
    return route

# ==========================================
# FACILITIES & MODULE G CONNECTIVITY
# ==========================================

@app.get("/api/facilities/nearby", response_model=NearbyFacilitiesResponse)
async def get_nearby_facilities(
    lat: float = Query(...),
    lon: float = Query(...),
    radius_km: float = 8.0
):
    facs = await fetch_osm_facilities_overpass(lat, lon, radius_km)
    return NearbyFacilitiesResponse(
        center=RoutePoint(latitude=lat, longitude=lon),
        radius_km=radius_km,
        hospitals=facs.get("hospitals", []),
        schools=facs.get("schools", []),
        highways=facs.get("highways", [])
    )

@app.post("/api/connectivity", response_model=FacilityConnectivityResult)
async def query_connectivity(req: ConnectivityQueryRequest):
    result = await analyze_facility_connectivity(
        req.latitude, req.longitude,
        address_text=req.address or "",
        travel_mode=req.travel_mode,
        force_refresh=req.force_refresh
    )
    return result

@app.get("/api/connectivity/{token}", response_model=FacilityConnectivityResult)
async def get_connectivity_result(token: str = Path(...)):
    result = get_connectivity_by_token(token)
    if not result:
        raise HTTPException(status_code=404, detail="Connectivity record not found")
    return result

# ==========================================
# ECOLOGICAL GIS ANALYSIS ENDPOINTS
# ==========================================

@app.post("/api/analysis/ndvi", response_model=NDVIResponse)
async def get_ndvi(req: StudyAreaRequest):
    return analyze_ndvi(req.center.latitude, req.center.longitude, req.radius_km, req.location_name or "Study Area")

@app.post("/api/analysis/ndbi", response_model=NDBIResponse)
async def get_ndbi(req: StudyAreaRequest):
    return analyze_ndbi(req.center.latitude, req.center.longitude, req.radius_km, req.location_name or "Study Area")

@app.post("/api/analysis/lst", response_model=LSTResponse)
async def get_lst(req: StudyAreaRequest):
    return analyze_lst(req.center.latitude, req.center.longitude, req.radius_km, req.location_name or "Study Area")

@app.post("/api/analysis/lulc", response_model=LULCResponse)
async def get_lulc(req: StudyAreaRequest):
    return analyze_lulc(req.center.latitude, req.center.longitude, req.radius_km, req.location_name or "Study Area")

@app.post("/api/analysis/change-detection", response_model=ChangeDetectionResponse)
async def get_change_detection(req: StudyAreaRequest):
    return analyze_change_detection(req.center.latitude, req.center.longitude, req.radius_km, req.location_name or "Study Area")

@app.post("/api/analysis/impact", response_model=ImpactAssessmentResponse)
async def get_impact_assessment(req: StudyAreaRequest):
    return evaluate_impact_assessment(req.center.latitude, req.center.longitude, req.radius_km, req.location_name or "Study Area")

@app.post("/api/analysis/women-safety", response_model=WomenSafetyResponse)
async def get_women_safety(req: StudyAreaRequest):
    from .services.women_safety import analyze_women_safety
    return await analyze_women_safety(req.center.latitude, req.center.longitude, req.radius_km, req.location_name or "Study Area")

# ==========================================
# MCDA (AHP & TOPSIS) ENDPOINTS
# ==========================================

@app.post("/api/analysis/ahp", response_model=AHPWeightResponse)
async def get_ahp_weights(req: AHPWeightRequest):
    return compute_ahp_weights(req)

@app.post("/api/analysis/topsis", response_model=TOPSISResponse)
async def get_topsis_ranking(
    lat: float = Query(...),
    lon: float = Query(...),
    location_name: str = Query("Selected Area")
):
    return compute_topsis_ranking(lat, lon, location_name=location_name)

# ==========================================
# REPORTS & SHARING
# ==========================================

@app.post("/api/reports", response_model=ReportSummary)
async def create_report(
    lat: float = Query(...),
    lon: float = Query(...),
    address: str = Query(""),
    location_name: str = Query("Study Area")
):
    report = await generate_comprehensive_report(lat, lon, address_text=address, study_area_name=location_name)
    return report

@app.get("/api/share/{token}", response_model=ReportSummary)
async def get_shared_report(token: str = Path(...)):
    report = get_report_by_token(token)
    if not report:
        raise HTTPException(status_code=404, detail="Shared report not found or expired")
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
