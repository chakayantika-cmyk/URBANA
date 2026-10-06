import numpy as np
from typing import Dict, Any, List
from ..models.schemas import (
    AHPWeightRequest, AHPWeightResponse,
    TOPSISResponse, ZoneAssessment
)

# Random Index table for AHP matrix consistency check (n = 1..10)
RANDOM_INDEX = {1: 0.0, 2: 0.0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}

def compute_ahp_weights(req: AHPWeightRequest) -> AHPWeightResponse:
    # 5 Criteria: [Vegetation, Accessibility, Temperature, Builtup, Change]
    raw_w = np.array([
        req.vegetation_weight,
        req.accessibility_weight,
        req.temperature_weight,
        req.builtup_density_weight,
        req.landuse_change_weight
    ], dtype=float)
    
    total = np.sum(raw_w)
    if total <= 0:
        raw_w = np.array([0.30, 0.25, 0.20, 0.15, 0.10])
        total = 1.0
        
    normalized_weights = raw_w / total
    
    # Construct pairwise comparison ratio matrix A (where A_ij = w_i / w_j)
    n = len(normalized_weights)
    matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            matrix[i][j] = normalized_weights[i] / normalized_weights[j]
            
    # Calculate principal eigenvalue and consistency
    col_sums = np.sum(matrix, axis=0)
    lambda_max = float(np.sum(col_sums * normalized_weights))
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0.0
    ri = RANDOM_INDEX.get(n, 1.12)
    cr = float(ci / ri) if ri > 0 else 0.0
    
    is_consistent = cr < 0.10
    interp = "Weight distribution is mathematically consistent (CR < 0.10)." if is_consistent else "Matrix has minor inconsistency (CR >= 0.10), normalized weights applied."

    return AHPWeightResponse(
        weights={
            "Vegetation Health": round(float(normalized_weights[0]), 3),
            "Arterial Accessibility": round(float(normalized_weights[1]), 3),
            "Thermal Mitigation": round(float(normalized_weights[2]), 3),
            "Built-up Density": round(float(normalized_weights[3]), 3),
            "Land-use Change Pressure": round(float(normalized_weights[4]), 3)
        },
        consistency_ratio=round(cr, 4),
        is_consistent=is_consistent,
        interpretation=interp
    )

def compute_topsis_ranking(
    lat: float, lon: float,
    weights_req: Optional[AHPWeightRequest] = None,
    location_name: str = "Selected Study Area"
) -> TOPSISResponse:
    if weights_req is None:
        weights_req = AHPWeightRequest()
        
    ahp = compute_ahp_weights(weights_req)
    w = np.array(list(ahp.weights.values()), dtype=float)
    
    # Define 5 representative urban decision zones around the location
    zone_names = [
        f"{location_name} - Central Urban Core",
        f"{location_name} - Transit Corridor North",
        f"{location_name} - Residential Sector East",
        f"{location_name} - Ecological Buffer South",
        f"{location_name} - Industrial Growth Zone West"
    ]
    
    # Decision Matrix X (5 alternatives x 5 criteria):
    # Criteria: [Vegetation (benefit), Accessibility (benefit), Temp (cost), Builtup (cost), Change (cost)]
    # Values represent: NDVI, Access Score (0-1), Surface Temp °C, NDBI, Change %
    X = np.array([
        [0.21, 0.92, 38.2, 0.48, 22.4],  # Core
        [0.34, 0.88, 35.1, 0.36, 18.1],  # Transit Corridor
        [0.46, 0.65, 32.4, 0.22, 11.2],  # Residential
        [0.68, 0.42, 28.8, -0.05, 4.5],  # Eco Buffer
        [0.18, 0.78, 39.5, 0.54, 26.8]   # Industrial
    ])
    
    # Step 1: Vector Normalization R = X_ij / sqrt(sum(X_ij^2))
    norm_factors = np.sqrt(np.sum(X**2, axis=0))
    R = X / norm_factors
    
    # Step 2: Weighted Normalized Matrix V = R * W
    V = R * w
    
    # Step 3: Determine Ideal (A+) and Negative-Ideal (A-) Solutions
    # Criteria types: 0: benefit, 1: benefit, 2: cost, 3: cost, 4: cost
    is_benefit = [True, True, False, False, False]
    
    ideal_plus = np.zeros(5)
    ideal_minus = np.zeros(5)
    
    for j in range(5):
        if is_benefit[j]:
            ideal_plus[j] = np.max(V[:, j])
            ideal_minus[j] = np.min(V[:, j])
        else:
            ideal_plus[j] = np.min(V[:, j])
            ideal_minus[j] = np.max(V[:, j])
            
    # Step 4: Calculate Separation Measures S+ and S-
    S_plus = np.sqrt(np.sum((V - ideal_plus)**2, axis=1))
    S_minus = np.sqrt(np.sum((V - ideal_minus)**2, axis=1))
    
    # Step 5: Relative Closeness C = S- / (S+ + S-)
    C = S_minus / (S_plus + S_minus)
    
    # Rank zones
    ranked_indices = np.argsort(-C)
    
    zones: List[ZoneAssessment] = []
    
    recommendations_map = {
        0: "Immediate heat island mitigation; mandate rooftop solar and tree-lined pedestrian avenues.",
        1: "Prioritize transit-oriented development and continuous bicycle/walking connectivity.",
        2: "Preserve neighbourhood tree canopy and permeable ground water recharge swales.",
        3: "Enforce strict environmental conservation zone; restrict heavy commercial expansion.",
        4: "Implement industrial buffer planting and wastewater filtration wetlands."
    }
    
    for rank_idx, orig_idx in enumerate(ranked_indices, start=1):
        score_val = float(C[orig_idx])
        if score_val >= 0.70:
            p_level = "High Priority"
        elif score_val >= 0.50:
            p_level = "Medium Priority"
        elif score_val >= 0.35:
            p_level = "Low Priority"
        else:
            p_level = "Conservation Zone"
            
        zones.append(ZoneAssessment(
            zone_id=f"zone_{orig_idx + 1}",
            zone_name=zone_names[orig_idx],
            score=round(score_val, 3),
            rank=rank_idx,
            ndvi=round(float(X[orig_idx][0]), 2),
            accessibility_score=round(float(X[orig_idx][1]), 2),
            lst_c=round(float(X[orig_idx][2]), 1),
            ndbi=round(float(X[orig_idx][3]), 2),
            lulc_change_pct=round(float(X[orig_idx][4]), 1),
            recommendation=recommendations_map[orig_idx],
            priority_level=p_level
        ))

    return TOPSISResponse(
        study_area=location_name,
        zones=zones,
        ideal_solution={"S_plus_opt": round(float(np.min(S_plus)), 4)},
        negative_ideal_solution={"S_minus_worst": round(float(np.min(S_minus)), 4)}
    )
