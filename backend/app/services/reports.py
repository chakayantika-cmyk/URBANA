import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from ..models.schemas import ReportSummary, FacilityConnectivityResult, ImpactAssessmentResponse, TOPSISResponse
from .connectivity import analyze_facility_connectivity
from .ecological import evaluate_impact_assessment
from .mcda import compute_topsis_ranking

# In-memory report storage keyed by token/report_id
REPORT_STORE: Dict[str, ReportSummary] = {}

async def generate_comprehensive_report(
    lat: float, lon: float,
    address_text: str = "",
    study_area_name: str = "Selected Location"
) -> ReportSummary:
    report_id = f"REP-{uuid.uuid4().hex[:8].upper()}"
    token = str(uuid.uuid4())[:12]
    
    # 1. Connectivity
    conn = await analyze_facility_connectivity(lat, lon, address_text=address_text, travel_mode="driving")
    
    # 2. Ecological Impact
    impact = evaluate_impact_assessment(lat, lon, radius_km=5.0, location_name=study_area_name)
    
    # 3. MCDA TOPSIS Ranking
    mcda = compute_topsis_ranking(lat, lon, location_name=study_area_name)
    
    report = ReportSummary(
        report_id=report_id,
        title=f"Urban Ecological Intelligence & Connectivity Assessment — {study_area_name}",
        study_area=study_area_name,
        location_address=address_text or f"Lat: {lat:.4f}, Lon: {lon:.4f}",
        connectivity=conn,
        ecological_impact=impact,
        mcda_ranking=mcda,
        share_token=token,
        generated_at=datetime.utcnow()
    )
    
    REPORT_STORE[token] = report
    REPORT_STORE[report_id] = report
    
    return report

def get_report_by_token(token: str) -> Optional[ReportSummary]:
    return REPORT_STORE.get(token)
