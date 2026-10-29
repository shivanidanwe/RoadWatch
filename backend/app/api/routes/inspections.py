import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.app.database import db

router = APIRouter(prefix="/inspections", tags=["Inspections"])

class CreateInspectionRequest(BaseModel):
    segment_id: str = Field(..., description="Road segment ID")
    road_name: str = Field(..., description="Road name")
    ward: Optional[str] = Field(default="Municipal Ward", description="Ward name")
    assigned_inspector: str = Field(..., description="Inspector name")
    inspector_role: Optional[str] = Field(default="Field Inspector", description="Role of inspector")
    scheduled_date: str = Field(..., description="Scheduled date (YYYY-MM-DD)")
    type: str = Field(default="Routine", description="Inspection type")
    priority: str = Field(default="Medium", description="Priority level: Critical, High, Medium, Low")
    notes: Optional[str] = Field(default="", description="Preparation notes")

class UpdateInspectionProgressRequest(BaseModel):
    status: str = Field(..., description="Status: Scheduled, In Progress, Completed, Reviewed")
    notes: Optional[str] = Field(default="", description="Field notes")
    findings: Optional[Dict[str, Any]] = Field(default=None, description="Detailed findings")

@router.get("")
def list_inspections():
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM inspections ORDER BY scheduled_date ASC")
        rows = [dict(r) for r in cursor.fetchall()]

    result = []
    for r in rows:
        findings = json.loads(r["findings"]) if r.get("findings") else None
        result.append({
            "id": r["id"],
            "segmentId": r["segment_id"],
            "roadName": r["road_name"],
            "ward": r["ward"],
            "assignedInspector": r["assigned_inspector"],
            "inspectorRole": r["inspector_role"],
            "scheduledDate": r["scheduled_date"],
            "type": r["type"],
            "priority": r["priority"],
            "status": r["status"],
            "notes": r.get("notes") or "",
            "findings": findings
        })
    return result

@router.post("", status_code=201)
def create_inspection(req: CreateInspectionRequest):
    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d %H:%M")

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM inspections")
        cnt = cursor.fetchone()["cnt"] + 1
        insp_id = f"INSP-2024-{str(cnt).zfill(3)}"

        cursor.execute("""
        INSERT INTO inspections (
            id, segment_id, road_name, ward, assigned_inspector, inspector_role,
            scheduled_date, type, priority, status, notes, findings, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            insp_id, req.segment_id, req.road_name, req.ward, req.assigned_inspector,
            req.inspector_role, req.scheduled_date, req.type, req.priority,
            "Scheduled", req.notes, None, now_str
        ))
        conn.commit()

    return {
        "id": insp_id,
        "segmentId": req.segment_id,
        "roadName": req.road_name,
        "ward": req.ward,
        "assignedInspector": req.assigned_inspector,
        "inspectorRole": req.inspector_role,
        "scheduledDate": req.scheduled_date,
        "type": req.type,
        "priority": req.priority,
        "status": "Scheduled",
        "notes": req.notes,
        "findings": None
    }

@router.patch("/{inspection_id}")
def update_inspection(inspection_id: str, req: UpdateInspectionProgressRequest):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM inspections WHERE id = ?", (inspection_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Inspection record not found")

        r = dict(row)
        current_findings = json.loads(r["findings"]) if r.get("findings") else {}
        if req.findings:
            current_findings.update(req.findings)

        cursor.execute("""
        UPDATE inspections
        SET status = ?, notes = ?, findings = ?
        WHERE id = ?
        """, (
            req.status,
            req.notes or r.get("notes") or "",
            json.dumps(current_findings) if current_findings else None,
            inspection_id
        ))
        conn.commit()

    return {
        "id": inspection_id,
        "status": req.status,
        "notes": req.notes or r.get("notes") or "",
        "findings": current_findings,
        "updatedAt": now_str
    }
