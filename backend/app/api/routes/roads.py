from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
import json
from datetime import datetime

from backend.app.database import db

router = APIRouter(prefix="/roads", tags=["Roads"])

@router.get("")
def list_roads():
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM road_segments ORDER BY risk_score DESC")
        rows = [dict(r) for r in cursor.fetchall()]

    roads = []
    for r in rows:
        path_coords = json.loads(r["path_coordinates"]) if r["path_coordinates"] else []
        roads.append({
            "id": r["id"],
            "name": r["name"],
            "ward": r["ward"],
            "lengthKm": r["length_km"],
            "roadType": r["road_type"],
            "surfaceType": r["surface_type"],
            "currentCondition": r["current_condition"],
            "pciScore": r["pci_score"],
            "riskScore": int(r["risk_score"]),
            "priority": r["priority"],
            "trafficIntensity": r["traffic_intensity"],
            "weatherExposure": r["weather_exposure"],
            "lastInspectionDate": r["last_inspection_date"] or "",
            "nextInspectionDate": r["next_inspection_date"] or "",
            "lastMaintenanceDate": r["last_maintenance_date"] or "",
            "openReportsCount": r["open_reports_count"] or 0,
            "coordinates": [r["latitude"], r["longitude"]],
            "pathCoordinates": path_coords,
            "recommendedAction": r["recommended_action"] or "",
            "recommendationReason": r["recommendation_reason"] or "",
            "notes": r["notes"] or ""
        })
    return roads

@router.get("/{road_id}")
def get_road(road_id: str):
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM road_segments WHERE id = ?", (road_id,))
        r = cursor.fetchone()

    if not r:
        raise HTTPException(status_code=404, detail="Road segment not found")

    r = dict(r)
    path_coords = json.loads(r["path_coordinates"]) if r["path_coordinates"] else []
    return {
        "id": r["id"],
        "name": r["name"],
        "ward": r["ward"],
        "lengthKm": r["length_km"],
        "roadType": r["road_type"],
        "surfaceType": r["surface_type"],
        "currentCondition": r["current_condition"],
        "pciScore": r["pci_score"],
        "riskScore": int(r["risk_score"]),
        "priority": r["priority"],
        "trafficIntensity": r["traffic_intensity"],
        "weatherExposure": r["weather_exposure"],
        "lastInspectionDate": r["last_inspection_date"] or "",
        "nextInspectionDate": r["next_inspection_date"] or "",
        "lastMaintenanceDate": r["last_maintenance_date"] or "",
        "openReportsCount": r["open_reports_count"] or 0,
        "coordinates": [r["latitude"], r["longitude"]],
        "pathCoordinates": path_coords,
        "recommendedAction": r["recommended_action"] or "",
        "recommendationReason": r["recommendation_reason"] or "",
        "notes": r["notes"] or ""
    }
