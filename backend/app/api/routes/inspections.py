import json
import secrets
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.app.database import db

router = APIRouter(prefix="/inspections", tags=["Inspections"])

class CreateInspectionRequest(BaseModel):
    segment_id: Optional[str] = Field(default="RD-AUTO", description="Road segment ID")
    report_id: Optional[str] = Field(default="", description="Optional linked citizen road report ID")
    road_name: str = Field(..., description="Road name")
    ward: Optional[str] = Field(default="Municipal Ward", description="Ward/Area name")
    assigned_inspector: str = Field(default="Municipal Authority Admin", description="Assigned officer name")
    inspector_role: Optional[str] = Field(default="Municipal Inspection Officer", description="Role of inspector")
    scheduled_date: str = Field(..., description="Scheduled date (YYYY-MM-DD)")
    type: str = Field(default="Routine", description="Inspection type: Routine, Emergency, Damage Verification, Structural")
    priority: str = Field(default="Medium", description="Priority level: Critical, High, Medium, Low")
    notes: Optional[str] = Field(default="", description="Preparation notes")
    verified_condition: Optional[str] = Field(default=None, description="Initial assessed condition: Critical, Poor, Fair, Good")
    photos: Optional[List[str]] = Field(default=[], description="Photo attachment URLs")

class UpdateInspectionProgressRequest(BaseModel):
    status: str = Field(..., description="Status: Scheduled, In Progress, Completed, Cancelled")
    verified_condition: Optional[str] = Field(default=None, description="Verified road condition: Critical, Poor, Fair, Good")
    notes: Optional[str] = Field(default="", description="Field observation notes")
    findings: Optional[Dict[str, Any]] = Field(default=None, description="Detailed engineering findings")
    photos: Optional[List[str]] = Field(default=None, description="Inspection photographs")

@router.get("")
def list_inspections():
    """
    Lists all road inspections from the database.
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM inspections ORDER BY scheduled_date ASC")
        rows = [dict(r) for r in cursor.fetchall()]

    result = []
    for r in rows:
        findings = json.loads(r["findings"]) if r.get("findings") else None
        photos = json.loads(r["photos_json"]) if r.get("photos_json") else []
        result.append({
            "id": r["id"],
            "segmentId": r["segment_id"],
            "reportId": r.get("report_id") or "",
            "roadName": r["road_name"],
            "ward": r.get("ward") or "Municipal Ward",
            "assignedInspector": r["assigned_inspector"],
            "inspectorRole": r["inspector_role"],
            "scheduledDate": r["scheduled_date"],
            "type": r["type"],
            "priority": r["priority"],
            "status": r["status"],
            "verifiedCondition": r.get("verified_condition") or "Fair",
            "notes": r.get("notes") or "",
            "findings": findings,
            "photos": photos,
            "createdAt": r.get("created_at") or ""
        })
    return result

@router.post("", status_code=status.HTTP_201_CREATED)
def create_inspection(req: CreateInspectionRequest):
    """
    Municipal Authority Admin schedules and creates a new road inspection record.
    Optionally links to an existing citizen complaint.
    """
    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d %H:%M")
    insp_id = f"INSP-2026-{secrets.randbelow(9000) + 1000}"

    with db.get_connection() as conn:
        cursor = conn.cursor()

        # If segment_id not provided, try to find matching segment
        seg_id = req.segment_id
        if not seg_id or seg_id == "RD-AUTO":
            cursor.execute("SELECT id FROM road_segments WHERE LOWER(name) = LOWER(?) LIMIT 1", (req.road_name.strip(),))
            seg_row = cursor.fetchone()
            if seg_row:
                seg_id = seg_row["id"]
            else:
                seg_id = f"RD-INSP-{secrets.randbelow(9000) + 1000}"

        photos_json = json.dumps(req.photos) if req.photos else "[]"

        cursor.execute("""
        INSERT INTO inspections (
            id, segment_id, report_id, road_name, ward, assigned_inspector,
            inspector_role, scheduled_date, type, priority, status,
            verified_condition, notes, findings, photos_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            insp_id, seg_id, req.report_id or "", req.road_name, req.ward or "Municipal Ward",
            req.assigned_inspector, req.inspector_role or "Municipal Authority Admin",
            req.scheduled_date, req.type, req.priority, "Scheduled",
            req.verified_condition or "Fair", req.notes, None, photos_json,
            now_str, now_str
        ))

        # If linked to a report, update report status to "Inspection Scheduled"
        if req.report_id:
            cursor.execute("SELECT status_history FROM issue_reports WHERE id = ? OR report_code = ?", (req.report_id, req.report_id))
            rep_row = cursor.fetchone()
            if rep_row:
                hist = json.loads(rep_row["status_history"]) if rep_row["status_history"] else []
                hist.append({
                    "status": "Inspection Scheduled",
                    "timestamp": now_str,
                    "updatedBy": req.assigned_inspector,
                    "notes": f"Inspection {insp_id} scheduled for {req.scheduled_date}"
                })
                cursor.execute("""
                UPDATE issue_reports
                SET status = 'Inspection Scheduled', status_history = ?, updated_at = ?
                WHERE id = ? OR report_code = ?
                """, (json.dumps(hist), now_str, req.report_id, req.report_id))

        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user, action, details)
        VALUES (?, ?, ?, ?, ?)
        """, (
            f"LOG-{uuid.uuid4().hex[:12]}",
            now_str,
            req.assigned_inspector,
            "INSPECTION_CREATED",
            f"Scheduled inspection {insp_id} for {req.road_name} on {req.scheduled_date}"
        ))

        conn.commit()

    return {
        "id": insp_id,
        "segmentId": seg_id,
        "reportId": req.report_id or "",
        "roadName": req.road_name,
        "ward": req.ward or "Municipal Ward",
        "assignedInspector": req.assigned_inspector,
        "inspectorRole": req.inspector_role,
        "scheduledDate": req.scheduled_date,
        "type": req.type,
        "priority": req.priority,
        "status": "Scheduled",
        "verifiedCondition": req.verified_condition or "Fair",
        "notes": req.notes,
        "photos": req.photos or [],
        "findings": None
    }

@router.patch("/{inspection_id}")
def update_inspection(inspection_id: str, req: UpdateInspectionProgressRequest):
    """
    Updates inspection progress, notes, verified condition, and marks status.
    """
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM inspections WHERE id = ?", (inspection_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Inspection not found")

        curr = dict(row)
        photos_json = json.dumps(req.photos) if req.photos is not None else curr.get("photos_json")
        findings_json = json.dumps(req.findings) if req.findings is not None else curr.get("findings")
        verified_cond = req.verified_condition or curr.get("verified_condition")

        cursor.execute("""
        UPDATE inspections
        SET status = ?, verified_condition = ?, notes = ?, findings = ?,
            photos_json = ?, updated_at = ?
        WHERE id = ?
        """, (
            req.status,
            verified_cond,
            req.notes if req.notes else curr.get("notes"),
            findings_json,
            photos_json,
            now_str,
            inspection_id
        ))

        # If completed and linked to a report, update the report's verification and status
        if req.status == "Completed" and curr.get("report_id"):
            rep_id = curr["report_id"]
            cursor.execute("SELECT status_history FROM issue_reports WHERE id = ? OR report_code = ?", (rep_id, rep_id))
            rep_row = cursor.fetchone()
            if rep_row:
                hist = json.loads(rep_row["status_history"]) if rep_row["status_history"] else []
                hist.append({
                    "status": "Verified",
                    "timestamp": now_str,
                    "updatedBy": curr["assigned_inspector"],
                    "notes": f"Inspection {inspection_id} completed. Road condition verified as {verified_cond}."
                })
                cursor.execute("""
                UPDATE issue_reports
                SET verification_status = 'Verified', status = 'Verified', status_history = ?, updated_at = ?
                WHERE id = ? OR report_code = ?
                """, (json.dumps(hist), now_str, rep_id, rep_id))

        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user, action, details)
        VALUES (?, ?, ?, ?, ?)
        """, (
            f"LOG-{uuid.uuid4().hex[:12]}",
            now_str,
            curr["assigned_inspector"],
            "INSPECTION_UPDATED",
            f"Inspection {inspection_id} updated to status {req.status} (Condition: {verified_cond})"
        ))

        conn.commit()

    return {
        "id": inspection_id,
        "status": req.status,
        "verifiedCondition": verified_cond,
        "notes": req.notes,
        "updatedAt": now_str
    }
