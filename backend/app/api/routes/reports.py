import json
import csv
import io
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Response, status
from pydantic import BaseModel, Field

from backend.app.database import db
from backend.app.recommendation.engine import RecommendationEngine

router = APIRouter(prefix="/reports", tags=["Reports"])

class CreateReportRequest(BaseModel):
    road_name: str = Field(..., min_length=2, description="Name of the road")
    area: Optional[str] = Field(default="Municipal Ward", description="Locality or ward")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Geographic latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Geographic longitude")
    category: str = Field(..., description="Damage type: Pothole, Road cracks, Surface damage, Waterlogging, Broken road, Other")
    severity: str = Field(..., description="Severity level: Low, Medium, High, Critical")
    description: str = Field(..., min_length=3, description="Distress summary")
    image_url: Optional[str] = Field(default="", description="Optional image URL or path")
    reporter_name: Optional[str] = Field(default="Citizen", description="Reporter name")
    reporter_contact: Optional[str] = Field(default="", description="Reporter email or phone")
    source: Optional[str] = Field(default="Citizen App", description="Source of report")
    segment_id: Optional[str] = Field(default=None, description="Optional linked road segment ID")

class UpdateReportStatusRequest(BaseModel):
    status: str = Field(..., description="New status: New, Reported, Under Review, Verified, Inspection Scheduled, Maintenance Planned, In Progress, Resolved, Rejected")
    verified_by: Optional[str] = Field(default="Municipal Authority Admin", description="Staff officer updating status")
    notes: Optional[str] = Field(default="", description="Inspection/action notes")

class VerificationRequest(BaseModel):
    verification_status: str = Field(..., description="Verified or Rejected")
    verified_by: Optional[str] = Field(default="Municipal Authority Admin", description="Verifying officer")
    notes: Optional[str] = Field(default="", description="Verification observation notes")
    rejection_reason: Optional[str] = Field(default="", description="Reason for rejection if applicable")

@router.get("")
def list_reports(
    search: Optional[str] = Query(None, description="Search by road name or ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    area: Optional[str] = Query(None, description="Filter by area/locality"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500)
):
    """
    Retrieves all road reports with filtering by road name, complaint ID, category,
    severity, area, date range, and status.
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM issue_reports WHERE 1=1"
        params = []

        if search:
            query += " AND (road_name LIKE ? OR id LIKE ? OR report_code LIKE ? OR description LIKE ?)"
            s = f"%{search}%"
            params.extend([s, s, s, s])
        if category and category != "ALL":
            query += " AND category = ?"
            params.append(category)
        if severity and severity != "ALL":
            query += " AND severity = ?"
            params.append(severity)
        if status and status != "ALL":
            query += " AND status = ?"
            params.append(status)
        if area and area != "ALL":
            query += " AND (area LIKE ? OR road_name LIKE ?)"
            a = f"%{area}%"
            params.extend([a, a])
        if start_date:
            query += " AND report_date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND report_date <= ?"
            params.append(f"{end_date} 23:59")

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
            "area": r.get("area") or "Municipal Ward",
            "category": r["category"],
            "severity": r["severity"],
            "source": r.get("source") or "Citizen Public Portal",
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
            "verificationStatus": r.get("verification_status") or "Unverified",
            "rejectionReason": r.get("rejection_reason") or "",
            "statusHistory": hist
        })
    return reports

@router.get("/export/csv")
def export_reports_csv():
    """
    Exports all current database road damage reports to CSV.
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM issue_reports ORDER BY report_date DESC")
        rows = [dict(r) for r in cursor.fetchall()]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Complaint ID", "Report Code", "Road Name", "Area", "Damage Type",
        "Severity", "Status", "Verification Status", "Urgency Score",
        "Priority", "Report Date", "Latitude", "Longitude",
        "Reporter Name", "Description", "Verified By"
    ])

    for r in rows:
        writer.writerow([
            r["id"],
            r.get("report_code") or r["id"],
            r["road_name"],
            r.get("area") or "",
            r["category"],
            r["severity"],
            r["status"],
            r.get("verification_status") or "Unverified",
            r.get("priority_score") or 0,
            r.get("priority_level") or "Medium",
            r["report_date"],
            r["latitude"],
            r["longitude"],
            r.get("reporter_name") or "",
            (r.get("description") or "").replace("\n", " "),
            r.get("verified_by") or ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=roadwatch_reports_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

@router.get("/{report_id}")
def get_report(report_id: str):
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM issue_reports WHERE id = ? OR report_code = ?", (report_id, report_id))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Issue report not found")

        r = dict(row)
        hist = json.loads(r["status_history"]) if r.get("status_history") else []

        cursor.execute("SELECT * FROM report_attachments WHERE report_id = ?", (r["id"],))
        attachments = [dict(a) for a in cursor.fetchall()]

    return {
        "id": r["id"],
        "reportCode": r.get("report_code") or r["id"],
        "segmentId": r.get("segment_id") or "RD-AUTO",
        "roadName": r["road_name"],
        "area": r.get("area") or "Municipal Ward",
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
        "verificationStatus": r.get("verification_status") or "Unverified",
        "rejectionReason": r.get("rejection_reason") or "",
        "attachments": attachments,
        "statusHistory": hist
    }

@router.post("", status_code=201)
def submit_report(req: CreateReportRequest):
    """
    Legacy and admin submission endpoint.
    """
    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d %H:%M")
    iso_now = now.isoformat()

    severity_map = {"Critical": 95.0, "High": 75.0, "Medium": 50.0, "Low": 25.0}
    category_map = {"Pothole": 85.0, "Broken road": 85.0, "Waterlogging": 80.0, "Road cracks": 65.0, "Surface damage": 60.0, "Other": 40.0}

    sev_val = severity_map.get(req.severity, 50.0)
    cat_val = category_map.get(req.category, 50.0)

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

        cursor.execute("SELECT COUNT(*) as cnt FROM issue_reports")
        cnt = cursor.fetchone()["cnt"] + 1
        report_id = f"RW-2026-{str(cnt).zfill(4)}"

        segment_id = req.segment_id
        if not segment_id:
            cursor.execute("SELECT id FROM road_segments WHERE LOWER(name) = LOWER(?) LIMIT 1", (req.road_name.strip(),))
            existing_seg = cursor.fetchone()
            if existing_seg:
                segment_id = existing_seg["id"]
            else:
                segment_id = f"RD-AUTO-{str(cnt).zfill(4)}"
                cursor.execute("""
                INSERT INTO road_segments (
                    id, name, ward, length_km, road_type, surface_type, current_condition,
                    pci_score, risk_score, priority, traffic_intensity, weather_exposure,
                    open_reports_count, latitude, longitude, path_coordinates,
                    recommended_action, recommendation_reason, notes, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    segment_id, req.road_name, req.area or "Municipal Ward", 2.0, "Collector", "Asphalt",
                    "Poor" if req.severity in ["Critical", "High"] else "Fair",
                    max(10.0, 100.0 - calculated_score), calculated_score, priority_level,
                    "Moderate", "Moderate", 1, req.latitude, req.longitude,
                    json.dumps([[req.latitude - 0.002, req.longitude - 0.002], [req.latitude, req.longitude], [req.latitude + 0.002, req.longitude + 0.002]]),
                    recommended_action, explanation, "Reported road corridor", iso_now
                ))
        else:
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

        cursor.execute("""
        INSERT INTO issue_reports (
            id, report_code, segment_id, road_name, area, category, severity, source,
            report_date, status, priority_score, priority_level, assigned_team,
            description, latitude, longitude, image_url, reporter_name,
            reporter_contact, verified_by, verification_status, rejection_reason,
            status_history, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report_id, report_id, segment_id, req.road_name, req.area or "Municipal Ward",
            req.category, req.severity, req.source, now_str, "Reported", calculated_score,
            priority_level, "Rapid Assessment Team", req.description, req.latitude,
            req.longitude, req.image_url or "", req.reporter_name or "Citizen",
            req.reporter_contact or "", "", "Unverified", "",
            status_history, now_str, now_str
        ))

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
        "area": req.area or "Municipal Ward",
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
        cursor.execute("SELECT * FROM issue_reports WHERE id = ? OR report_code = ?", (report_id, report_id))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Report not found")

        r = dict(row)
        real_id = r["id"]
        hist = json.loads(r["status_history"]) if r.get("status_history") else []
        hist.append({
            "status": req.status,
            "timestamp": now_str,
            "updatedBy": req.verified_by or "Municipal Authority Admin",
            "notes": req.notes or f"Status advanced to {req.status}"
        })

        cursor.execute("""
        UPDATE issue_reports
        SET status = ?, verified_by = ?, status_history = ?, updated_at = ?
        WHERE id = ?
        """, (req.status, req.verified_by, json.dumps(hist), now_str, real_id))

        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user, action, details)
        VALUES (?, ?, ?, ?, ?)
        """, (
            f"LOG-{uuid.uuid4().hex[:12]}",
            now_str,
            req.verified_by or "Municipal Authority Admin",
            "STATUS_UPDATED",
            f"Report {real_id} status updated to {req.status}"
        ))

        conn.commit()

    return {
        "id": real_id,
        "status": req.status,
        "verifiedBy": req.verified_by,
        "updatedAt": now_str,
        "statusHistory": hist
    }

@router.patch("/{report_id}/verification")
def verify_or_reject_report(report_id: str, req: VerificationRequest):
    """
    Municipal Authority Admin verifies or rejects a citizen report.
    """
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    is_verified = req.verification_status.lower() == "verified"
    new_status = "Verified" if is_verified else "Rejected"

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM issue_reports WHERE id = ? OR report_code = ?", (report_id, report_id))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Report not found")

        r = dict(row)
        real_id = r["id"]
        hist = json.loads(r["status_history"]) if r.get("status_history") else []
        hist.append({
            "status": new_status,
            "timestamp": now_str,
            "updatedBy": req.verified_by or "Municipal Authority Admin",
            "notes": req.notes or f"Report {req.verification_status.lower()}: {req.rejection_reason or 'Validation completed'}"
        })

        cursor.execute("""
        UPDATE issue_reports
        SET verification_status = ?, rejection_reason = ?, status = ?,
            verified_by = ?, status_history = ?, updated_at = ?
        WHERE id = ?
        """, (
            req.verification_status,
            req.rejection_reason if not is_verified else "",
            new_status,
            req.verified_by,
            json.dumps(hist),
            now_str,
            real_id
        ))

        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user, action, details)
        VALUES (?, ?, ?, ?, ?)
        """, (
            f"LOG-{uuid.uuid4().hex[:12]}",
            now_str,
            req.verified_by or "Municipal Authority Admin",
            "REPORT_VERIFICATION",
            f"Report {real_id} marked as {req.verification_status}. Reason: {req.rejection_reason or 'Approved'}"
        ))

        conn.commit()

    return {
        "id": real_id,
        "verificationStatus": req.verification_status,
        "status": new_status,
        "verifiedBy": req.verified_by,
        "rejectionReason": req.rejection_reason,
        "updatedAt": now_str,
        "statusHistory": hist
    }
