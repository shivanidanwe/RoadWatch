from fastapi import APIRouter, HTTPException
import json
from pathlib import Path
from datetime import datetime

from backend.app.config import config, ARTIFACTS_DIR
from backend.app.ml.training import ModelTrainer
from backend.app.models.schemas import ModelMetricsResponse, ModelStatusResponse

router = APIRouter(prefix="/model", tags=["Model Governance"])

@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    """
    Returns empirical model evaluation metrics, test calibration, and feature importances.
    """
    metrics_path = ARTIFACTS_DIR / "metrics.json"
    if not metrics_path.exists():
        # Train model if not yet trained
        trainer = ModelTrainer()
        trainer.train_and_evaluate()

    try:
        with open(metrics_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read model metrics: {e}")

@router.get("/status", response_model=ModelStatusResponse)
def get_model_status():
    """
    Reports model artifact presence, version, and training status.
    Do not expose as trained unless a valid artifact exists.
    """
    artifact_exists = config.MODEL_ARTIFACT_PATH.exists()
    metrics_path = ARTIFACTS_DIR / "metrics.json"

    if not artifact_exists or not metrics_path.exists():
        return ModelStatusResponse(
            is_trained=False,
            version=config.MODEL_VERSION,
            algorithm="Scikit-Learn Random Forest Ensemble",
            last_trained="Never",
            sample_count=0,
            status="Artifact Missing — Retraining Required",
            artifact_path=str(config.MODEL_ARTIFACT_PATH)
        )

    try:
        with open(metrics_path, "r") as f:
            data = json.load(f)
        return ModelStatusResponse(
            is_trained=True,
            version=data.get("version", config.MODEL_VERSION),
            algorithm=data.get("algorithm", "RandomForest Ensemble"),
            last_trained=data.get("training_date", "Unknown"),
            sample_count=data.get("training_samples_count", 0),
            status="Production Active",
            artifact_path=str(config.MODEL_ARTIFACT_PATH.name)
        )
    except Exception as e:
        return ModelStatusResponse(
            is_trained=False,
            version=config.MODEL_VERSION,
            algorithm="Scikit-Learn Random Forest Ensemble",
            last_trained="Error",
            sample_count=0,
            status=f"Artifact Corrupt: {e}",
            artifact_path=str(config.MODEL_ARTIFACT_PATH)
        )

@router.post("/retrain")
def retrain_model():
    """
    Triggers reproducible retraining pipeline on Scikit-learn random forest ensemble.
    """
    trainer = ModelTrainer()
    metrics = trainer.train_and_evaluate()
    return {
        "message": "Retraining job completed successfully. Model artifact updated.",
        "metrics": metrics,
        "completed_at": datetime.now().isoformat()
    }
