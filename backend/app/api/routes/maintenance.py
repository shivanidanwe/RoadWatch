import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.app.database import db

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

class CreateMaintenanceRequest(BaseModel):
    segment_id: str = Field(..., description="Road segment ID")
    road_name: str = Field(..., description="Road name")
    ward: Optional[str] = Field(default="Municipal Ward", description="Ward name")
    title: str = Field(..., min_length=3, description="Work order title")
    maintenance_type: str = Field(default="Pothole Patching", description="Type of maintenance")
    priority: str = Field(default="High", description="Priority level")
    assigned_crew: str = Field(..., description="Assigned repair team")
    crew_leader: str = Field(..., description="Crew supervisor")
    estimated_cost: float = Field(default=0.0, ge=0.0, description="Estimated budget")
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    target_completion_date: str = Field(..., description="Target completion date")
    required_resources: Optional[List[str]] = Field(default=[], description="Equipment and materials")
    notes: Optional[str] = Field(default="", description="Scope notes")

class UpdateMaintenanceRequest(BaseModel):
    repair_status: Optional[str] = Field(None, description="Repair status: Pending, In Progress, Completed")
    inspection_status: Optional[str] = Field(None, description="Inspection status: Pending, In Progress, Completed")
    notes: Optional[str] = Field(None, description="Progress notes")
    actual_cost: Optional[float] = Field(None, ge=0.0, description="Actual incurred cost")

@router.get("")
def list_maintenance():
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM maintenance_records ORDER BY created_at DESC")
        rows = [dict(r) for r in cursor.fetchall()]

    result = []
    for r in rows:
        resources = []
        if r.get("required_resources"):
            try:
                resources = json.loads(r["required_resources"])
            except Exception:
                resources = [x.strip() for x in r["required_resources"].split(",") if x.strip()]

        result.append({
            "id": r["id"],
            "segmentId": r.get("road_segment_id") or "RD-AUTO",
            "reportId": r.get("report_id") or "",
            "roadName": r["road_name"],
            "ward": r.get("ward") or "Municipal Ward",
            "title": r["title"],
            "maintenanceType": r["maintenance_type"],
            "priority": r["priority"],
            "inspectionStatus": r.get("inspection_status") or "Pending",
            "repairStatus": r.get("repair_status") or "Pending",
            "status": r.get("repair_status") or "Pending",
            "assignedCrew": r.get("assigned_team") or "Pending Squad",
            "crewLeader": r.get("crew_leader") or "Supervisor",
            "estimatedCost": float(r.get("estimated_cost") or 0.0),
            "actualCost": float(r.get("actual_cost") or 0.0) if r.get("actual_cost") else None,
            "startDate": r.get("start_date") or "",
            "targetCompletionDate": r.get("target_completion_date") or "",
            "actualCompletionDate": r.get("actual_completion_date") or "",
            "requiredResources": resources,
            "notes": r.get("notes") or "",
            "justification": r.get("notes") or "Pavement condition requires engineering intervention.",
            "budgetStatus": r.get("budget_status") or "Within Allocation"
        })
    return result

@router.post("", status_code=201)
def create_maintenance(req: CreateMaintenanceRequest):
    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d %H:%M")

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM maintenance_records")
        cnt = cursor.fetchone()["cnt"] + 1
        mnt_id = f"MNT-2024-{str(cnt).zfill(3)}"

        cursor.execute("""
        INSERT INTO maintenance_records (
            id, road_segment_id, report_id, road_name, ward, title,
            maintenance_type, priority, inspection_status, repair_status,
            assigned_team, crew_leader, estimated_cost, start_date,
            target_completion_date, required_resources, notes,
            budget_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            mnt_id, req.segment_id, "", req.road_name, req.ward, req.title,
            req.maintenance_type, req.priority, "Pending", "In Progress",
            req.assigned_crew, req.crew_leader, req.estimated_cost, req.start_date,
            req.target_completion_date, json.dumps(req.required_resources), req.notes,
            "Within Allocation", now_str, now_str
        ))
        conn.commit()

    return {
        "id": mnt_id,
        "segmentId": req.segment_id,
        "roadName": req.road_name,
        "ward": req.ward,
        "title": req.title,
        "maintenanceType": req.maintenance_type,
        "priority": req.priority,
        "inspectionStatus": "Pending",
        "repairStatus": "In Progress",
        "status": "In Progress",
        "assignedCrew": req.assigned_crew,
        "crewLeader": req.crew_leader,
        "estimatedCost": req.estimated_cost,
        "startDate": req.start_date,
        "targetCompletionDate": req.target_completion_date,
        "requiredResources": req.required_resources,
        "notes": req.notes,
        "budgetStatus": "Within Allocation"
    }

@router.patch("/{maintenance_id}")
def update_maintenance(maintenance_id: str, req: UpdateMaintenanceRequest):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM maintenance_records WHERE id = ?", (maintenance_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Maintenance work order not found")

        r = dict(row)
        new_repair_status = req.repair_status or r.get("repair_status") or "Pending"
        new_insp_status = req.inspection_status or r.get("inspection_status") or "Pending"
        new_notes = req.notes or r.get("notes") or ""

        cursor.execute("""
        UPDATE maintenance_records
        SET repair_status = ?, inspection_status = ?, notes = ?, updated_at = ?
        WHERE id = ?
        """, (new_repair_status, new_insp_status, new_notes, now_str, maintenance_id))

        conn.commit()

    return {
        "id": maintenance_id,
        "repairStatus": new_repair_status,
        "inspectionStatus": new_insp_status,
        "status": new_repair_status,
        "notes": new_notes,
        "updatedAt": now_str
    }
