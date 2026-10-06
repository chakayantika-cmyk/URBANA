import httpx
import math
import logging
from typing import List, Dict, Any, Optional
from ..models.schemas import Facility, FacilityCategory, RoutePoint
from ..models.database import get_db_connection
from ..config import settings

logger = logging.getLogger("urbana.facilities")

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_bounding_box_for_radius(lat: float, lon: float, radius_km: float) -> tuple[float, float, float, float]:
    # Returns (min_lat, min_lon, max_lat, max_lon)
    lat_delta = radius_km / 111.0
    lon_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
    return (lat - lat_delta, lon - lon_delta, lat + lat_delta, lon + lon_delta)

async def fetch_osm_facilities_overpass(lat: float, lon: float, radius_km: float = 8.0) -> Dict[str, List[Facility]]:
    min_lat, min_lon, max_lat, max_lon = get_bounding_box_for_radius(lat, lon, radius_km)
    
    # Overpass QL query for hospitals, schools, and major roads
    overpass_query = f"""
    [out:json][timeout:15];
    (
      // Hospitals & Healthcare
      node["amenity"="hospital"]({min_lat},{min_lon},{max_lat},{max_lon});
      way["amenity"="hospital"]({min_lat},{min_lon},{max_lat},{max_lon});
      node["amenity"="clinic"]["name"]({min_lat},{min_lon},{max_lat},{max_lon});
      
      // Schools & Education
      node["amenity"="school"]({min_lat},{min_lon},{max_lat},{max_lon});
      way["amenity"="school"]({min_lat},{min_lon},{max_lat},{max_lon});
      node["amenity"="college"]({min_lat},{min_lon},{max_lat},{max_lon});
      node["amenity"="university"]({min_lat},{min_lon},{max_lat},{max_lon});

      // Major Roads & Highways
      way["highway"~"^(motorway|trunk|primary|secondary)$"]["name"]({min_lat},{min_lon},{max_lat},{max_lon});
    );
    out center tags 80;
    """
    
    hospitals: List[Facility] = []
    schools: List[Facility] = []
    highways: List[Facility] = []
    
    try:
        async with httpx.AsyncClient(timeout=16.0) as client:
            resp = await client.post(
                settings.overpass_api_url,
                data={"data": overpass_query},
                headers={"User-Agent": settings.nominatim_user_agent}
            )
            if resp.status_code == 200:
                data = resp.json()
                elements = data.get("elements", [])
                
                seen_highway_names = set()
                
                for el in elements:
                    tags = el.get("tags", {})
                    osm_id = el.get("id")
                    
                    # Coordinates from node or way center
                    f_lat = el.get("lat") or el.get("center", {}).get("lat")
                    f_lon = el.get("lon") or el.get("center", {}).get("lon")
                    
                    if not f_lat or not f_lon:
                        continue
                    
                    name = tags.get("name") or tags.get("name:en") or tags.get("ref")
                    amenity = tags.get("amenity")
                    highway = tags.get("highway")
                    ref = tags.get("ref")
                    
                    if amenity in ["hospital", "clinic"]:
                        fac_name = name or f"Medical Facility (OSM #{osm_id})"
                        fac = Facility(
                            facility_id=f"hosp_{osm_id}",
                            osm_id=osm_id,
                            name=fac_name,
                            facility_type="hospital",
                            latitude=float(f_lat),
                            longitude=float(f_lon),
                            address=tags.get("addr:street"),
                            city=tags.get("addr:city")
                        )
                        hospitals.append(fac)
                    elif amenity in ["school", "college", "university"]:
                        fac_name = name or f"Educational Institution (OSM #{osm_id})"
                        fac = Facility(
                            facility_id=f"school_{osm_id}",
                            osm_id=osm_id,
                            name=fac_name,
                            facility_type="school",
                            latitude=float(f_lat),
                            longitude=float(f_lon),
                            address=tags.get("addr:street"),
                            city=tags.get("addr:city")
                        )
                        schools.append(fac)
                    elif highway in ["motorway", "trunk", "primary", "secondary"]:
                        hw_name = name or ref or f"{highway.capitalize()} Highway"
                        if hw_name not in seen_highway_names:
                            seen_highway_names.add(hw_name)
                            fac = Facility(
                                facility_id=f"hw_{osm_id}",
                                osm_id=osm_id,
                                name=hw_name,
                                facility_type="highway",
                                latitude=float(f_lat),
                                longitude=float(f_lon),
                                highway_ref=ref or highway
                            )
                            highways.append(fac)
                            
                # Cache discovered facilities into SQLite/PostGIS
                save_facilities_to_db(hospitals + schools + highways)
                
    except Exception as e:
        logger.warning(f"Overpass API call error for ({lat}, {lon}): {e}. Falling back to cached DB facilities.")
    
    # If Overpass returned empty or failed, retrieve from DB cache
    if not hospitals or not schools or not highways:
        db_results = get_facilities_from_db(lat, lon, radius_km)
        if not hospitals:
            hospitals = db_results.get("hospital", [])
        if not schools:
            schools = db_results.get("school", [])
        if not highways:
            highways = db_results.get("highway", [])

    return {
        "hospitals": hospitals,
        "schools": schools,
        "highways": highways
    }

def save_facilities_to_db(facilities: List[Facility]):
    if not facilities:
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    for f in facilities:
        cursor.execute("""
        INSERT OR REPLACE INTO facilities 
        (facility_id, osm_id, name, facility_type, latitude, longitude, address, city, highway_ref, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OSM')
        """, (
            f.facility_id,
            f.osm_id,
            f.name,
            f.facility_type,
            f.latitude,
            f.longitude,
            f.address,
            f.city,
            f.highway_ref
        ))
    conn.commit()
    conn.close()

def get_facilities_from_db(lat: float, lon: float, radius_km: float = 12.0) -> Dict[str, List[Facility]]:
    min_lat, min_lon, max_lat, max_lon = get_bounding_box_for_radius(lat, lon, radius_km)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT facility_id, osm_id, name, facility_type, latitude, longitude, address, city, highway_ref
    FROM facilities
    WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
    """, (min_lat, max_lat, min_lon, max_lon))
    rows = cursor.fetchall()
    conn.close()
    
    grouped: Dict[str, List[Facility]] = {"hospital": [], "school": [], "highway": []}
    for r in rows:
        fac = Facility(
            facility_id=r["facility_id"],
            osm_id=r["osm_id"],
            name=r["name"],
            facility_type=r["facility_type"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            address=r["address"],
            city=r["city"],
            highway_ref=r["highway_ref"]
        )
        if fac.facility_type in grouped:
            grouped[fac.facility_type].append(fac)
            
    return grouped
