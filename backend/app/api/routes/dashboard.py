from fastapi import APIRouter
from datetime import datetime
from typing import Dict, Any

from backend.app.database import db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary():
    """
    Returns real database statistics without hardcoded dummy numbers:
    - Total road reports
    - Critical-priority roads
    - Pending inspections
    - Repairs in progress
    - Total roads monitored
    - Average calculated risk score
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()

        # 1. Total Reports
        cursor.execute("SELECT COUNT(*) as cnt FROM issue_reports")
        total_reports = cursor.fetchone()["cnt"]

        # 2. Critical Roads
        cursor.execute("SELECT COUNT(*) as cnt FROM road_segments WHERE priority = 'Critical' OR risk_score >= 80.0")
        critical_roads = cursor.fetchone()["cnt"]

        # 3. Pending Inspections
        cursor.execute("SELECT COUNT(*) as cnt FROM inspections WHERE status IN ('Scheduled', 'Pending', 'In Progress')")
        pending_inspections = cursor.fetchone()["cnt"]

        # 4. Repairs in Progress
        cursor.execute("SELECT COUNT(*) as cnt FROM maintenance_records WHERE repair_status = 'In Progress'")
        repairs_in_progress = cursor.fetchone()["cnt"]

        # 5. Total Roads
        cursor.execute("SELECT COUNT(*) as cnt FROM road_segments")
        total_roads = cursor.fetchone()["cnt"]

        # 6. Average Risk Score
        cursor.execute("SELECT AVG(risk_score) as avg_score FROM road_segments")
        avg_row = cursor.fetchone()
        avg_risk_score = round(float(avg_row["avg_score"] or 0.0), 1)

        # 7. Recent Reports
        cursor.execute("SELECT id, road_name, category, severity, status, report_date FROM issue_reports ORDER BY report_date DESC LIMIT 5")
        recent_reports = [dict(r) for r in cursor.fetchall()]

    return {
        "totalReports": total_reports,
        "criticalPriorityRoads": critical_roads,
        "pendingInspections": pending_inspections,
        "repairsInProgress": repairs_in_progress,
        "totalRoads": total_roads,
        "avgRiskScore": avg_risk_score,
        "recentReports": recent_reports,
        "lastRefreshed": datetime.now().isoformat()
    }
