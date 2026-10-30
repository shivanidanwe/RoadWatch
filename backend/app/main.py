import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from backend.app.config import config, ARTIFACTS_DIR
from backend.app.database import db
from backend.data.seed_data import seed_database
from backend.app.ml.training import ModelTrainer

from backend.app.api.routes.recommendations import router as recommendations_router
from backend.app.api.routes.predictions import router as predictions_router
from backend.app.api.routes.model import router as model_router
from backend.app.api.routes.scoring import router as scoring_router
from backend.app.api.routes.roads import router as roads_router
from backend.app.api.routes.reports import router as reports_router
from backend.app.api.routes.inspections import router as inspections_router
from backend.app.api.routes.maintenance import router as maintenance_router
from backend.app.api.routes.dashboard import router as dashboard_router
from backend.app.api.routes.analytics import router as analytics_router
from backend.app.api.routes.auth import router as auth_router
from backend.app.api.routes.public_reports import router as public_reports_router
from backend.app.api.routes.seed import router as seed_router
from fastapi.staticfiles import StaticFiles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("roadwatch")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure database initialized, seed data loaded if first run, model artifact trained if missing
    logger.info("Initializing RoadWatch Phase 3 Full End-to-End Engine...")
    
    # 1. Check if model artifact exists; if not, train it
    if not config.MODEL_ARTIFACT_PATH.exists() or not (ARTIFACTS_DIR / "metrics.json").exists():
        logger.info("Training initial Scikit-learn model artifact...")
        trainer = ModelTrainer()
        trainer.train_and_evaluate()
    
    # 2. Check if database has road segments; if not, seed minimal 3 demo records
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM road_segments")
        row = cursor.fetchone()
        cnt = row["cnt"] if isinstance(row, dict) or hasattr(row, "__getitem__") else row[0]
        if cnt == 0:
            logger.info("Seeding initial 3 demonstration road records...")
            seed_database()

    logger.info("RoadWatch Phase 3 Engine online and ready.")
    yield
    logger.info("RoadWatch Engine shutting down.")

app = FastAPI(
    title="RoadWatch — Predictive Road Maintenance & Recommendation API",
    description="Municipal Data Science & Real-Time End-to-End Recommendation Engine (Phase 3)",
    version="3.0.0",
    lifespan=lifespan
)

# CORS Middleware
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error in recommendation engine.", "error": str(exc)}
    )

# Health & Root Endpoint
@app.get("/", tags=["Health"])
def root():
    return {
        "service": "RoadWatch Recommendation & Machine Learning Engine",
        "phase": "Phase 3 — Real-Time End-to-End Integration",
        "version": "3.0.0",
        "status": "online",
        "endpoints": {
            "dashboard_summary": "/api/dashboard/summary",
            "reports": "/api/reports",
            "roads": "/api/roads",
            "recommendations": "/api/recommendations",
            "inspections": "/api/inspections",
            "maintenance": "/api/maintenance",
            "model_metrics": "/api/model/metrics",
            "scoring_config": "/api/scoring/config",
            "seed_demo_data": "/api/seed",
            "reset_data": "/api/reset"
        }
    }

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "model_artifact": config.MODEL_ARTIFACT_PATH.exists(),
        "database": True
    }

# Mount uploads directory for photographs
config.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(config.UPLOADS_DIR)), name="uploads")

# Include API routers
# Public & Auth routers
app.include_router(auth_router, prefix="/api")
app.include_router(public_reports_router, prefix="/api")

# Core module routers under /api, /api/admin, and /api/v1 for unified access
for prefix in ["/api", "/api/admin", "/api/v1"]:
    app.include_router(dashboard_router, prefix=prefix)
    app.include_router(reports_router, prefix=prefix)
    app.include_router(roads_router, prefix=prefix)
    app.include_router(recommendations_router, prefix=prefix)
    app.include_router(inspections_router, prefix=prefix)
    app.include_router(maintenance_router, prefix=prefix)
    app.include_router(analytics_router, prefix=prefix)
    app.include_router(predictions_router, prefix=prefix)
    app.include_router(model_router, prefix=prefix)
    app.include_router(scoring_router, prefix=prefix)
    app.include_router(seed_router, prefix=prefix)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
