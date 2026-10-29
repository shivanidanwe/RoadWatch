import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.app.database import db
from backend.app.recommendation.engine import RecommendationEngine

router = APIRouter(prefix="/reports", tags=["Reports"])

class CreateReportRequest(BaseModel):
    road_name: str = Field(..., min_length=2, description="Name of the road")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Geographic latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Geographic longitude")
    category: str = Field(..., description="Damage type: Pothole, Road crack, Surface damage, Waterlogging, Other")
    severity: str = Field(..., description="Severity level: Low, Medium, High, Critical")
    description: str = Field(..., min_length=3, description="Distress summary")
    image_url: Optional[str] = Field(default="", description="Optional image URL or path")
    reporter_name: Optional[str] = Field(default="Citizen", description="Reporter name")
    reporter_contact: Optional[str] = Field(default="", description="Reporter email or phone")
    source: Optional[str] = Field(default="Citizen App", description="Source of report")
    segment_id: Optional[str] = Field(default=None, description="Optional linked road segment ID")

class UpdateReportStatusRequest(BaseModel):
    status: str = Field(..., description="New status: Reported, Under Review, Inspection Scheduled, Maintenance Planned, Resolved")
    verified_by: Optional[str] = Field(default="Municipal Officer", description="Staff officer updating status")
    notes: Optional[str] = Field(default="", description="Inspection/action notes")

@router.get("")
def list_reports(
    search: Optional[str] = Query(None, description="Search by road name or ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100)
):
    with db.get_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM issue_reports WHERE 1=1"
        params = []

        if search:
            query += " AND (road_name LIKE ? OR id LIKE ? OR description LIKE ?)"
            s = f"%{search}%"
            params.extend([s, s, s])
        if category and category != "ALL":
            query += " AND category = ?"
            params.append(category)
        if severity and severity != "ALL":
            query += " AND severity = ?"
            params.append(severity)
        if status and status != "ALL":
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY report_date DESC"
        cursor.execute(query, params)
        rows = [dict(r) for r in cursor.fetchall()]

    reports = []
    for r in rows:
        hist = json.loads(r["status_history"]) if r.get("status_history") else []
        reports.append({
            "id": r["id"],
            "reportCode": r.get("report_code") or r["id"],
            "segmentId": r.get("segment_id") or "RD-AUTO",
            "roadName": r["road_name"],
            "category": r["category"],
            "severity": r["severity"],
            "source": r.get("source") or "Citizen App",
            "reportDate": r["report_date"],
            "status": r["status"],
            "priorityScore": float(r.get("priority_score") or 0.0),
            "priority": r.get("priority_level") or "Medium",
            "assignedTeam": r.get("assigned_team") or "Pending Assignment",
            "description": r.get("description") or "",
            "coordinates": [float(r["latitude"]), float(r["longitude"])],
            "imageUrl": r.get("image_url") or "",
            "reporterName": r.get("reporter_name") or "Citizen",
            "reporterContact": r.get("reporter_contact") or "",
            "verifiedBy": r.get("verified_by") or "",
            "statusHistory": hist
        })
    return reports

@router.get("/{report_id}")
def get_report(report_id: str):
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM issue_reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Issue report not found")

    r = dict(row)
    hist = json.loads(r["status_history"]) if r.get("status_history") else []
    return {
        "id": r["id"],
        "reportCode": r.get("report_code") or r["id"],
        "segmentId": r.get("segment_id") or "RD-AUTO",
        "roadName": r["road_name"],
        "category": r["category"],
        "severity": r["severity"],
        "source": r.get("source") or "Citizen App",
        "reportDate": r["report_date"],
        "status": r["status"],
        "priorityScore": float(r.get("priority_score") or 0.0),
        "priority": r.get("priority_level") or "Medium",
        "assignedTeam": r.get("assigned_team") or "",
        "description": r.get("description") or "",
        "coordinates": [float(r["latitude"]), float(r["longitude"])],
        "imageUrl": r.get("image_url") or "",
        "reporterName": r.get("reporter_name") or "Citizen",
        "reporterContact": r.get("reporter_contact") or "",
        "verifiedBy": r.get("verified_by") or "",
        "statusHistory": hist
    }

@router.post("", status_code=201)
def submit_report(req: CreateReportRequest):
    """
    Submits a new road distress report, persists it to the database,
    calculates maintenance priority urgency score, updates the road segment,
    and returns the saved record.
    """
    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d %H:%M")
    iso_now = now.isoformat()

    # Calculate Urgency Score based on transparent weights (Section 8)
    severity_map = {"Critical": 95.0, "High": 75.0, "Medium": 50.0, "Low": 25.0}
    category_map = {"Pothole": 85.0, "Waterlogging": 80.0, "Road crack": 65.0, "Surface damage": 60.0, "Other": 40.0}

    sev_val = severity_map.get(req.severity, 50.0)
    cat_val = category_map.get(req.category, 50.0)

    # 40% damage severity, 25% recent complaints, 15% traffic fallback, 10% weather, 10% age
    calculated_score = round(sev_val * 0.40 + cat_val * 0.25 + 60.0 * 0.15 + 50.0 * 0.10 + 50.0 * 0.10, 1)

    if calculated_score >= 80.0:
        priority_level = "Critical"
        recommended_action = "Urgent inspection"
    elif calculated_score >= 60.0:
        priority_level = "High"
        recommended_action = "Priority inspection"
    elif calculated_score >= 40.0:
        priority_level = "Medium"
        recommended_action = "Schedule inspection"
    else:
        priority_level = "Low"
        recommended_action = "Routine monitoring"

    explanation = (
        f"{priority_level} priority because the report indicates {req.severity.lower()} {req.category.lower()} "
        f"on {req.road_name}. Recommended next action: {recommended_action}."
    )

    with db.get_connection() as conn:
        cursor = conn.cursor()

        # Generate unique report ID
        cursor.execute("SELECT COUNT(*) as cnt FROM issue_reports")
        cnt = cursor.fetchone()["cnt"] + 1
        report_id = f"REP-2024-{str(cnt).padStart(3, '0') if hasattr(str, 'padStart') else str(cnt).zfill(3)}"

        # Find or create corresponding road segment
        segment_id = req.segment_id
        if not segment_id:
            cursor.execute("SELECT id FROM road_segments WHERE name = ? LIMIT 1", (req.road_name,))
            existing_seg = cursor.fetchone()
            if existing_seg:
                segment_id = existing_seg["id"]
            else:
                segment_id = f"RD-USR-{str(cnt).zfill(3)}"
                cursor.execute("""
                INSERT INTO road_segments (
                    id, name, ward, length_km, road_type, surface_type, current_condition,
                    pci_score, risk_score, priority, traffic_intensity, weather_exposure,
                    open_reports_count, latitude, longitude, path_coordinates,
                    recommended_action, recommendation_reason, notes, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    segment_id, req.road_name, "Municipal Ward", 2.0, "Collector", "Asphalt",
                    "Poor" if req.severity in ["Critical", "High"] else "Fair",
                    max(10.0, 100.0 - calculated_score), calculated_score, priority_level,
                    "Moderate", "Moderate", 1, req.latitude, req.longitude,
                    json.dumps([[req.latitude - 0.002, req.longitude - 0.002], [req.latitude, req.longitude], [req.latitude + 0.002, req.longitude + 0.002]]),
                    recommended_action, explanation, "User-reported road corridor", iso_now
                ))
        else:
            # Update existing segment reports count & risk
            cursor.execute("""
            UPDATE road_segments
            SET open_reports_count = open_reports_count + 1,
                risk_score = MAX(risk_score, ?),
                priority = CASE WHEN ? > risk_score THEN ? ELSE priority END,
                updated_at = ?
            WHERE id = ?
            """, (calculated_score, calculated_score, priority_level, iso_now, segment_id))

        status_history = json.dumps([
            {"status": "Reported", "timestamp": now_str, "updatedBy": req.source}
        ])

        # Insert into issue_reports
        cursor.execute("""
        INSERT INTO issue_reports (
            id, report_code, segment_id, road_name, category, severity, source,
            report_date, status, priority_score, priority_level, assigned_team,
            description, latitude, longitude, image_url, reporter_name,
            reporter_contact, verified_by, status_history, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report_id, report_id, segment_id, req.road_name, req.category, req.severity,
            req.source, now_str, "Reported", calculated_score, priority_level,
            "Rapid Assessment Team", req.description, req.latitude, req.longitude,
            req.image_url or "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
            req.reporter_name or "Citizen", req.reporter_contact or "", "",
            status_history, now_str, now_str
        ))

        # Insert into road_assessments
        cursor.execute("""
        INSERT INTO road_assessments (
            id, report_id, road_segment_id, urgency_score, risk_category,
            recommended_action, explanation, factors_json, assessment_method,
            model_version, assessed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"ASM-{report_id}", report_id, segment_id, calculated_score,
            priority_level, recommended_action, explanation,
            json.dumps({"severity": req.severity, "category": req.category, "urgency_score": calculated_score}),
            "Rule-based", "v2.4", iso_now
        ))

        conn.commit()

    return {
        "id": report_id,
        "reportCode": report_id,
        "segmentId": segment_id,
        "roadName": req.road_name,
        "category": req.category,
        "severity": req.severity,
        "source": req.source,
        "reportDate": now_str,
        "status": "Reported",
        "priorityScore": calculated_score,
        "priority": priority_level,
        "recommendedAction": recommended_action,
        "explanation": explanation,
        "assignedTeam": "Rapid Assessment Team",
        "description": req.description,
        "coordinates": [req.latitude, req.longitude],
        "imageUrl": req.image_url,
        "reporterName": req.reporter_name,
        "reporterContact": req.reporter_contact,
        "statusHistory": [{"status": "Reported", "timestamp": now_str, "updatedBy": req.source}]
    }

@router.patch("/{report_id}/status")
def update_report_status(report_id: str, req: UpdateReportStatusRequest):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM issue_reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Report not found")

        r = dict(row)
        hist = json.loads(r["status_history"]) if r.get("status_history") else []
        hist.append({
            "status": req.status,
            "timestamp": now_str,
            "updatedBy": req.verified_by or "Municipal Staff",
            "notes": req.notes or f"Status advanced to {req.status}"
        })

        cursor.execute("""
        UPDATE issue_reports
        SET status = ?, verified_by = ?, status_history = ?, updated_at = ?
        WHERE id = ?
        """, (req.status, req.verified_by, json.dumps(hist), now_str, report_id))

        conn.commit()

    return {
        "id": report_id,
        "status": req.status,
        "verifiedBy": req.verified_by,
        "updatedAt": now_str,
        "statusHistory": hist
    }
