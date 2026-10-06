import sqlite3
import json
import os
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

if os.getenv("VERCEL"):
    DB_FILE = "/tmp/urbana_cache.db"
else:
    DB_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "urbana_cache.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. ROAD_NETWORK_COVERAGE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS road_network_coverage (
        coverage_id TEXT PRIMARY KEY,
        country TEXT,
        region TEXT,
        min_lat REAL,
        min_lon REAL,
        max_lat REAL,
        max_lon REAL,
        network_status TEXT,
        nodes_count INTEGER,
        edges_count INTEGER,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 2. ROAD_NETWORK segments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS road_network (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        osm_id INTEGER,
        coverage_id TEXT,
        source INTEGER,
        target INTEGER,
        length_m REAL,
        highway_type TEXT,
        speed_kmh INTEGER,
        one_way INTEGER,
        geometry TEXT,
        FOREIGN KEY (coverage_id) REFERENCES road_network_coverage(coverage_id)
    )
    """)

    # 3. FACILITIES
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS facilities (
        facility_id TEXT PRIMARY KEY,
        osm_id INTEGER,
        name TEXT,
        facility_type TEXT,
        latitude REAL,
        longitude REAL,
        address TEXT,
        city TEXT,
        region TEXT,
        country TEXT,
        source TEXT,
        highway_ref TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 4. FACILITY_CONNECTIVITY
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS facility_connectivity (
        connectivity_id TEXT PRIMARY KEY,
        geocoded_lat REAL,
        geocoded_lon REAL,
        address_text TEXT,
        travel_mode TEXT,
        nearest_hospital_id TEXT,
        nearest_hospital_name TEXT,
        hospital_distance_km REAL,
        hospital_travel_time_min REAL,
        hospital_route_geom TEXT,
        nearest_school_id TEXT,
        nearest_school_name TEXT,
        school_distance_km REAL,
        school_travel_time_min REAL,
        school_route_geom TEXT,
        nearest_highway_name TEXT,
        highway_distance_km REAL,
        highway_travel_time_min REAL,
        highway_route_geom TEXT,
        query_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        shareable_link_token TEXT UNIQUE,
        is_live_network INTEGER DEFAULT 1,
        is_demo_mode INTEGER DEFAULT 0
    )
    """)
    
    # Create indexes for spatial bounding box lookups and coordinate proximity
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conn_coords ON facility_connectivity(geocoded_lat, geocoded_lon)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conn_token ON facility_connectivity(shareable_link_token)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_fac_type ON facilities(facility_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_fac_coords ON facilities(latitude, longitude)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cov_bounds ON road_network_coverage(min_lat, max_lat, min_lon, max_lon)")
    
    conn.commit()
    conn.close()

# Initialize tables immediately on load
init_db()
