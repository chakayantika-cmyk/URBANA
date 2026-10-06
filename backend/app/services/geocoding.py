import httpx
import json
import logging
from typing import List, Optional, Dict, Any
from urllib.parse import quote_plus
from ..models.schemas import GeocodeResult, GeocodeSearchResponse
from ..config import settings

logger = logging.getLogger("urbana.geocoding")

# In-memory LRU cache for geocoding queries
GEOCODE_CACHE: Dict[str, List[GeocodeResult]] = {}

def parse_nominatim_item(item: Dict[str, Any]) -> GeocodeResult:
    addr = item.get("address", {})
    
    # Determine city/locality
    city = (
        addr.get("city")
        or addr.get("town")
        or addr.get("village")
        or addr.get("municipality")
        or addr.get("suburb")
        or addr.get("neighbourhood")
        or addr.get("county")
    )
    
    district = addr.get("state_district") or addr.get("county") or addr.get("district")
    state = addr.get("state") or addr.get("province") or addr.get("region")
    country = addr.get("country")
    postal_code = addr.get("postcode")
    
    # Bounding box from Nominatim is [min_lat, max_lat, min_lon, max_lon]
    bbox_raw = item.get("boundingbox")
    bbox = None
    if bbox_raw and len(bbox_raw) == 4:
        try:
            bbox = [float(bbox_raw[0]), float(bbox_raw[1]), float(bbox_raw[2]), float(bbox_raw[3])]
        except (ValueError, TypeError):
            pass

    return GeocodeResult(
        place_id=str(item.get("place_id", "")),
        address=item.get("display_name", ""),
        display_name=item.get("display_name", ""),
        latitude=float(item.get("lat", 0.0)),
        longitude=float(item.get("lon", 0.0)),
        city=city,
        district=district,
        state=state,
        country=country,
        postal_code=postal_code,
        bounding_box=bbox,
        importance=float(item.get("importance", 0.0)),
        osm_type=item.get("osm_type"),
        raw=item
    )

async def geocode_address(query: str, limit: int = 5) -> List[GeocodeResult]:
    clean_query = query.strip()
    if not clean_query:
        return []
    
    cache_key = f"{clean_query.lower()}_{limit}"
    if cache_key in GEOCODE_CACHE:
        return GEOCODE_CACHE[cache_key]

    url = (
        f"https://nominatim.openstreetmap.org/search?"
        f"q={quote_plus(clean_query)}&format=jsonv2&addressdetails=1&limit={limit}"
    )
    
    headers = {
        "User-Agent": settings.nominatim_user_agent,
        "Accept-Language": "en"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                results = [parse_nominatim_item(item) for item in data]
                if results:
                    GEOCODE_CACHE[cache_key] = results
                return results
            else:
                logger.warning(f"Nominatim returned status {resp.status_code}")
    except Exception as e:
        logger.error(f"Geocoding exception for query '{query}': {e}")
    
    return []

async def reverse_geocode(lat: float, lon: float) -> Optional[GeocodeResult]:
    cache_key = f"rev_{lat:.5f}_{lon:.5f}"
    if cache_key in GEOCODE_CACHE and GEOCODE_CACHE[cache_key]:
        return GEOCODE_CACHE[cache_key][0]

    url = (
        f"https://nominatim.openstreetmap.org/reverse?"
        f"lat={lat}&lon={lon}&format=jsonv2&addressdetails=1"
    )
    
    headers = {
        "User-Agent": settings.nominatim_user_agent,
        "Accept-Language": "en"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                item = resp.json()
                result = parse_nominatim_item(item)
                GEOCODE_CACHE[cache_key] = [result]
                return result
    except Exception as e:
        logger.error(f"Reverse geocode failed for {lat}, {lon}: {e}")
    
    return None
