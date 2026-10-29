import json
from datetime import datetime
from ..app.database import db
from ..app.recommendation.engine import RecommendationEngine
from ..app.ml.inference import ModelInference
from ..app.ml.feature_engineering import FeatureEngineer
import pandas as pd

# Keep at most three clearly labelled demonstration road records (Section 5.4 & 17)
DEMO_ROAD_SEGMENTS = [
    {
        "id": "RD-DEMO-01",
        "name": "Mahatma Gandhi Marg (Inner Ring) [Demo]",
        "ward": "Ward 4 - North Zone",
        "length_km": 4.8,
        "road_type": "Arterial",
        "surface_type": "Asphalt",
        "current_condition": "Critical",
        "pci_score": 32.0,
        "risk_score": 88.0,
        "priority": "Critical",
        "traffic_intensity": "Extreme High-Volume",
        "weather_exposure": "High Monsoon Flood Zone",
        "last_inspection_date": "2024-09-15",
        "next_inspection_date": "2024-10-30",
        "last_maintenance_date": "2023-04-12",
        "open_reports_count": 2,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "path_coordinates": json.dumps([[12.9680, 77.5910], [12.9716, 77.5946], [12.9750, 77.5980], [12.9790, 77.6020]]),
        "recommended_action": "Emergency deep milling, base stabilization & asphalt resurfacing",
        "recommendation_reason": "Extensive fatigue cracking combined with sub-base water saturation from heavy runoff under high transit load.",
        "notes": "Demonstration Record. High transit arterial corridor."
    },
    {
        "id": "RD-DEMO-02",
        "name": "Airport Expressway Corridor [Demo]",
        "ward": "Ward 8 - East District",
        "length_km": 6.2,
        "road_type": "Arterial",
        "surface_type": "Asphalt",
        "current_condition": "Poor",
        "pci_score": 48.0,
        "risk_score": 74.0,
        "priority": "High",
        "traffic_intensity": "Extreme High-Volume",
        "weather_exposure": "Moderate",
        "last_inspection_date": "2024-08-20",
        "next_inspection_date": "2024-11-05",
        "last_maintenance_date": "2022-11-10",
        "open_reports_count": 1,
        "latitude": 12.9592,
        "longitude": 77.6534,
        "path_coordinates": json.dumps([[12.9550, 77.6480], [12.9592, 77.6534], [12.9630, 77.6590]]),
        "recommended_action": "Structural overlay with polymer-modified binder & drainage ditch clearing",
        "recommendation_reason": "Wheel rutting exceeding 18mm with micro-cracking across heavy commercial vehicle lanes.",
        "notes": "Demonstration Record. High freight volume."
    },
    {
        "id": "RD-DEMO-03",
        "name": "Industrial Logistics Link [Demo]",
        "ward": "Ward 11 - South Hub",
        "length_km": 3.5,
        "road_type": "Sub-Arterial",
        "surface_type": "Bituminous Macadam",
        "current_condition": "Fair",
        "pci_score": 58.0,
        "risk_score": 52.0,
        "priority": "Medium",
        "traffic_intensity": "Heavy",
        "weather_exposure": "Moderate",
        "last_inspection_date": "2024-09-02",
        "next_inspection_date": "2024-11-15",
        "last_maintenance_date": "2023-01-18",
        "open_reports_count": 0,
        "latitude": 12.9121,
        "longitude": 77.6446,
        "path_coordinates": json.dumps([[12.9080, 77.6400], [12.9121, 77.6446], [12.9160, 77.6490]]),
        "recommended_action": "Selective pothole patching, edge reinforcement & seal coat application",
        "recommendation_reason": "Heavy multi-axle freight traffic causing minor edge breakdown and isolated roughness.",
        "notes": "Demonstration Record. Adjacent to manufacturing logistics zone."
    }
]

DEMO_REPORTS = [
    {
        "id": "REP-2024-001",
        "report_code": "REP-2024-001",
        "segment_id": "RD-DEMO-01",
        "road_name": "Mahatma Gandhi Marg (Inner Ring) [Demo]",
        "category": "Pothole",
        "severity": "Critical",
        "source": "Citizen App",
        "report_date": "2024-10-27 08:30",
        "status": "Reported",
        "priority_score": 88.0,
        "priority_level": "Critical",
        "assigned_team": "Central Road Maintenance Squad",
        "description": "Deep pothole cluster (depth > 12cm) in left lane causing tire damage and severe slowdowns.",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
        "reporter_name": "Priya Sharma",
        "reporter_contact": "priya.sharma@example.com",
        "verified_by": "",
        "status_history": json.dumps([
            {"status": "Reported", "timestamp": "2024-10-27 08:30", "updatedBy": "Citizen Portal"}
        ]),
        "created_at": "2024-10-27 08:30",
        "updated_at": "2024-10-27 08:30"
    },
    {
        "id": "REP-2024-002",
        "report_code": "REP-2024-002",
        "segment_id": "RD-DEMO-02",
        "road_name": "Airport Expressway Corridor [Demo]",
        "category": "Surface damage",
        "severity": "High",
        "source": "Municipal Patrol",
        "report_date": "2024-10-26 14:15",
        "status": "Inspection Scheduled",
        "priority_score": 74.0,
        "priority_level": "High",
        "assigned_team": "Expressway Patrol Unit",
        "description": "Asphalt rutting and longitudinal micro-cracks spreading along commercial freight lane.",
        "latitude": 12.9592,
        "longitude": 77.6534,
        "image_url": "https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=600&q=80",
        "reporter_name": "Officer Rajesh",
        "reporter_contact": "+91 98450 11234",
        "verified_by": "Er. Rajesh Verma",
        "status_history": json.dumps([
            {"status": "Reported", "timestamp": "2024-10-26 14:15", "updatedBy": "Patrol Officer"},
            {"status": "Inspection Scheduled", "timestamp": "2024-10-26 16:00", "updatedBy": "Chief Engineer Office"}
        ]),
        "created_at": "2024-10-26 14:15",
        "updated_at": "2024-10-26 16:00"
    }
]

DEMO_INSPECTIONS = [
    {
        "id": "INSP-2024-001",
        "segment_id": "RD-DEMO-02",
        "road_name": "Airport Expressway Corridor [Demo]",
        "ward": "Ward 8 - East District",
        "assigned_inspector": "Er. Rajesh Verma",
        "inspector_role": "Senior Pavement Quality Auditor",
        "scheduled_date": "2024-11-02",
        "type": "Structural Assessment",
        "priority": "High",
        "status": "Scheduled",
        "notes": "Verify asphalt rutting depth and subsurface stability.",
        "findings": json.dumps({
            "observedCondition": "Poor",
            "estimatedPci": 48,
            "structuralIntegrityScore": 60,
            "damageSpreadPercentage": 22,
            "drainageCondition": "Partially Blocked",
            "recommendedActions": ["Milling and resurfacing", "Clear culvert drains"],
            "summaryNotes": "Rut depth measured at 18mm under lane 2.",
            "completedAt": ""
        }),
        "created_at": "2024-10-26 16:00"
    }
]

DEMO_MAINTENANCE = [
    {
        "id": "MNT-2024-001",
        "road_segment_id": "RD-DEMO-01",
        "report_id": "REP-2024-001",
        "road_name": "Mahatma Gandhi Marg (Inner Ring) [Demo]",
        "ward": "Ward 4 - North Zone",
        "title": "Emergency Cold Asphalt Patching & Joint Seal",
        "maintenance_type": "Pothole Patching",
        "priority": "Critical",
        "inspection_status": "Completed",
        "repair_status": "In Progress",
        "assigned_team": "Rapid Response Paving Squad",
        "crew_leader": "Eng. Ramesh Nair",
        "estimated_cost": 45000.0,
        "start_date": "2024-10-28",
        "target_completion_date": "2024-10-31",
        "actual_completion_date": "",
        "required_resources": "Cold-mix asphalt, compacting roller, traffic cones",
        "notes": "Crew dispatched to fill critical pothole cluster.",
        "budget_status": "Within Allocation",
        "created_at": "2024-10-27 10:00",
        "updated_at": "2024-10-28 08:00"
    }
]

def clear_database():
    """Removes all operational records from database to provide an empty demonstration state."""
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM issue_reports")
        cursor.execute("DELETE FROM road_assessments")
        cursor.execute("DELETE FROM maintenance_records")
        cursor.execute("DELETE FROM inspections")
        cursor.execute("DELETE FROM road_predictions")
        cursor.execute("DELETE FROM road_segments")
        conn.commit()


def seed_database():
    """Seeds only the 3 clearly labelled demonstration roads and sample workflow records."""
    clear_database()
    now_str = datetime.now().isoformat()
    engine = RecommendationEngine()
    inference = ModelInference()
    fe = FeatureEngineer()

    with db.get_connection() as conn:
        cursor = conn.cursor()

        # 1. Insert 3 Demo Road Segments
        for r in DEMO_ROAD_SEGMENTS:
            cursor.execute("""
            INSERT INTO road_segments (
                id, name, ward, length_km, road_type, surface_type, current_condition,
                pci_score, risk_score, priority, traffic_intensity, weather_exposure,
                last_inspection_date, next_inspection_date, last_maintenance_date,
                open_reports_count, latitude, longitude, path_coordinates,
                recommended_action, recommendation_reason, notes, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r["id"], r["name"], r["ward"], r["length_km"], r["road_type"], r["surface_type"],
                r["current_condition"], r["pci_score"], r["risk_score"], r["priority"],
                r["traffic_intensity"], r["weather_exposure"], r["last_inspection_date"],
                r["next_inspection_date"], r["last_maintenance_date"], r["open_reports_count"],
                r["latitude"], r["longitude"], r["path_coordinates"], r["recommended_action"],
                r["recommendation_reason"], r["notes"], now_str
            ))

        # 2. Insert Reports
        for rep in DEMO_REPORTS:
            cursor.execute("""
            INSERT INTO issue_reports (
                id, report_code, segment_id, road_name, category, severity, source,
                report_date, status, priority_score, priority_level, assigned_team,
                description, latitude, longitude, image_url, reporter_name,
                reporter_contact, verified_by, status_history, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rep["id"], rep["report_code"], rep["segment_id"], rep["road_name"],
                rep["category"], rep["severity"], rep["source"], rep["report_date"],
                rep["status"], rep["priority_score"], rep["priority_level"],
                rep["assigned_team"], rep["description"], rep["latitude"], rep["longitude"],
                rep["image_url"], rep["reporter_name"], rep["reporter_contact"],
                rep["verified_by"], rep["status_history"], rep["created_at"], rep["updated_at"]
            ))

            # Also create road_assessment entry
            cursor.execute("""
            INSERT INTO road_assessments (
                id, report_id, road_segment_id, urgency_score, risk_category,
                recommended_action, explanation, factors_json, assessment_method,
                model_version, assessed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"ASM-{rep['id']}", rep["id"], rep["segment_id"], rep["priority_score"],
                rep["priority_level"], "Priority Inspection Scheduled",
                f"High priority assessment based on {rep['severity'].lower()} {rep['category'].lower()} on {rep['road_name']}.",
                json.dumps({"severity": rep["severity"], "category": rep["category"]}),
                "Rule-based", "v2.4", now_str
            ))

        # 3. Insert Inspections
        for ins in DEMO_INSPECTIONS:
            cursor.execute("""
            INSERT INTO inspections (
                id, segment_id, road_name, ward, assigned_inspector, inspector_role,
                scheduled_date, type, priority, status, notes, findings, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ins["id"], ins["segment_id"], ins["road_name"], ins["ward"],
                ins["assigned_inspector"], ins["inspector_role"], ins["scheduled_date"],
                ins["type"], ins["priority"], ins["status"], ins["notes"],
                ins["findings"], ins["created_at"]
            ))

        # 4. Insert Maintenance Records
        for mnt in DEMO_MAINTENANCE:
            cursor.execute("""
            INSERT INTO maintenance_records (
                id, road_segment_id, report_id, road_name, ward, title,
                maintenance_type, priority, inspection_status, repair_status,
                assigned_team, crew_leader, estimated_cost, start_date,
                target_completion_date, actual_completion_date, required_resources,
                notes, budget_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                mnt["id"], mnt["road_segment_id"], mnt["report_id"], mnt["road_name"],
                mnt["ward"], mnt["title"], mnt["maintenance_type"], mnt["priority"],
                mnt["inspection_status"], mnt["repair_status"], mnt["assigned_team"],
                mnt["crew_leader"], mnt["estimated_cost"], mnt["start_date"],
                mnt["target_completion_date"], mnt["actual_completion_date"],
                mnt["required_resources"], mnt["notes"], mnt["budget_status"],
                mnt["created_at"], mnt["updated_at"]
            ))

        # 5. Populate road_predictions table
        roads_df = pd.DataFrame(DEMO_ROAD_SEGMENTS)
        roads_df["last_maintenance_dt"] = pd.to_datetime(roads_df["last_maintenance_date"])
        roads_df["last_inspection_dt"] = pd.to_datetime(roads_df["last_inspection_date"])
        featured = fe.engineer_features(roads_df)

        for _, row in featured.iterrows():
            f_dict = row.to_dict()
            pred_risk, conf, mod_ver, is_model = inference.predict_segment(f_dict)
            rec = engine.evaluate_segment(f_dict, predicted_risk=pred_risk, model_confidence=conf, model_version=mod_ver)

            cursor.execute("""
            INSERT INTO road_predictions (
                segment_id, road_name, ward, urgency_score, risk_category, predicted_risk,
                confidence_score, uncertainty_margin, recommended_action, factors_json,
                explanation_json, model_version, scoring_version, scored_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rec.segment_id, rec.road_name, rec.ward, rec.urgency_score,
                rec.risk_category, rec.predicted_risk, rec.confidence_score,
                rec.uncertainty_margin, rec.recommended_action,
                json.dumps({k: v.model_dump() for k, v in rec.factors.items()}),
                json.dumps(rec.explanation.model_dump()),
                rec.model_version or "v2.4", "v2.4", now_str
            ))

        conn.commit()

def recalculate_all_recommendations():
    """Recalculates predictions and urgency assessments for all registered road segments."""
    engine = RecommendationEngine()
    inference = ModelInference()
    fe = FeatureEngineer()
    now_str = datetime.now().isoformat()

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM road_segments")
        rows = [dict(r) for r in cursor.fetchall()]
        if not rows:
            return

        roads_df = pd.DataFrame(rows)
        roads_df["last_maintenance_dt"] = pd.to_datetime(roads_df["last_maintenance_date"], errors="coerce")
        roads_df["last_inspection_dt"] = pd.to_datetime(roads_df["last_inspection_date"], errors="coerce")
        featured = fe.engineer_features(roads_df)

        cursor.execute("DELETE FROM road_predictions")
        for _, row in featured.iterrows():
            f_dict = row.to_dict()
            pred_risk, conf, mod_ver, is_model = inference.predict_segment(f_dict)
            rec = engine.evaluate_segment(f_dict, predicted_risk=pred_risk, model_confidence=conf, model_version=mod_ver)

            cursor.execute("""
            INSERT OR REPLACE INTO road_predictions (
                segment_id, road_name, ward, urgency_score, risk_category, predicted_risk,
                confidence_score, uncertainty_margin, recommended_action, factors_json,
                explanation_json, model_version, scoring_version, scored_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rec.segment_id, rec.road_name, rec.ward, rec.urgency_score,
                rec.risk_category, rec.predicted_risk, rec.confidence_score,
                rec.uncertainty_margin, rec.recommended_action,
                json.dumps({k: v.model_dump() for k, v in rec.factors.items()}),
                json.dumps(rec.explanation.model_dump()),
                rec.model_version or "v2.4", "v2.4", now_str
            ))
        conn.commit()

