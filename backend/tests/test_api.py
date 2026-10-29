import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.data.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_test_db():
    seed_database()

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] is True

def test_get_recommendations_list():
    res = client.get("/api/recommendations")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "items" in data
    assert len(data["items"]) > 0
    # Ranked order check: first item score >= second item score
    if len(data["items"]) >= 2:
        assert data["items"][0]["urgency_score"] >= data["items"][1]["urgency_score"]

def test_get_recommendation_by_id_found():
    res = client.get("/api/recommendations")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) > 0
    seg_id = items[0]["segment_id"]

    res_single = client.get(f"/api/recommendations/{seg_id}")
    assert res_single.status_code == 200
    data = res_single.json()
    assert data["segment_id"] == seg_id
    assert "factors" in data
    assert "explanation" in data

def test_get_recommendation_by_id_404():
    res = client.get("/api/recommendations/RD-NONEXISTENT-999")
    assert res.status_code == 404

def test_get_predictions_list():
    res = client.get("/api/predictions")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "segmentId" in data[0]
    assert "riskScore" in data[0]
    assert "factors" in data[0]

def test_submit_report_and_calculate_priority():
    payload = {
        "road_name": "Residency Road Junction",
        "latitude": 12.9720,
        "longitude": 77.5950,
        "category": "Pothole",
        "severity": "Critical",
        "description": "Severe crater in middle lane causing extreme hazard to two-wheelers.",
        "reporter_name": "Citizen Ravi",
        "reporter_contact": "ravi@example.com",
        "source": "Citizen App"
    }
    res = client.post("/api/reports", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["roadName"] == "Residency Road Junction"
    assert data["status"] == "Reported"
    assert data["priorityScore"] >= 70.0  # Critical pothole must yield high/critical score
    assert data["priority"] in ["Critical", "High"]
    assert "urgent" in data["recommendedAction"].lower() or "inspection" in data["recommendedAction"].lower()
    assert "explanation" in data

    # Verify report is retrievable
    rep_id = data["id"]
    get_res = client.get(f"/api/reports/{rep_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == rep_id

def test_update_report_status():
    # First submit report
    payload = {
        "road_name": "Brigade Road Crossing",
        "latitude": 12.9730,
        "longitude": 77.5960,
        "category": "Surface damage",
        "severity": "High",
        "description": "Asphalt peeling off after storm.",
        "reporter_name": "Patrol Officer",
        "source": "Municipal Patrol"
    }
    res = client.post("/api/reports", json=payload)
    assert res.status_code == 201
    rep_id = res.json()["id"]

    # Advance status to Inspection Scheduled
    patch_res = client.patch(f"/api/reports/{rep_id}/status", json={
        "status": "Inspection Scheduled",
        "verified_by": "Er. Rajesh Verma",
        "notes": "Assigned to Ward 4 inspection crew."
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Inspection Scheduled"
    assert len(patch_res.json()["statusHistory"]) >= 2

def test_dashboard_summary():
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "totalReports" in data
    assert "criticalPriorityRoads" in data
    assert "pendingInspections" in data
    assert "repairsInProgress" in data
    assert "totalRoads" in data
    assert "avgRiskScore" in data
    assert data["totalRoads"] > 0
    assert data["totalReports"] > 0

def test_inspections_crud():
    # Create inspection
    create_res = client.post("/api/inspections", json={
        "segment_id": "RD-DEMO-01",
        "road_name": "Mahatma Gandhi Marg (Inner Ring) [Demo]",
        "ward": "Ward 4 - North Zone",
        "assigned_inspector": "Er. Meena Nair",
        "scheduled_date": "2024-11-10",
        "type": "Structural Assessment",
        "priority": "Critical",
        "notes": "Audit pothole cluster repair effectiveness"
    })
    assert create_res.status_code == 201
    insp_id = create_res.json()["id"]

    # Update inspection
    update_res = client.patch(f"/api/inspections/{insp_id}", json={
        "status": "Completed",
        "notes": "Field inspection finalized.",
        "findings": {"observedCondition": "Fair", "estimatedPci": 65}
    })
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Completed"

def test_maintenance_crud():
    create_res = client.post("/api/maintenance", json={
        "segment_id": "RD-DEMO-02",
        "road_name": "Airport Expressway Corridor [Demo]",
        "ward": "Ward 8 - East District",
        "title": "Milling and Polymer Resurfacing",
        "maintenance_type": "Resurfacing",
        "priority": "High",
        "assigned_crew": "Highway Squadron Alpha",
        "crew_leader": "Supervisor Anand",
        "estimated_cost": 95000.0,
        "start_date": "2024-11-12",
        "target_completion_date": "2024-11-20",
        "required_resources": ["Milling vehicle", "Asphalt paver"],
        "notes": "Re-level lane 2 rutting"
    })
    assert create_res.status_code == 201
    mnt_id = create_res.json()["id"]

    update_res = client.patch(f"/api/maintenance/{mnt_id}", json={
        "repair_status": "Completed",
        "notes": "Work completed and inspected."
    })
    assert update_res.status_code == 200
    assert update_res.json()["repairStatus"] == "Completed"

def test_get_model_metrics():
    res = client.get("/api/model/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "accuracy" in data
    assert "f1_score" in data
    assert "feature_importance" in data
    assert data["training_samples_count"] > 0

def test_get_model_status():
    res = client.get("/api/model/status")
    assert res.status_code == 200
    data = res.json()
    assert data["is_trained"] is True
    assert data["status"] == "Production Active"

def test_get_scoring_config():
    res = client.get("/api/scoring/config")
    assert res.status_code == 200
    data = res.json()
    assert "active_weights" in data
    assert "thresholds" in data
    assert data["thresholds"]["critical_min"] == 80.0

def test_patch_scoring_config_valid():
    payload = {
        "damage_severity": 0.40,
        "recent_report_frequency": 0.20,
        "traffic_intensity": 0.15,
        "weather_exposure": 0.15,
        "time_since_last_repair": 0.05,
        "historical_deterioration": 0.05,
        "updated_by": "Test Administrator",
        "reason": "Calibrating monsoon distress priority"
    }
    res = client.patch("/api/scoring/config", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert pytest.approx(sum(data["active_weights"].values()), 0.001) == 1.0

def test_patch_scoring_config_invalid_negative_weight():
    payload = {
        "damage_severity": -0.20
    }
    res = client.patch("/api/scoring/config", json=payload)
    assert res.status_code in (400, 422)

def test_patch_scoring_config_invalid_thresholds():
    payload = {
        "critical_min": 30.0,
        "high_min": 70.0  # Invalid: high > critical
    }
    res = client.patch("/api/scoring/config", json=payload)
    assert res.status_code == 400

def test_seed_and_reset_endpoints():
    # Test reset to empty
    res_reset = client.post("/api/reset")
    assert res_reset.status_code == 200
    assert "cleared" in res_reset.json()["message"].lower()

    summary_empty = client.get("/api/dashboard/summary").json()
    assert summary_empty["totalReports"] == 0
    assert summary_empty["totalRoads"] == 0

    # Test seed back to 3 demo roads
    res_seed = client.post("/api/seed")
    assert res_seed.status_code == 200
    summary_seeded = client.get("/api/dashboard/summary").json()
    assert summary_seeded["totalRoads"] == 3
    assert summary_seeded["totalReports"] == 2
