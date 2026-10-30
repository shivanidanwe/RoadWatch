import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import config
from backend.data.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_municipal_tests():
    seed_database()

def test_admin_login_success():
    res = client.post("/api/auth/login", json={
        "email": config.INITIAL_ADMIN_EMAIL,
        "password": config.INITIAL_ADMIN_PASSWORD
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "Municipal Authority Admin"
    assert data["user"]["email"] == config.INITIAL_ADMIN_EMAIL.lower()

def test_admin_login_invalid_password():
    res = client.post("/api/auth/login", json={
        "email": config.INITIAL_ADMIN_EMAIL,
        "password": "WrongPassword123!"
    })
    assert res.status_code == 401

def test_admin_me_endpoint():
    # Login first
    login_res = client.post("/api/auth/login", json={
        "email": config.INITIAL_ADMIN_EMAIL,
        "password": config.INITIAL_ADMIN_PASSWORD
    })
    token = login_res.json()["access_token"]

    # Call /api/auth/me with bearer token
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["authenticated"] is True
    assert data["user"]["role"] == "Municipal Authority Admin"

def test_public_citizen_report_submission_and_tracking():
    # 1. Citizen submits report without logging in
    payload = {
        "road_name": "MG Road North Corridor",
        "area": "Ward 4 - Commercial Zone",
        "latitude": 12.9755,
        "longitude": 77.5985,
        "category": "Pothole",
        "severity": "Critical",
        "description": "Hazardous road crater measuring 15cm depth near bus terminal.",
        "reporter_name": "Concerned Citizen Meera",
        "reporter_contact": "meera@example.com"
    }
    submit_res = client.post("/api/public/reports", json=payload)
    assert submit_res.status_code == 201
    data = submit_res.json()
    assert data["success"] is True
    assert "complaintId" in data
    complaint_id = data["complaintId"]
    assert complaint_id.startswith("RW-2026-")
    assert data["status"] == "New"
    assert data["urgencyScore"] >= 75.0

    # 2. Citizen tracks complaint using reference number without login
    track_res = client.get(f"/api/public/reports/{complaint_id}")
    assert track_res.status_code == 200
    track_data = track_res.json()
    assert track_data["complaintId"] == complaint_id
    assert track_data["roadName"] == "MG Road North Corridor"
    assert track_data["area"] == "Ward 4 - Commercial Zone"
    assert track_data["category"] == "Pothole"
    assert track_data["status"] == "New"

def test_admin_verify_and_update_citizen_report():
    # 1. Submit citizen report
    payload = {
        "road_name": "Ring Road Sector 3",
        "area": "Ward 9 - Industrial",
        "latitude": 12.9300,
        "longitude": 77.6200,
        "category": "Surface damage",
        "severity": "High",
        "description": "Loose bitumen causing skidding risk."
    }
    sub_res = client.post("/api/public/reports", json=payload)
    complaint_id = sub_res.json()["complaintId"]

    # 2. Admin verifies the report
    verify_res = client.patch(f"/api/reports/{complaint_id}/verification", json={
        "verification_status": "Verified",
        "verified_by": "Municipal Authority Admin",
        "notes": "Verified by engineering drone survey. Distress confirmed."
    })
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["verificationStatus"] == "Verified"
    assert v_data["status"] == "Verified"

def test_complete_citizen_to_maintenance_lifecycle():
    # 1. Public submission
    sub_res = client.post("/api/public/reports", json={
        "road_name": "Sarjapur Link Road",
        "area": "Ward 14 - South Hub",
        "latitude": 12.9100,
        "longitude": 77.6400,
        "category": "Broken road",
        "severity": "Critical",
        "description": "Severe sub-base collapse across both lanes."
    })
    complaint_id = sub_res.json()["complaintId"]

    # 2. Admin creates inspection linked to complaint
    insp_res = client.post("/api/inspections", json={
        "road_name": "Sarjapur Link Road",
        "report_id": complaint_id,
        "ward": "Ward 14 - South Hub",
        "assigned_inspector": "Municipal Authority Admin",
        "scheduled_date": "2026-11-05",
        "type": "Damage Verification",
        "priority": "Critical",
        "notes": "Urgent engineering inspection for road foundation failure"
    })
    assert insp_res.status_code == 201
    insp_id = insp_res.json()["id"]

    # 3. Admin completes inspection
    insp_update_res = client.patch(f"/api/inspections/{insp_id}", json={
        "status": "Completed",
        "verified_condition": "Critical",
        "notes": "Foundation compromised. Immediate reconstruction recommended."
    })
    assert insp_update_res.status_code == 200

    # 4. Admin creates maintenance repair activity
    maint_res = client.post("/api/maintenance", json={
        "road_name": "Sarjapur Link Road",
        "report_id": complaint_id,
        "ward": "Ward 14 - South Hub",
        "title": "Sub-base Excavation and Pavement Reconstruction",
        "maintenance_type": "Reconstruction",
        "priority": "Critical",
        "assigned_crew": "Municipal Emergency Repair Unit",
        "crew_leader": "Supervisor Sharma",
        "estimated_cost": 85000.0,
        "start_date": "2026-11-06",
        "target_completion_date": "2026-11-12",
        "required_resources": ["Excavator", "Roller Compactor", "Hot-mix Asphalt"]
    })
    assert maint_res.status_code == 201
    maint_id = maint_res.json()["id"]

    # 5. Admin updates maintenance to 'In Progress'
    in_prog_res = client.patch(f"/api/maintenance/{maint_id}", json={
        "repair_status": "In Progress",
        "notes": "Excavator on-site, milling underway."
    })
    assert in_prog_res.status_code == 200
    assert in_prog_res.json()["repairStatus"] == "In Progress"

    # Check report status is updated to 'In Progress'
    rep_check = client.get(f"/api/public/reports/{complaint_id}")
    assert rep_check.json()["status"] == "In Progress"

    # 6. Admin marks maintenance as 'Completed'
    comp_res = client.patch(f"/api/maintenance/{maint_id}", json={
        "repair_status": "Completed",
        "actual_cost": 82000.0,
        "actual_completion_date": "2026-11-11",
        "notes": "Reconstruction completed ahead of schedule and quality tested."
    })
    assert comp_res.status_code == 200
    assert comp_res.json()["repairStatus"] == "Completed"

    # Check report status is updated to 'Resolved'
    rep_final = client.get(f"/api/public/reports/{complaint_id}")
    assert rep_final.json()["status"] == "Resolved"

def test_database_driven_dashboard_metrics():
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "totalReports" in data
    assert "pendingComplaints" in data
    assert "criticalPriorityRoads" in data
    assert "inspectionsScheduled" in data
    assert "repairsInProgress" in data
    assert "completedRepairs" in data
    assert "avgResolutionDays" in data
    assert data["totalReports"] >= 3
    assert data["completedRepairs"] >= 1

def test_database_driven_analytics():
    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "damageByCategory" in data
    assert "complaintsByLocality" in data
    assert "monthlyTrends" in data
    assert "priorityDistribution" in data
    assert "repairCompletionStats" in data
    assert "expenditure" in data
    assert data["expenditure"]["totalEstimated"] > 0

def test_csv_export():
    res = client.get("/api/reports/export/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "Complaint ID,Report Code,Road Name" in res.text
