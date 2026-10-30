import json
import uuid
import secrets
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, Field

from backend.app.config import config
from backend.app.database import db

router = APIRouter(prefix="/public", tags=["Public Citizen Portal"])

class PublicReportSubmission(BaseModel):
    road_name: str = Field(..., min_length=2, description="Name or identifier of the road")
    area: str = Field(..., min_length=2, description="Locality, neighborhood, or municipal ward")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Geographic latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Geographic longitude")
    category: str = Field(..., description="Damage type: Pothole, Road cracks, Surface damage, Waterlogging, Broken road, Other")
    severity: str = Field(..., description="Severity level: Low, Medium, High, Critical")
    description: str = Field(..., min_length=5, description="Detailed description of road distress")
    image_url: Optional[str] = Field(default="", description="Photo attachment URL or path")
    reporter_name: Optional[str] = Field(default="Anonymous Citizen", description="Citizen reporter name")
    reporter_contact: Optional[str] = Field(default="", description="Optional phone or email for status alerts")

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/upload")
async def upload_road_photograph(file: UploadFile = File(...)):
    """
    Securely uploads a road distress photograph from a citizen or inspector.
    Validates file extension, MIME type, and size.
    """
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Allowed formats: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image MIME type."
        )

    config.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    unique_filename = f"road_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{secrets.token_hex(4)}{ext}"
    dest_path = config.UPLOADS_DIR / unique_filename

    # Read and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum permissible size of 10 MB."
        )

    with open(dest_path, "wb") as f:
        f.write(contents)

    file_url = f"/uploads/{unique_filename}"
    return {
        "success": True,
        "file_url": file_url,
        "file_name": unique_filename,
        "size_bytes": len(contents)
    }

@router.post("/reports", status_code=status.HTTP_201_CREATED)
def submit_public_report(req: PublicReportSubmission):
    """
    Public Citizen Road Damage Report Submission.
    - Generates unique complaint reference ID (e.g., RW-2026-XXXX)
    - Validates all input data
    - Saves submission timestamp and exact coordinates
    - Computes explainable urgency score based on configured municipal weights
    - Sets initial status to 'New' and verification to 'Unverified'
    - Immediately makes complaint visible in the Admin Dashboard
    """
    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d %H:%M")
    iso_now = now.isoformat()

    # Generate unique complaint ID: RW-2026-XXXX
    complaint_code = f"RW-2026-{secrets.randbelow(9000) + 1000}"

    # Calculate Explainable Recommendation Urgency Score (0 to 100)
    severity_weights = {"Critical": 100.0, "High": 80.0, "Medium": 50.0, "Low": 25.0}
    category_weights = {
        "Pothole": 90.0,
        "Broken road": 95.0,
        "Waterlogging": 85.0,
        "Road cracks": 70.0,
        "Surface damage": 65.0,
        "Other": 45.0
    }

    sev_score = severity_weights.get(req.severity, 50.0)
    cat_score = category_weights.get(req.category, 50.0)

    traffic_fallback = 75.0 if req.severity in ["Critical", "High"] else (35.0 if req.severity == "Low" else 55.0)
    weather_fallback = 70.0 if req.category in ["Waterlogging", "Pothole"] else (35.0 if req.severity == "Low" else 50.0)
    time_since_repair_fallback = 35.0 if req.severity == "Low" else 60.0
    deterioration_fallback = 35.0 if req.severity == "Low" else 60.0

    # 30% damage severity, 20% report impact, 15% traffic, 15% weather, 10% age, 10% deterioration
    urgency_score = round(
        sev_score * 0.30 +
        cat_score * 0.20 +
        traffic_fallback * 0.15 +
        weather_fallback * 0.15 +
        time_since_repair_fallback * 0.10 +
        deterioration_fallback * 0.10,
        1
    )

    if urgency_score >= 80.0:
        priority_category = "Critical"
        recommended_action = "Immediate physical barrier & emergency patch repair dispatch"
    elif urgency_score >= 60.0:
        priority_category = "High"
        recommended_action = "Priority engineering inspection within 24–48 hours"
    elif urgency_score >= 40.0:
        priority_category = "Medium"
        recommended_action = "Schedule routine field validation & seasonal maintenance"
    else:
        priority_category = "Low"
        recommended_action = "Monitor condition during scheduled corridor patrol"

    reasons = [
        f"Citizen reported {req.severity.lower()} severity {req.category.lower()} on {req.road_name}.",
        f"Locality: {req.area}.",
        f"Initial automated distress score computed at {urgency_score}/100."
    ]
    explanation = " ".join(reasons)

    with db.get_connection() as conn:
        cursor = conn.cursor()

        # Find or create corresponding road segment
        cursor.execute("SELECT id FROM road_segments WHERE LOWER(name) = LOWER(?) LIMIT 1", (req.road_name.strip(),))
        existing_seg = cursor.fetchone()

        if existing_seg:
            segment_id = existing_seg["id"]
            cursor.execute("""
            UPDATE road_segments
            SET open_reports_count = open_reports_count + 1,
                risk_score = MAX(risk_score, ?),
                priority = CASE WHEN ? > risk_score THEN ? ELSE priority END,
                updated_at = ?
            WHERE id = ?
            """, (urgency_score, urgency_score, priority_category, iso_now, segment_id))
        else:
            segment_id = f"RD-CITIZEN-{secrets.randbelow(9000) + 1000}"
            cursor.execute("""
            INSERT INTO road_segments (
                id, name, ward, length_km, road_type, surface_type, current_condition,
                pci_score, risk_score, priority, traffic_intensity, weather_exposure,
                open_reports_count, latitude, longitude, path_coordinates,
                recommended_action, recommendation_reason, notes, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                segment_id, req.road_name.strip(), req.area.strip(), 1.5, "Collector", "Asphalt",
                "Critical" if req.severity == "Critical" else ("Poor" if req.severity == "High" else "Fair"),
                max(10.0, 100.0 - urgency_score), urgency_score, priority_category,
                "Moderate", "Moderate", 1, req.latitude, req.longitude,
                json.dumps([[req.latitude - 0.001, req.longitude - 0.001], [req.latitude, req.longitude], [req.latitude + 0.001, req.longitude + 0.001]]),
                recommended_action, explanation, "Citizen registered corridor", iso_now
            ))

        initial_history = json.dumps([
            {
                "status": "New",
                "timestamp": now_str,
                "updatedBy": "Citizen Portal",
                "notes": "Citizen report registered in municipal dispatch queue."
            }
        ])

        # Insert into issue_reports
        cursor.execute("""
        INSERT INTO issue_reports (
            id, report_code, segment_id, road_name, area, category, severity, source,
            report_date, status, priority_score, priority_level, assigned_team,
            description, latitude, longitude, image_url, reporter_name,
            reporter_contact, verified_by, verification_status, rejection_reason,
            status_history, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            complaint_code, complaint_code, segment_id, req.road_name.strip(), req.area.strip(),
            req.category, req.severity, "Citizen Public Portal", now_str, "New",
            urgency_score, priority_category, "Municipal Maintenance Squad",
            req.description.strip(), req.latitude, req.longitude, req.image_url or "",
            req.reporter_name.strip() if req.reporter_name else "Citizen",
            req.reporter_contact.strip() if req.reporter_contact else "",
            "", "Unverified", "", initial_history, now_str, now_str
        ))

        # Insert into road_assessments
        cursor.execute("""
        INSERT INTO road_assessments (
            id, report_id, road_segment_id, urgency_score, risk_category,
            recommended_action, explanation, factors_json, assessment_method,
            model_version, assessed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"ASM-{complaint_code}", complaint_code, segment_id, urgency_score,
            priority_category, recommended_action, explanation,
            json.dumps({
                "damage_severity": sev_score,
                "category_weight": cat_score,
                "urgency_score": urgency_score,
                "area": req.area
            }),
            "Municipal Recommendation Engine (Rule-based)", "v2.4", iso_now
        ))

        # If image was uploaded, store attachment
        if req.image_url:
            cursor.execute("""
            INSERT INTO report_attachments (
                id, report_id, file_name, file_path, file_type, file_size, uploaded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                f"ATT-{secrets.randbelow(90000) + 10000}",
                complaint_code,
                Path(req.image_url).name,
                req.image_url,
                "image",
                0,
                now_str
            ))

        # Insert audit log
        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user, action, details)
        VALUES (?, ?, ?, ?, ?)
        """, (
            f"LOG-{uuid.uuid4().hex[:12]}",
            now_str,
            "Citizen Public Portal",
            "CITIZEN_REPORT_SUBMITTED",
            f"Complaint {complaint_code} filed for {req.road_name} ({req.category}, {req.severity})"
        ))

        conn.commit()

    return {
        "success": True,
        "complaintId": complaint_code,
        "roadName": req.road_name,
        "area": req.area,
        "category": req.category,
        "severity": req.severity,
        "status": "New",
        "priority": priority_category,
        "urgencyScore": urgency_score,
        "recommendedAction": recommended_action,
        "submissionTime": now_str,
        "coordinates": [req.latitude, req.longitude],
        "message": f"Your road damage report has been registered successfully. Reference ID: {complaint_code}."
    }

@router.get("/reports/{complaint_id}")
def track_public_report(complaint_id: str):
    """
    Public endpoint for citizens to track the status of their complaint
    using their Complaint Reference ID (e.g. RW-2026-XXXX).
    Exposes only non-sensitive public complaint status.
    """
    clean_id = complaint_id.strip()

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, report_code, road_name, area, category, severity, status,
               verification_status, report_date, updated_at, description,
               image_url, status_history
        FROM issue_reports
        WHERE LOWER(id) = LOWER(?) OR LOWER(report_code) = LOWER(?)
        LIMIT 1
        """, (clean_id, clean_id))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No complaint record found matching Reference ID '{complaint_id}'. Please check the number and retry."
        )

    r = dict(row)
    history = json.loads(r["status_history"]) if r.get("status_history") else []

    # Map status to citizen-friendly public message
    status_explanations = {
        "New": "Your complaint has been received and logged into the municipal queue.",
        "Reported": "Your complaint is registered and queued for officer review.",
        "Under Review": "A Municipal Authority Officer is currently reviewing the reported distress.",
        "Verified": "The reported damage has been verified by municipal inspection officers.",
        "Inspection Scheduled": "An engineering inspection crew has been scheduled for on-site assessment.",
        "Maintenance Planned": "A repair work order has been created and assigned to the maintenance squad.",
        "In Progress": "Active physical repair work is currently underway at the location.",
        "Resolved": "The road repair has been successfully completed and inspected.",
        "Rejected": "The complaint was evaluated and could not be verified or was duplicate."
    }

    return {
        "complaintId": r.get("report_code") or r["id"],
        "roadName": r["road_name"],
        "area": r.get("area") or "Municipal Ward",
        "category": r["category"],
        "severity": r["severity"],
        "status": r["status"],
        "verificationStatus": r.get("verification_status") or "Unverified",
        "reportDate": r["report_date"],
        "lastUpdated": r.get("updated_at") or r["report_date"],
        "description": r.get("description") or "",
        "imageUrl": r.get("image_url") or "",
        "statusMessage": status_explanations.get(r["status"], f"Status: {r['status']}"),
        "timeline": [
            {
                "status": h.get("status"),
                "timestamp": h.get("timestamp"),
                "notes": h.get("notes") or h.get("status")
            }
            for h in history
        ]
    }
