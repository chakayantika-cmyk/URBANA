# URBANA — Web-GIS Urban Ecological Impact Assessment & Urban Planning Decision Support System

**Version:** 2.0.0 (Free-Tier Production Architecture)  
**Design Direction:** Google Maps interaction model × Zara editorial visual language  
**Geographic Coverage:** Universal (Any global address, locality, landmark, or coordinates)

---

## 1. Architectural Overview

URBANA is a location-agnostic geospatial intelligence and decision support system. The architecture is engineered around the principle of **dynamic geographic pipelines** rather than fixed preloaded study cities.

```
USER ENTERS ANY GLOBAL ADDRESS
               │
               ▼
   UNIVERSAL GEOCODING (Nominatim / OSM)
   [Structured Hierarchy: Lat, Lon, City, BBox]
               │
               ▼
   DYNAMIC BOUNDED ROAD NETWORK & FACILITY EXTRACTION
   [pgRouting Directed Graph & Overpass API]
               │
               ▼
   NEAREST REACHABLE FACILITY ROUTING (Module G)
   [Real Network Distance & Road Speed Matrix]
         ┌─────┴──────────────────────────────┐
         ▼                                    ▼
   CITIZEN INTERFACE                   ANALYST WORKSPACE
   • Hospital / School / Highway       • Remote Sensing (NDVI / NDBI / LST)
   • Dynamic Network Distance (km)     • 4-Class LULC Classification
   • Driving vs. Walking Times         • 2019–2026 Change Detection Split
   • Turn-by-Turn Route Polyline       • AHP Criteria Weights & TOPSIS Ranking
   • Public Shareable Token            • Printable Environmental Dossier
```

---

## 2. Universal Geocoding & Address Search UX

- **Location-Agnostic Engine:** Powered by Nominatim with fuzzy matching, query debouncing (280ms), address hierarchy breakdown (City, State, District, Country, Postal Code), and bounding-box normalization.
- **No Hardcoded Address Lists:** Works identically for `12 Park Street, Kolkata`, `MG Road, Bengaluru`, `Connaught Place, New Delhi`, `Times Square, New York`, `Oxford Street, London`, or arbitrary lat/lon coordinates.
- **Visual Validation Card:** Floating card provides instant visual confirmation with coordinates, regional tags, and a prominent `[ Analyse this location ]` action.

---

## 3. Dynamic Road Network & Facility Routing (Module G)

- **Layered Network Strategy:**
  1. **Level 1 (Memory Cache):** Rapid retrieval of active graphs.
  2. **Level 2 (Database Coverage):** Bounding-box queries on SQLite/PostGIS `ROAD_NETWORK_COVERAGE`.
  3. **Level 3 (Dynamic Bounded Overpass Acquisition):** Queries OpenStreetMap around the searched point (5–10 km configurable radius) without downloading entire countries.
- **Routable Directed Graph:** Edges encode OSM highway classes (`motorway`, `trunk`, `primary`, `secondary`, `tertiary`, `residential`, `living_street`) and corresponding speed limits.
- **Travel Modes:**
  - **Driving:** Speed limits from 25 km/h (residential) to 80 km/h (motorways).
  - **Walking:** 4.5 km/h walking speed with pedestrian-accessible street filters.
- **True Network Cost:** Snaps origin and candidate facilities to the road graph and selects the minimum valid network travel time (never straight-line Euclidean distance).
- **Public Share Token:** Generates a secure, view-only `shareable_link_token` for instant public sharing.

---

## 4. Ecological GIS & Remote Sensing Modules

| Module | Sensor / Baseline | Spatial Output | Decision Output |
|---|---|---|---|
| **NDVI** | Sentinel-2 L2A | Vector Tessellation Grid (-1 to +1) | Canopy health, high/mod/low green ratio |
| **NDBI** | Sentinel-2 L2A | Built-up Index Grid (-1 to +1) | Impervious surface and concrete density |
| **LST / UHI** | Landsat-9 TIRS | Surface Temperature Field (°C) | Microclimate thermal stress & UHI delta |
| **LULC** | Sentinel-2 Classified | 4-Class Polygons (Built, Veg, Water, Bare) | Surface area (km²) and percentage coverage |
| **Change Detection** | 2019 vs. 2026 Baseline | Interactive Split-Screen Slider | Flux matrix, urban expansion & canopy loss |

---

## 5. Multi-Criteria Decision Analysis (AHP & TOPSIS)

1. **Analytic Hierarchy Process (AHP):**
   - User-controlled sliders for 5 criteria: *Vegetation Health*, *Arterial Accessibility*, *Thermal Mitigation*, *Built-up Density*, and *Land-use Change Pressure*.
   - Calculates principal eigenvector, maximum eigenvalue ($\lambda_{max}$), Consistency Index ($CI$), and verifies Consistency Ratio ($CR < 0.10$).
2. **Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS):**
   - Normalizes decision matrix across sub-zones.
   - Computes Euclidean separation from positive-ideal ($A^+$) and negative-ideal ($A^-$) solutions.
   - Calculates relative closeness score ($C_i$) and outputs prioritized zone rankings (`High Priority`, `Medium Priority`, `Low Priority`, `Conservation Zone`).

---

## 6. Design System: Google Maps × Zara

- **Palette:**
  - Background: `#F7F7F5` (Warm off-white)
  - Surface: `#FFFFFF`
  - Text Primary: `#111111` (Architectural charcoal)
  - Secondary: `#6F6F6F`
  - Border: `#E5E5E2` (1px hairline dividers)
  - Accent: `#8B0000` (Restrained crimson for routes & key actions)
  - Success: `#315C45` | Warning: `#9A7B27` | Danger: `#7A2424`
- **Typography:** Inter with editorial sizing (38px titles, bold tabular numerals).
- **Map Dominance:** MapLibre GL JS occupies 85–90% of the viewport; floating panels maintain context without obstructing spatial exploration.
