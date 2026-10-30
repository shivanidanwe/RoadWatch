import json
import secrets
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.app.database import db

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

class CreateMaintenanceRequest(BaseModel):
    segment_id: Optional[str] = Field(default="RD-AUTO", description="Road segment ID")
    report_id: Optional[str] = Field(default="", description="Optional linked citizen road report ID")
    road_name: str = Field(..., description="Road name")
    ward: Optional[str] = Field(default="Municipal Ward", description="Ward name")
    title: str = Field(..., min_length=3, description="Work order title")
    description: Optional[str] = Field(default="", description="Repair scope and description")
    maintenance_type: str = Field(default="Pothole Patching", description="Type of maintenance")
    priority: str = Field(default="High", description="Priority level: Critical, High, Medium, Low")
    assigned_crew: str = Field(default="Municipal Rapid Repair Squad", description="Assigned repair team")
    crew_leader: str = Field(default="Municipal Maintenance Supervisor", description="Crew supervisor")
    estimated_cost: float = Field(default=0.0, ge=0.0, description="Estimated budget in currency")
    start_date: str = Field(..., description="Planned start date (YYYY-MM-DD)")
    target_completion_date: str = Field(..., description="Expected target completion date")
    required_resources: Optional[List[str]] = Field(default=[], description="Equipment and materials")
    notes: Optional[str] = Field(default="", description="Scope and engineering notes")
    before_photos: Optional[List[str]] = Field(default=[], description="Pre-repair condition photos")

class UpdateMaintenanceRequest(BaseModel):
    repair_status: Optional[str] = Field(None, description="Repair status: Pending, Approved, Scheduled, In Progress, Completed, On Hold")
    inspection_status: Optional[str] = Field(None, description="Inspection status: Pending, In Progress, Completed")
    notes: Optional[str] = Field(None, description="Repair progress and engineering notes")
    actual_cost: Optional[float] = Field(None, ge=0.0, description="Actual recorded repair expenditure")
    actual_completion_date: Optional[str] = Field(None, description="Actual completion date (YYYY-MM-DD)")
    before_photos: Optional[List[str]] = Field(None, description="Updated pre-repair photographs")
    after_photos: Optional[List[str]] = Field(None, description="Post-repair completion photographs")

@router.get("")
def list_maintenance():
    """
    Lists all maintenance and repair activities from the database.
    """
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

        before_photos = []
        if r.get("before_photos_json"):
            try:
                before_photos = json.loads(r["before_photos_json"])
            except Exception:
                before_photos = []

        after_photos = []
        if r.get("after_photos_json"):
            try:
                after_photos = json.loads(r["after_photos_json"])
            except Exception:
                after_photos = []

        result.append({
            "id": r["id"],
            "segmentId": r.get("road_segment_id") or "RD-AUTO",
            "reportId": r.get("report_id") or "",
            "roadName": r["road_name"],
            "ward": r.get("ward") or "Municipal Ward",
            "title": r["title"],
            "description": r.get("description") or r["title"],
            "maintenanceType": r["maintenance_type"],
            "priority": r["priority"],
            "inspectionStatus": r.get("inspection_status") or "Pending",
            "repairStatus": r.get("repair_status") or "Pending",
            "status": r.get("repair_status") or "Pending",
            "assignedCrew": r.get("assigned_team") or "Municipal Rapid Repair Squad",
            "crewLeader": r.get("crew_leader") or "Municipal Maintenance Supervisor",
            "estimatedCost": float(r.get("estimated_cost") or 0.0),
            "actualCost": float(r.get("actual_cost") or 0.0) if r.get("actual_cost") is not None else None,
            "startDate": r.get("start_date") or "",
            "targetCompletionDate": r.get("target_completion_date") or "",
            "actualCompletionDate": r.get("actual_completion_date") or "",
            "requiredResources": resources,
            "beforePhotos": before_photos,
            "afterPhotos": after_photos,
            "notes": r.get("notes") or "",
            "justification": r.get("notes") or "Pavement condition requires municipal engineering intervention.",
            "budgetStatus": r.get("budget_status") or "Within Allocation",
            "createdAt": r.get("created_at") or ""
        })
    return result

@router.post("", status_code=status.HTTP_201_CREATED)
def create_maintenance(req: CreateMaintenanceRequest):
    """
    Municipal Authority Admin schedules and creates a road maintenance/repair work order.
    """
    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d %H:%M")
    mnt_id = f"MNT-2026-{secrets.randbelow(9000) + 1000}"

    with db.get_connection() as conn:
        cursor = conn.cursor()

        seg_id = req.segment_id
        if not seg_id or seg_id == "RD-AUTO":
            cursor.execute("SELECT id FROM road_segments WHERE LOWER(name) = LOWER(?) LIMIT 1", (req.road_name.strip(),))
            seg_row = cursor.fetchone()
            if seg_row:
                seg_id = seg_row["id"]
            else:
                seg_id = f"RD-MNT-{secrets.randbelow(9000) + 1000}"

        before_photos_json = json.dumps(req.before_photos) if req.before_photos else "[]"

        cursor.execute("""
        INSERT INTO maintenance_records (
            id, road_segment_id, report_id, road_name, ward, title, description,
            maintenance_type, priority, inspection_status, repair_status,
            assigned_team, crew_leader, estimated_cost, actual_cost, start_date,
            target_completion_date, actual_completion_date, required_resources,
            notes, before_photos_json, after_photos_json, budget_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            mnt_id, seg_id, req.report_id or "", req.road_name, req.ward or "Municipal Ward",
            req.title, req.description or req.title, req.maintenance_type, req.priority,
            "Pending", "Scheduled", req.assigned_crew, req.crew_leader,
            req.estimated_cost, 0.0, req.start_date, req.target_completion_date, "",
            json.dumps(req.required_resources), req.notes, before_photos_json, "[]",
            "Within Allocation", now_str, now_str
        ))

        # If linked to a report, advance status to "Maintenance Planned"
        if req.report_id:
            cursor.execute("SELECT status_history FROM issue_reports WHERE id = ? OR report_code = ?", (req.report_id, req.report_id))
            rep_row = cursor.fetchone()
            if rep_row:
                hist = json.loads(rep_row["status_history"]) if rep_row["status_history"] else []
                hist.append({
                    "status": "Maintenance Planned",
                    "timestamp": now_str,
                    "updatedBy": "Municipal Authority Admin",
                    "notes": f"Maintenance activity {mnt_id} planned: {req.title} (Est. ${req.estimated_cost})"
                })
                cursor.execute("""
                UPDATE issue_reports
                SET status = 'Maintenance Planned', status_history = ?, updated_at = ?
                WHERE id = ? OR report_code = ?
                """, (json.dumps(hist), now_str, req.report_id, req.report_id))

        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user, action, details)
        VALUES (?, ?, ?, ?, ?)
        """, (
            f"LOG-{uuid.uuid4().hex[:12]}",
            now_str,
            "Municipal Authority Admin",
            "MAINTENANCE_CREATED",
            f"Created maintenance work order {mnt_id} for {req.road_name} ({req.maintenance_type}, Est: {req.estimated_cost})"
        ))

        conn.commit()

    return {
        "id": mnt_id,
        "segmentId": seg_id,
        "reportId": req.report_id or "",
        "roadName": req.road_name,
        "ward": req.ward or "Municipal Ward",
        "title": req.title,
        "description": req.description or req.title,
        "maintenanceType": req.maintenance_type,
        "priority": req.priority,
        "repairStatus": "Scheduled",
        "status": "Scheduled",
        "assignedCrew": req.assigned_crew,
        "crewLeader": req.crew_leader,
        "estimatedCost": req.estimated_cost,
        "startDate": req.start_date,
        "targetCompletionDate": req.target_completion_date,
        "requiredResources": req.required_resources or [],
        "notes": req.notes,
        "budgetStatus": "Within Allocation"
    }

@router.patch("/{maintenance_id}")
def update_maintenance(maintenance_id: str, req: UpdateMaintenanceRequest):
    """
    Updates maintenance progress, sets repair status (Pending, Approved, Scheduled, In Progress, Completed, On Hold),
    records actual costs and completion date.
    """
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM maintenance_records WHERE id = ?", (maintenance_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Maintenance record not found")

        curr = dict(row)
        new_status = req.repair_status or curr["repair_status"]
        actual_comp_date = curr["actual_completion_date"]

        if new_status == "Completed" and not actual_comp_date:
            actual_comp_date = req.actual_completion_date or datetime.now().strftime("%Y-%m-%d")
        elif req.actual_completion_date:
            actual_comp_date = req.actual_completion_date

        actual_cost = req.actual_cost if req.actual_cost is not None else curr.get("actual_cost")
        est_cost = float(curr.get("estimated_cost") or 0.0)

        # Recalculate budget status
        budget_status = curr.get("budget_status", "Within Allocation")
        if actual_cost and est_cost > 0:
            if actual_cost > est_cost * 1.1:
                budget_status = "Exceeded Estimate"
            elif actual_cost < est_cost * 0.9:
                budget_status = "Under Budget"
            else:
                budget_status = "Within Allocation"

        before_photos = json.dumps(req.before_photos) if req.before_photos is not None else curr.get("before_photos_json")
        after_photos = json.dumps(req.after_photos) if req.after_photos is not None else curr.get("after_photos_json")

        cursor.execute("""
        UPDATE maintenance_records
        SET repair_status = ?, inspection_status = COALESCE(?, inspection_status),
            actual_completion_date = ?, actual_cost = ?, budget_status = ?,
            notes = COALESCE(?, notes), before_photos_json = ?, after_photos_json = ?, updated_at = ?
        WHERE id = ?
        """, (
            new_status,
            req.inspection_status,
            actual_comp_date,
            actual_cost,
            budget_status,
            req.notes,
            before_photos,
            after_photos,
            now_str,
            maintenance_id
        ))

        # Update linked report status if applicable
        rep_id = curr.get("report_id")
        if rep_id:
            cursor.execute("SELECT status_history FROM issue_reports WHERE id = ? OR report_code = ?", (rep_id, rep_id))
            rep_row = cursor.fetchone()
            if rep_row:
                hist = json.loads(rep_row["status_history"]) if rep_row["status_history"] else []
                report_status = "In Progress" if new_status == "In Progress" else ("Resolved" if new_status == "Completed" else None)
                if report_status:
                    hist.append({
                        "status": report_status,
                        "timestamp": now_str,
                        "updatedBy": "Municipal Authority Admin",
                        "notes": f"Maintenance activity {maintenance_id} updated to {new_status}."
                    })
                    cursor.execute("""
                    UPDATE issue_reports
                    SET status = ?, status_history = ?, updated_at = ?
                    WHERE id = ? OR report_code = ?
                    """, (report_status, json.dumps(hist), now_str, rep_id, rep_id))

        # If maintenance is completed, improve the road segment condition score!
        if new_status == "Completed" and curr.get("road_segment_id"):
            seg_id = curr["road_segment_id"]
            cursor.execute("""
            UPDATE road_segments
            SET current_condition = 'Good',
                pci_score = MIN(100.0, pci_score + 35.0),
                risk_score = MAX(15.0, risk_score - 40.0),
                priority = 'Low',
                last_maintenance_date = ?,
                open_reports_count = MAX(0, open_reports_count - 1),
                updated_at = ?
            WHERE id = ?
            """, (actual_comp_date or datetime.now().strftime("%Y-%m-%d"), now_str, seg_id))

        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user, action, details)
        VALUES (?, ?, ?, ?, ?)
        """, (
            f"LOG-{uuid.uuid4().hex[:12]}",
            now_str,
            "Municipal Authority Admin",
            "MAINTENANCE_UPDATED",
            f"Maintenance {maintenance_id} updated to status {new_status} (Cost: {actual_cost})"
        ))

        conn.commit()

    return {
        "id": maintenance_id,
        "status": new_status,
        "repairStatus": new_status,
        "actualCompletionDate": actual_comp_date,
        "actualCost": actual_cost,
        "budgetStatus": budget_status,
        "notes": req.notes or curr.get("notes"),
        "updatedAt": now_str
    }
