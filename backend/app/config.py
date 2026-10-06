import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "URBANA Ecological Decision Support System"
    version: str = "2.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    nominatim_user_agent: str = os.getenv("NOMINATIM_USER_AGENT", "urbana-gis-ecological-dss/2.0 (contact: support@urbanagis.org)")
    overpass_api_url: str = os.getenv("OVERPASS_API_URL", "https://overpass-api.de/api/interpreter")
    osrm_routing_url: str = os.getenv("OSRM_ROUTING_URL", "https://router.project-osrm.org")
    
    # Defaults
    default_routing_radius_km: float = 10.0
    cache_ttl_hours: int = 24
    walking_speed_kmh: float = 4.5
    driving_speed_kmh_urban: float = 30.0
    driving_speed_kmh_regional: float = 60.0

settings = Settings()
