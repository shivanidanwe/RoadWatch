from fastapi import APIRouter
from backend.data.seed_data import seed_database, clear_database

router = APIRouter(prefix="", tags=["Seed & Reset"])

@router.post("/seed")
def seed_demo_data():
    """
    Populates database with at most three clearly labelled demonstration road records (Section 5.4).
    """
    seed_database()
    return {"status": "success", "message": "Loaded 3 demonstration road records and sample workflow tasks."}

@router.post("/reset")
def reset_to_empty():
    """
    Clears all operational records to demonstrate an empty database state (Section 5.8).
    """
    clear_database()
    return {"status": "success", "message": "Database cleared. Ready for fresh road report submissions."}
