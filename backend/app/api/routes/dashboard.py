from fastapi import APIRouter
from datetime import datetime
from typing import Dict, Any, List

from backend.app.database import db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary():
    """
    Computes real database statistics across municipal operations:
    - Total road reports
    - Pending complaints
    - Critical and high-priority roads
    - Inspections scheduled
    - Repairs in progress
    - Completed repairs
    - Average complaint resolution time (days)
    - Total roads monitored
    - Average calculated risk score
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()

        # 1. Total Road Reports
        cursor.execute("SELECT COUNT(*) as cnt FROM issue_reports")
        total_reports = cursor.fetchone()["cnt"]

        # 2. Pending Complaints (New, Reported, Under Review, Inspection Scheduled)
        cursor.execute("""
        SELECT COUNT(*) as cnt FROM issue_reports
        WHERE status IN ('New', 'Reported', 'Under Review', 'Inspection Scheduled')
        """)
        pending_complaints = cursor.fetchone()["cnt"]

        # 3. Critical and High-Priority Roads
        cursor.execute("""
        SELECT COUNT(*) as cnt FROM road_segments
        WHERE priority IN ('Critical', 'High') OR risk_score >= 60.0
        """)
        critical_high_roads = cursor.fetchone()["cnt"]

        # 4. Inspections Scheduled
        cursor.execute("""
        SELECT COUNT(*) as cnt FROM inspections
        WHERE status IN ('Scheduled', 'Pending')
        """)
        inspections_scheduled = cursor.fetchone()["cnt"]

        # 5. Repairs in Progress
        cursor.execute("""
        SELECT COUNT(*) as cnt FROM maintenance_records
        WHERE repair_status = 'In Progress'
        """)
        repairs_in_progress = cursor.fetchone()["cnt"]

        # 6. Completed Repairs
        cursor.execute("""
        SELECT COUNT(*) as cnt FROM maintenance_records
        WHERE repair_status = 'Completed'
        """)
        completed_repairs = cursor.fetchone()["cnt"]

        # 7. Real Average Resolution Time (in days)
        # Based on resolved reports or completed maintenance
        cursor.execute("""
        SELECT report_date, updated_at FROM issue_reports
        WHERE status IN ('Resolved', 'Completed')
        """)
        resolved_rows = cursor.fetchall()
        resolution_days: List[float] = []
        for row in resolved_rows:
            try:
                dt_rep = datetime.strptime(row["report_date"][:16], "%Y-%m-%d %H:%M")
                dt_res = datetime.strptime(row["updated_at"][:16], "%Y-%m-%d %H:%M")
                diff = max(0.1, (dt_res - dt_rep).total_seconds() / 86400.0)
                resolution_days.append(diff)
            except Exception:
                continue

        if resolution_days:
            avg_res_days = round(sum(resolution_days) / len(resolution_days), 1)
        else:
            avg_res_days = 0.0

        # 8. Total Roads Monitored
        cursor.execute("SELECT COUNT(*) as cnt FROM road_segments")
        total_roads = cursor.fetchone()["cnt"]

        # 9. Average Risk Score
        cursor.execute("SELECT AVG(risk_score) as avg_score FROM road_segments")
        avg_row = cursor.fetchone()
        avg_risk_score = round(float(avg_row["avg_score"] or 0.0), 1)

        # 10. Recent Reports
        cursor.execute("""
        SELECT id, report_code, road_name, area, category, severity, status, report_date
        FROM issue_reports
        ORDER BY report_date DESC
        LIMIT 6
        """)
        recent_reports = []
        for row in cursor.fetchall():
            r = dict(row)
            recent_reports.append({
                "id": r["id"],
                "reportCode": r.get("report_code") or r["id"],
                "roadName": r["road_name"],
                "area": r.get("area") or "Municipal Ward",
                "category": r["category"],
                "severity": r["severity"],
                "status": r["status"],
                "reportDate": r["report_date"]
            })

    return {
        "totalReports": total_reports,
        "pendingComplaints": pending_complaints,
        "criticalPriorityRoads": critical_high_roads,
        "criticalAndHighRoads": critical_high_roads,
        "inspectionsScheduled": inspections_scheduled,
        "pendingInspections": inspections_scheduled,
        "repairsInProgress": repairs_in_progress,
        "completedRepairs": completed_repairs,
        "avgResolutionDays": avg_res_days,
        "totalRoads": total_roads,
        "avgRiskScore": avg_risk_score,
        "recentReports": recent_reports,
        "lastRefreshed": datetime.now().isoformat()
    }
