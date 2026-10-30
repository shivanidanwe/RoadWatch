from fastapi import APIRouter, Query
from datetime import datetime
from typing import Dict, Any, List, Optional

from backend.app.database import db

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_analytics(
    area: Optional[str] = Query(None, description="Filter by locality or ward"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Returns database-driven analytical metrics for municipal decision making:
    - Damage by category
    - Complaints by locality
    - Monthly report trends
    - Priority distribution
    - Repair completion statistics
    - Frequently damaged roads
    - Maintenance expenditure
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()

        # Build base filter for reports
        report_filter = " WHERE 1=1"
        report_params = []
        if area and area != "ALL":
            report_filter += " AND (area LIKE ? OR road_name LIKE ?)"
            report_params.extend([f"%{area}%", f"%{area}%"])
        if start_date:
            report_filter += " AND report_date >= ?"
            report_params.append(start_date)
        if end_date:
            report_filter += " AND report_date <= ?"
            report_params.append(f"{end_date} 23:59")

        # 1. Road Damage by Category
        cursor.execute(f"""
        SELECT category, COUNT(*) as cnt
        FROM issue_reports
        {report_filter}
        GROUP BY category
        ORDER BY cnt DESC
        """, report_params)
        damage_by_category = [{"category": r["category"], "count": r["cnt"]} for r in cursor.fetchall()]

        # 2. Complaints by Locality / Ward
        cursor.execute(f"""
        SELECT COALESCE(NULLIF(area, ''), 'Unspecified Locality') as loc, COUNT(*) as cnt
        FROM issue_reports
        {report_filter}
        GROUP BY loc
        ORDER BY cnt DESC
        LIMIT 10
        """, report_params)
        complaints_by_locality = [{"locality": r["loc"], "count": r["cnt"]} for r in cursor.fetchall()]

        # 3. Monthly Report Trends
        cursor.execute(f"""
        SELECT SUBSTR(report_date, 1, 7) as month_str, COUNT(*) as cnt
        FROM issue_reports
        {report_filter}
        GROUP BY month_str
        ORDER BY month_str ASC
        """, report_params)
        monthly_trends = [{"month": r["month_str"], "count": r["cnt"]} for r in cursor.fetchall()]

        # 4. Priority Distribution
        cursor.execute(f"""
        SELECT priority_level, COUNT(*) as cnt
        FROM issue_reports
        {report_filter}
        GROUP BY priority_level
        ORDER BY cnt DESC
        """, report_params)
        priority_dist = [{"priority": r["priority_level"], "count": r["cnt"]} for r in cursor.fetchall()]

        # 5. Repair Completion Statistics
        cursor.execute("""
        SELECT repair_status, COUNT(*) as cnt
        FROM maintenance_records
        GROUP BY repair_status
        """)
        repair_stats_map = {r["repair_status"]: r["cnt"] for r in cursor.fetchall()}
        repair_stats = {
            "completed": repair_stats_map.get("Completed", 0),
            "inProgress": repair_stats_map.get("In Progress", 0),
            "scheduled": repair_stats_map.get("Scheduled", 0),
            "pending": repair_stats_map.get("Pending", 0),
            "approved": repair_stats_map.get("Approved", 0),
            "onHold": repair_stats_map.get("On Hold", 0)
        }

        # 6. Frequently Damaged Roads
        cursor.execute(f"""
        SELECT road_name, COUNT(*) as cnt, MAX(priority_level) as highest_priority
        FROM issue_reports
        {report_filter}
        GROUP BY road_name
        ORDER BY cnt DESC
        LIMIT 6
        """, report_params)
        frequent_roads = [{"roadName": r["road_name"], "reportCount": r["cnt"], "priority": r["highest_priority"]} for r in cursor.fetchall()]

        # 7. Maintenance Expenditure
        cursor.execute("""
        SELECT SUM(estimated_cost) as total_est, SUM(actual_cost) as total_act,
               maintenance_type, COUNT(*) as cnt
        FROM maintenance_records
        GROUP BY maintenance_type
        """)
        exp_by_type = []
        total_estimated = 0.0
        total_actual = 0.0
        for r in cursor.fetchall():
            est = float(r["total_est"] or 0.0)
            act = float(r["total_act"] or 0.0)
            total_estimated += est
            total_actual += act
            exp_by_type.append({
                "type": r["maintenance_type"],
                "estimatedCost": est,
                "actualCost": act,
                "count": r["cnt"]
            })

        # 8. Resolution Time Average
        cursor.execute("""
        SELECT report_date, updated_at FROM issue_reports
        WHERE status IN ('Resolved', 'Completed')
        """)
        res_rows = cursor.fetchall()
        days_list = []
        for row in res_rows:
            try:
                d1 = datetime.strptime(row["report_date"][:16], "%Y-%m-%d %H:%M")
                d2 = datetime.strptime(row["updated_at"][:16], "%Y-%m-%d %H:%M")
                days_list.append(max(0.1, (d2 - d1).total_seconds() / 86400.0))
            except Exception:
                pass
        avg_resolution_days = round(sum(days_list) / len(days_list), 1) if days_list else 0.0

    return {
        "damageByCategory": damage_by_category,
        "complaintsByLocality": complaints_by_locality,
        "monthlyTrends": monthly_trends,
        "priorityDistribution": priority_dist,
        "repairCompletionStats": repair_stats,
        "frequentlyDamagedRoads": frequent_roads,
        "expenditure": {
            "totalEstimated": total_estimated,
            "totalActual": total_actual,
            "byType": exp_by_type
        },
        "avgResolutionDays": avg_resolution_days,
        "generatedAt": datetime.now().isoformat()
    }
